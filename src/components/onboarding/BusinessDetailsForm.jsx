import React, { useState, useEffect, useRef } from "react";
import { checkDuplicateApi, saveBusinessDetailsApi } from "@/lib/services/operations/OnboardingApi";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ContextualTooltip from "./ContextualTooltip";

export default function BusinessDetailsForm({ gstDetails, onCompleted }) {
  const { accessToken, refreshOnboardingStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(gstDetails?.tradeName || gstDetails?.legalName || "");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  const [street, setStreet] = useState(gstDetails?.principalAddress?.street || "");
  const [street2, setStreet2] = useState(gstDetails?.principalAddress?.street2 || "");
  const [city, setCity] = useState(gstDetails?.principalAddress?.city || "");
  const [state, setState] = useState(gstDetails?.principalAddress?.state || "");
  const [pinCode, setPinCode] = useState(gstDetails?.principalAddress?.pinCode || "");
  const [country, setCountry] = useState("India");

  // Duplicate check for Business Name (Manual path only)
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameWarning, setNameWarning] = useState("");
  const debounceRef = useRef(null);

  const isGstVerified = !!gstDetails;

  const handleNameChange = (e) => {
    if (isGstVerified) return; // Locked
    const val = e.target.value;
    setBusinessName(val);
    setNameWarning("");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (val.trim().length >= 3) {
      setIsCheckingName(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await checkDuplicateApi({ businessName: val.trim() }, accessToken);
          if (res.exists) {
            setNameWarning("A business with this name already exists. Try adding a city name or suffix to make it unique.");
          } else {
            setNameWarning("");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingName(false);
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !pinCode.trim()) {
      toast.error("Please fill in all address details");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        businessName: businessName.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim(),
        registeredAddress: {
          street: street.trim(),
          street2: street2.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
          country: country.trim()
        }
      };

      if (isGstVerified) {
        payload.gstNumber = gstDetails.gstin;
        payload.gstData = gstDetails.rawSnapshot;
      }

      const res = await saveBusinessDetailsApi(payload, accessToken);
      if (res) {
        await refreshOnboardingStatus();
        onCompleted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tighter">
          {isGstVerified ? "Confirm Sourcing Details" : "Enter Sourcing Profile"}
        </h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          {isGstVerified
            ? "Your GST data is loaded below. Complete business contact details to save."
            : "Provide your registered trade name, email, and billing office address."}
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="businessName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Business trade name
            </label>
            <ContextualTooltip content="Registered name of your store or wholesale firm as per certificates." />
          </div>
          <div className="relative">
            <input
              type="text"
              id="businessName"
              required
              readOnly={isGstVerified}
              value={businessName}
              onChange={handleNameChange}
              placeholder="e.g. Chauhan Traders"
              className={`w-full border rounded-xl px-4 py-3 outline-none text-base font-medium transition-all duration-150 ${isGstVerified
                  ? "bg-slate-100/80 border-slate-200 text-slate-500 select-none cursor-not-allowed font-semibold"
                  : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-slate-800 placeholder:text-slate-400"
                }`}
            />
            {isCheckingName && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </div>
            )}
          </div>
          {nameWarning && (
            <div className="flex items-start gap-1.5 text-sm font-semibold text-amber-700 mt-1">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{nameWarning}</span>
            </div>
          )}
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessPhone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Business phone <span className="normal-case font-medium text-slate-400">(optional)</span>
            </label>
            <input
              type="tel"
              id="businessPhone"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              placeholder="Store contact number"
              className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessEmail" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Business email <span className="normal-case font-medium text-slate-400">(optional)</span>
            </label>
            <input
              type="email"
              id="businessEmail"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="billing@yourfirm.com"
              className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
            />
          </div>
        </div>

        {/* Registered Address */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Billing Address
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="street" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Building, Street / Floor
            </label>
            <input
              type="text"
              id="street"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Flat/House No., Building Name, Street Name"
              className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="street2" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Locality, Landmark <span className="normal-case font-medium text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              id="street2"
              value={street2}
              onChange={(e) => setStreet2(e.target.value)}
              placeholder="e.g. Near SARITA VIHAR Metro"
              className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                City / District
              </label>
              <input
                type="text"
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City Name"
                className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="state" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                State
              </label>
              <input
                type="text"
                id="state"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State Name"
                className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pinCode" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Postal Code (PIN)
              </label>
              <input
                type="text"
                id="pinCode"
                required
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit ZIP code"
                className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="country" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Country
              </label>
              <input
                type="text"
                id="country"
                required
                disabled
                value={country}
                className="w-full border border-slate-200 bg-slate-100/85 text-slate-400 rounded-xl px-4 py-3 outline-none text-base font-semibold select-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isCheckingName}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-3.5 text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Saving details...</span>
          </>
        ) : (
          <span>Save & Continue</span>
        )}
      </button>
    </form>
  );
}
