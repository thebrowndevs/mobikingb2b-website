"use client";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import AddressForm from "@/components/AddressForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  getAddressesApi,
  deleteAddressApi,
} from "@/lib/services/operations/AddressApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LABEL_TYPES = [
  { value: "home", label: "Home", emoji: "🏠" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "other", label: "Other", emoji: "📍" },
];

export default function AddressPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyAddedAddressId, setNewlyAddedAddressId] = useState(null);
  const { user, accessToken } = useAuth();

  // const phoneNumber = user?.phoneNo || "";

  const fetchAddresses = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const addressesData = await getAddressesApi(accessToken);
      setAddresses(addressesData);
    } catch (error) {
      toast.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (newlyAddedAddressId) {
      const timer = setTimeout(() => setNewlyAddedAddressId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedAddressId]);

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddressApi(addressToDelete._id, accessToken);
      // toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleAddressChange = () => {
    // Check if a new address was added to trigger the blink animation
    if (!addressToEdit) {
      // Temporarily set a flag or rely on a slight delay for the fetch
      // A more direct way is to compare old and new address lists after fetch
    }
    fetchAddresses();
  };

  const handleAddClick = () => {
    setAddressToEdit(null);
    setIsOpen(true);
  };

  const handleEditClick = (address) => {
    setAddressToEdit(address);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-start items-center">
        <Button onClick={handleAddClick} className="gap-2">
          <Plus size={16} strokeWidth={2} />
          <span>Add New Address</span>
        </Button>
      </div>
      <Separator />
      {addresses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No addresses found</h3>
          <p className="mt-1 text-muted-foreground">
            Add a new address to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card
              key={address._id}
              className={`flex flex-col ${address._id === newlyAddedAddressId ? "animate-highlight" : ""
                }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {LABEL_TYPES.find((l) => l.value === address.label)?.emoji}
                  </span>
                  <h3 className="font-medium capitalize text-lg">
                    {address.label}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground flex-grow">
                <p className="font-semibold text-foreground">
                  {address.fullName}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} - {address.pinCode}
                </p>
                {/* <p className="pt-2">
                  <span className="font-medium">Mobile:</span>{" "}
                  {phoneNumber || "Not provided"}
                </p> */}
              </CardContent>
              <CardFooter className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditClick(address)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAddressToDelete(address)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <AddressForm
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setAddressToEdit(null);
        }}
        onAddressChange={handleAddressChange}
        addressToEdit={addressToEdit}
      />
      <AlertDialog
        open={!!addressToDelete}
        onOpenChange={(isOpen) => !isOpen && setAddressToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this address. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
