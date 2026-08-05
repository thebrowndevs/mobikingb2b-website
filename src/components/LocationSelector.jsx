"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  Circle,
  Home,
  Briefcase,
  Building,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";

// Your Custom Components & Services
import AddressForm from "@/components/AddressForm"; // Assuming this path is correct
import { useAuth } from "@/context/AuthContext";
import {
  getAddressesApi,
  deleteAddressApi,
} from "@/lib/services/operations/AddressApi"; // Assuming this path is correct
import { toast } from "sonner";

// Helper for Address Labels/Icons
const getLabelInfo = (label) => {
  switch (label) {
    case "home":
      return { Icon: Home, text: "Home" };
    case "work":
      return { Icon: Briefcase, text: "Work" };
    default:
      return { Icon: Building, text: "Other" };
  }
};

export default function LocationSelector() {
  const { accessToken } = useAuth();

  // State for the main popover
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // State for the AddressForm modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Data and loading states
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // State for editing and deleting
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // State for the "blink" animation
  const [newlyAddedAddressId, setNewlyAddedAddressId] = useState(null);

  const fetchAddresses = useCallback(
    async (isNewAddressFlow = false, newAddress) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const addressesData = await getAddressesApi(accessToken);
        setAddresses(addressesData);

        // Logic to select an address
        if (isNewAddressFlow && newAddress?._id) {
          // If a new address was just added, select it
          setSelectedAddressId(newAddress._id);
          setNewlyAddedAddressId(newAddress._id);
        } else if (!selectedAddressId && addressesData.length > 0) {
          // If no address is selected, select the first one by default
          setSelectedAddressId(addressesData[0]._id);
        } else if (addressesData.length === 0) {
          // If there are no addresses, clear selection
          setSelectedAddressId(null);
        }
      } catch (error) {
        toast.error("Failed to fetch addresses");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, selectedAddressId]
  );

  // Initial fetch
  useEffect(() => {
    fetchAddresses();
  }, [accessToken]); // Removed fetchAddresses from dependency array to prevent loops

  // Timer to remove blink effect
  useEffect(() => {
    if (newlyAddedAddressId) {
      const timer = setTimeout(() => setNewlyAddedAddressId(null), 2500); // Increased duration
      return () => clearTimeout(timer);
    }
  }, [newlyAddedAddressId]);

  const handleAddressChange = async (newAddressData) => {
    // This function is called from AddressForm after an address is saved.
    // We re-fetch all addresses to get the latest list.
    await fetchAddresses(true, newAddressData); // Pass a flag to select the new one
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddressApi(addressToDelete._id, accessToken);
      toast.success("Address deleted successfully");
      if (selectedAddressId === addressToDelete._id) {
        setSelectedAddressId(null); // Clear selection if the deleted one was selected
      }
      fetchAddresses(); // Re-fetch
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleAddNewClick = () => {
    setAddressToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (address, e) => {
    e.stopPropagation(); // Prevent the address from being selected
    setAddressToEdit(address);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (address, e) => {
    e.stopPropagation();
    setAddressToDelete(address);
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setIsPopoverOpen(false); // Close popover on selection
  };

  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors h-10 px-3 rounded-lg"
          >
            <MapPin
              size={16}
              className="text-primary transition-transform group-hover:scale-110"
            />
            <div className="text-left">
              <span className="font-semibold text-foreground block -mb-1">
                {loading
                  ? "Loading..."
                  : selectedAddress
                  ? getLabelInfo(selectedAddress.label).text
                  : "Select Location"}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {selectedAddress
                  ? `${selectedAddress.city}, ${selectedAddress.state}`
                  : "No address selected"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <h4 className="font-semibold">Select Your Address</h4>
            <p className="text-sm text-muted-foreground">
              Choose where to deliver your order.
            </p>
          </div>
          <Separator />

          <div className="p-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 px-4">
                <p className="text-sm text-muted-foreground">
                  No addresses found. Add one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {addresses.map((address) => {
                  const { Icon } = getLabelInfo(address.label);
                  const isSelected = address._id === selectedAddressId;
                  const isNew = address._id === newlyAddedAddressId;
                  return (
                    <div
                      key={address._id}
                      onClick={() => handleSelectAddress(address._id)}
                      className={`flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all duration-300 ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                      } ${isNew ? "animate-highlight" : ""}`}
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 font-semibold">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{address.fullName}</span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">
                          {address.street}, {address.city}, {address.pinCode}
                        </p>
                      </div>
                      {/* <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleEditClick(address, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => handleDeleteClick(address, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div> */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* <Separator /> */}
          {/* <div className="p-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAddNewClick}
            >
              <Plus size={16} /> Add New Address
            </Button>
          </div> */}
        </PopoverContent>
      </Popover>

      {/* --- MODALS --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addressToEdit ? "Edit Address" : "Add a New Address"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. This will be used for your order
              delivery.
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            onClose={() => setIsFormOpen(false)}
            onAddressChange={handleAddressChange}
            addressToEdit={addressToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!addressToDelete}
        onOpenChange={(isOpen) => !isOpen && setAddressToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
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
    </>
  );
}
