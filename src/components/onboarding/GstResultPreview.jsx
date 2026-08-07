import React from "react";
import { CheckCircle2, RotateCcw, Building2 } from "lucide-react";

export default function GstResultPreview({ gstDetails, onReset }) {
  const { tradeName, legalName, taxpayerType, constitution, registrationDate, gstinStatus } = gstDetails;

  return (
    <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 size={22} className="fill-emerald-500 text-white" />
          <h4 className="font-bold text-base tracking-tight">GSTIN Verified Successfully</h4>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer border-0 bg-transparent p-0"
        >
          <RotateCcw size={14} />
          <span>Change GSTIN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-emerald-100/50 pt-4 text-sm font-semibold text-slate-500">
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">Trade Name</span>
          <span className="text-slate-800 font-bold text-base block mt-0.5">{tradeName || legalName}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">Legal Name</span>
          <span className="text-slate-700 block mt-0.5">{legalName}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">Taxpayer Type</span>
          <span className="text-slate-700 block mt-0.5">{taxpayerType}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">Business Constitution</span>
          <span className="text-slate-700 block mt-0.5">{constitution}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">Registration Date</span>
          <span className="text-slate-700 block mt-0.5">{registrationDate}</span>
        </div>
        <div>
          <span className="text-[11px] uppercase text-slate-400 block tracking-wider">GSTIN Status</span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 inline-block mt-0.5 text-xs font-bold">
            {gstinStatus || "Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
