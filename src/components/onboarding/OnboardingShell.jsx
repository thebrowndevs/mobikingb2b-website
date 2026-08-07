import React from "react";
import SidebarProgress from "./SidebarProgress";
import TopProgressBar from "./TopProgressBar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingShell({ children, activeStep = 2 }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F6F6] text-slate-800">

      {/* Left panel - Desktop Sidebar (visible on desktop) */}
      <div className="hidden lg:block lg:w-[350px] bg-[#0D0F12] border-r border-slate-900/60 p-8 h-screen sticky top-0 shrink-0 select-none">
        <SidebarProgress activeStep={activeStep} />
      </div>

      {/* Main layout wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Header - Mobile progress & exit control */}
        <div className="lg:hidden shrink-0">
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <img src="/miniLogo.png" alt="logo" className="h-7 w-7" />
              <span className="font-bold text-sm tracking-tighter text-slate-800">Mobiking B2B</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors border-0 bg-transparent p-0 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
          <TopProgressBar activeStep={activeStep} />
        </div>

        {/* Desktop Header panel */}
        <div className="hidden lg:flex justify-end items-center px-12 py-4 bg-white border-b border-slate-150 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors border-0 bg-transparent p-0 cursor-pointer"
          >
            <LogOut size={15} />
            <span>Save & Exit</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-2xl bg-white border border-slate-150 rounded-2xl p-6 md:p-10 shadow-none">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
