import React from "react";
import { CheckCircle2, ShieldCheck, HelpCircle, FileText, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function GstToggle({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tighter">
          Do you have a GSTIN number?
        </h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Select your registration status to proceed with business profile verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Yes option */}
        <button
          type="button"
          onClick={() => onChange("yes")}
          className={clsx(
            "flex gap-4 items-start text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white",
            value === "yes"
              ? "border-primary bg-slate-50/20 ring-4 ring-slate-100"
              : "border-slate-150 hover:border-slate-350 hover:bg-slate-50/30"
          )}
        >
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
              value === "yes" ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-slate-500"
            )}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Yes, I have a GSTIN</h4>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-semibold">
              Verify instantly. We will auto-fill your business details and trade name directly from tax records.
            </p>
          </div>
        </button>

        {/* No option */}
        <button
          type="button"
          onClick={() => onChange("no")}
          className={clsx(
            "flex gap-4 items-start text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white",
            value === "no"
              ? "border-primary bg-slate-50/20 ring-4 ring-slate-100"
              : "border-slate-150 hover:border-slate-350 hover:bg-slate-50/30"
          )}
        >
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
              value === "no" ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-slate-500"
            )}
          >
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">No, I don't have GSTIN</h4>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-semibold">
              Fill details manually. Our team will verify your business profile post-onboarding before order dispatch.
            </p>
          </div>
        </button>
      </div>

      <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3.5 mt-2">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-amber-700 font-semibold leading-relaxed">
          <strong>Important Note:</strong> Unverified non-GST accounts can browse the wholesale catalog but cannot add items to cart or proceed to checkout until manual verification.
        </p>
      </div>
    </div>
  );
}
