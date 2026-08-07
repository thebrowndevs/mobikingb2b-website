import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, Building2, MapPin, Phone, Mail, Edit3, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import GstLookupCard from "@/components/onboarding/GstLookupCard";
import { updateGstDetailsApi } from "@/lib/services/operations/OnboardingApi";
import { toast } from "sonner";

export default function BusinessProfile() {
  const { user, accessToken, updateUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const business = user?.business || {};
  const isGstVerified = !!business.gstVerified;
  const isVerified = !!business.verified;
  
  const handleGstVerified = async (gstData) => {
    setIsUpdating(true);
    try {
      const res = await updateGstDetailsApi({
        gstin: gstData.gstin,
        gstData: gstData.rawSnapshot
      }, accessToken);

      if (res?.business) {
        // Update user state locally
        const updatedUser = {
          ...user,
          business: res.business
        };
        updateUser(updatedUser);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const address = business.regsiteredAddress || {};

  return (
    <div className="space-y-6">
      
      {/* Verification Status Header Card */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border bg-slate-50 border-slate-100">
            {isVerified ? (
              <ShieldCheck className="text-emerald-500" size={24} />
            ) : (
              <ShieldAlert className="text-amber-500" size={24} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-lg">
                {business.businessName || "No Business Name Added"}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isVerified 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}>
                {isVerified ? "Verified B2B Account" : "Pending Verification"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
              {isGstVerified 
                ? `GSTIN: ${business.gstNumber}`
                : "Manual profile setup. Verify GST for premium trade permissions."}
            </p>
          </div>
        </div>

        {!isGstVerified && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 shadow-sm"
          >
            Add GSTIN
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sourcing details info card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={18} className="text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Sourcing Contacts</h4>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-500">
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Business Phone</span>
                <span className="text-slate-700 block mt-0.5">{business.businessPhone || "Not Provided"}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Business Email</span>
                <span className="text-slate-700 block mt-0.5">{business.businessEmail || "Not Provided"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Billing Address info card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin size={18} className="text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Registered Office</h4>
          </div>

          <div className="space-y-1 text-xs font-semibold text-slate-600">
            {address.street ? (
              <>
                <p className="font-bold text-slate-800 text-sm">{address.street}</p>
                {address.street2 && <p>{address.street2}</p>}
                <p>{address.city}, {address.state} - {address.pinCode}</p>
                <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold mt-1.5">{address.country}</p>
              </>
            ) : (
              <p className="text-slate-400 font-medium">No registered office billing address filled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Verification modal for GST */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="lg:max-w-md w-full rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 tracking-tighter">Add GST Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verify your business GSTIN to automatically upgrade your account verification status.
            </DialogDescription>
          </DialogHeader>

          {isUpdating ? (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="animate-spin text-primary mx-auto" size={28} />
              <p className="text-xs font-semibold text-slate-500">Updating business record...</p>
            </div>
          ) : (
            <div className="pt-2">
              <GstLookupCard onGstVerified={handleGstVerified} />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
