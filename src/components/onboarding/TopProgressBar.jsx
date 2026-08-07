import React from "react";

export default function TopProgressBar({ activeStep = 1 }) {
  // We have 4 steps total (Account=1, Business=2, Warehouse=3, Complete=4)
  const totalSteps = 4;
  const percentage = ((activeStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full bg-slate-100 py-3 px-4 border-b border-slate-200">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex-grow">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1">
            <span className="text-slate-800">
              {activeStep === 2
                ? "Step 2: Business Profile"
                : activeStep === 3
                ? "Step 3: Primary Warehouse"
                : activeStep === 4
                ? "Step 4: Done"
                : "Step 1: Account setup"}
            </span>
            <span>{Math.round(percentage)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
