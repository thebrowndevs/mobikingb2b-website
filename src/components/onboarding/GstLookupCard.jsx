import React, { useState, useEffect, useRef } from "react";
import { checkDuplicateApi, verifyGstApi } from "@/lib/services/operations/OnboardingApi";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldCheck, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function GstLookupCard({ onGstVerified }) {
  const { accessToken } = useAuth();
  const [gstin, setGstin] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const debounceRef = useRef(null);

  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setGstin(val);
    setDuplicateError("");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (val.length === 15) {
      // Debounce duplicate check
      setIsCheckingDuplicate(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await checkDuplicateApi({ gstin: val }, accessToken);
          if (res.exists) {
            setDuplicateError("This GSTIN is already registered with another account.");
          } else {
            setDuplicateError("");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingDuplicate(false);
        }
      }, 500);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (gstin.length !== 15) {
      toast.error("GSTIN must be exactly 15 characters long");
      return;
    }
    if (duplicateError) {
      toast.error(duplicateError);
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyGstApi(gstin, accessToken);
      if (data) {
        onGstVerified(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tighter">
          Enter your 15-Digit GSTIN
        </h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Enter your GSTIN number to search records and pre-fill your business details.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gstin" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            GSTIN Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                id="gstin"
                value={gstin}
                onChange={handleGstinChange}
                maxLength={15}
                required
                placeholder="e.g. 07AAAAA1111A1Z1"
                className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-base font-medium placeholder:text-slate-400 transition-all duration-150 uppercase"
              />
              {isCheckingDuplicate && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Loader2 size={18} className="animate-spin text-slate-400" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={gstin.length !== 15 || !!duplicateError || isCheckingDuplicate || isVerifying}
              className="rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 flex items-center justify-center gap-1.5 shrink-0"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify GSTIN</span>
              )}
            </button>
          </div>

          {duplicateError && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-red-600 mt-1">
              <XCircle size={16} />
              <span>{duplicateError}</span>
            </div>
          )}

          {!duplicateError && gstin.length === 15 && !isCheckingDuplicate && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 mt-1">
              <ShieldCheck size={16} />
              <span>GSTIN is available for registration.</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
