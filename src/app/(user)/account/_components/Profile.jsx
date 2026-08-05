"use client";

import React, { useState } from "react";
import { Phone, User, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { deleteProfile, updateProfile } from "@/lib/services/operations/LoginApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const { accessToken, user, setUser, setAccessToken } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNo || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile({ name: data?.name, email: data?.email }, accessToken);
      if (result) {
        setUser(result);
        toast.success("Profile updated successfully");
        localStorage.setItem("user", JSON.stringify(result));
      }
    } catch (error) {
      toast.error("Failed to update Profile");
    } finally {
      setLoading(false);
    }
  };

  // ---- Delete account flow ----
  const [openConfirm, setOpenConfirm] = useState(false); // first simple confirm dialog
  const [openTypeToDelete, setOpenTypeToDelete] = useState(false); // second dialog with input
  const [confirmInput, setConfirmInput] = useState("");
  const expectedPhrase = "Delete my account"; // user must type this exactly
  const [deleting, setDeleting] = useState(false);

  const handleStartDelete = () => {
    // open first dialog
    setOpenConfirm(true);
  };

  const handleConfirmProceed = () => {
    // user confirmed first dialog, open the type-to-delete dialog
    setOpenConfirm(false);
    setConfirmInput("");
    setOpenTypeToDelete(true);
  };

  const handleCancelAll = () => {
    setOpenConfirm(false);
    setOpenTypeToDelete(false);
    setConfirmInput("");
  };

  const handleDeleteAccount = async () => {
    // only call if input matches expectedPhrase
    if (confirmInput !== expectedPhrase) return;
    setDeleting(true);
    try {
      // Example API call - replace the URL/path with your actual delete endpoint
      await deleteProfile(accessToken);

      // clear local state / auth
      setUser(null);
      try { localStorage.removeItem("user"); } catch (e) {}
      try { localStorage.removeItem("accessToken"); } catch (e) {}

      toast.success("Your account has been deleted");
      setOpenTypeToDelete(false);

      // redirect to home (you mentioned you'll redirect to home)
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">Name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">Valid email is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              readOnly
              {...register("phone")}
              className="cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              {/* small line for delete account */}
              <button
                type="button"
                onClick={handleStartDelete}
                className="text-sm underline hover:text-red-600"
              >
                Want to delete your account?
              </button>
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>

      {/* First confirmation dialog */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              Do you want to delete your account on Mobiking Wholesale? All of your
              data will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelAll}>Cancel</Button>
            <Button onClick={handleConfirmProceed} className="ml-2">Yes, proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second dialog: type-to-confirm */}
      <Dialog open={openTypeToDelete} onOpenChange={setOpenTypeToDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogDescription>
              To permanently delete your account type exactly: <strong>{expectedPhrase}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            <Label>Delete my account</Label>
            <Input
              placeholder={`Type: ${expectedPhrase}`}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              You must type the exact phrase to enable the <em>Delete account</em> button.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelAll}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={confirmInput !== expectedPhrase || deleting}
              className="ml-2"
            >
              {deleting ? "Deleting..." : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
