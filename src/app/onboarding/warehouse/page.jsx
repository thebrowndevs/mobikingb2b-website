'use client';

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import WarehouseForm from "@/components/onboarding/WarehouseForm";

export default function OnboardingWarehousePage() {
  const router = useRouter();

  return (
    <OnboardingShell activeStep={3}>
      <WarehouseForm onCompleted={() => router.push("/onboarding/complete")} />
    </OnboardingShell>
  );
}
