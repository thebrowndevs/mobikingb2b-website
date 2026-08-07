'use client';

import React from "react";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";

export default function OnboardingCompletePage() {
  return (
    <OnboardingShell activeStep={4}>
      <OnboardingComplete />
    </OnboardingShell>
  );
}
