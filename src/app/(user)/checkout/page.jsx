"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CheckoutPageV1 from "./CheckoutPageV1";
import CheckoutPageV2 from "./CheckoutPageV2";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isLoading, onboardingStep } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (onboardingStep !== null && onboardingStep < 2) {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, isLoading, onboardingStep, router]);

  if (isLoading || !isAuthenticated || (onboardingStep !== null && onboardingStep < 2)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-sm font-semibold text-slate-500">Verifying B2B profile...</p>
        </div>
      </div>
    );
  }

  // To toggle between V1 (Original Razorpay Overlay) and V2 (Unified gateway routing),
  // comment / uncomment the lines below:

  // return <CheckoutPageV1 />;
  return <CheckoutPageV2 />;
}
