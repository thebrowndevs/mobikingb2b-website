'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { onboardingStep, refreshOnboardingStatus } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      let currentStep = onboardingStep;
      if (currentStep === null) {
        currentStep = await refreshOnboardingStatus();
      }

      if (currentStep === 0) {
        router.replace("/onboarding/business");
      } else if (currentStep === 1) {
        router.replace("/onboarding/warehouse");
      } else {
        router.replace("/");
      }
    };

    handleRedirect();
  }, [onboardingStep, refreshOnboardingStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <Loader2 className="animate-spin text-primary mx-auto" size={32} />
        <p className="text-sm font-semibold text-slate-500">Loading your setup...</p>
      </div>
    </div>
  );
}
