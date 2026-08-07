import React, { useState } from "react";
import { addAddressApi } from "@/lib/services/operations/AddressApi";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Warehouse } from "lucide-react";
import { toast } from "sonner";

export default function WarehouseForm({ onCompleted }) {
  const { accessToken, refreshOnboardingStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Address states
  const [street, setStreet] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!street.trim() || !city.trim() || !state.trim() || !pinCode.trim()) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        label: "Primary Warehouse",
        street: street.trim(),
        street2: street2.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        country: country.trim(),
        isDefault: true
      };

      const res = await addAddressApi(payload, accessToken);
      if (res) {
        await refreshOnboardingStatus();
        toast.success("Primary warehouse address added!");
        onCompleted();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to add warehouse address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-4">
          <Warehouse size={22} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tighter">
          Add Primary Warehouse Address
        </h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Enter the physical delivery address where your wholesale orders will be dispatched.
        </p>
      </div>

      <div className="space-y-4">
        {/* Street */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="street" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Building Name, Street / Floor
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

        {/* Street 2 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="street2" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Locality, Landmark <span className="normal-case font-medium text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            id="street2"
            value={street2}
            onChange={(e) => setStreet2(e.target.value)}
            placeholder="e.g. Near Sarita Vihar Metro Station"
            className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150"
          />
        </div>

        {/* City and State */}
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

        {/* Postal Code and Country */}
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-3.5 text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Adding warehouse...</span>
          </>
        ) : (
          <span>Add Warehouse & Finish</span>
        )}
      </button>
    </form>
  );
}
