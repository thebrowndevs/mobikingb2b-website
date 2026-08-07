import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const steps = [
  { id: 1, title: "Account Verified", desc: "Phone authentication" },
  { id: 2, title: "Business Profile", desc: "GSTIN or manual details" },
  { id: 3, title: "Primary Warehouse", desc: "Dispatch & billing address" },
  { id: 4, title: "Funnel Complete", desc: "Access wholesale store" },
];

export default function SidebarProgress({ activeStep = 1 }) {
  return (
    <div className="flex flex-col justify-between h-full text-slate-300">
      <div>
        <div className="flex items-center gap-2 mb-12">
          <img src="/miniLogo.png" alt="logo" className="h-9 w-9 brightness-0 invert" />
          <span className="font-bold text-lg tracking-tighter text-white">Mobiking B2B</span>
        </div>

        <div className="space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = idx + 1 < activeStep;
            const isActive = idx + 1 === activeStep;

            return (
              <div key={step.id} className="flex gap-4 items-start relative">
                {/* Step Connector Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={clsx(
                      "absolute left-[17px] top-[36px] w-[2px] h-[calc(100%+16px)] bg-slate-800",
                      isCompleted && "bg-emerald-500"
                    )}
                  />
                )}

                {/* Step Indicator Dot */}
                <div
                  className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-sm transition-all duration-300",
                    isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                    isActive && "bg-white border-white text-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.25)]",
                    !isCompleted && !isActive && "border-slate-800 bg-slate-950 text-slate-600"
                  )}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                </div>

                <div>
                  <h4
                    className={clsx(
                      "font-bold text-base leading-tight transition-colors duration-300",
                      isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800/50 rounded-xl p-3.5">
          <ShieldCheck className="text-sky-400 shrink-0" size={18} />
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Your business details are protected using industry-grade SSL encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
