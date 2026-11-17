"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import CheckoutPageV1 from "./CheckoutPageV1";
import CheckoutPageV2 from "./CheckoutPageV2";
import { Loader2 } from "lucide-react";
import { checkBusinessVerification } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, onboardingStep } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (onboardingStep !== null && onboardingStep < 2) {
        router.replace("/onboarding");
      } else {
        const { isVerified } = checkBusinessVerification(user);
        if (!isVerified) {
          toast.error("Your business profile is pending verification. Cannot place order.");
          router.replace("/");
        }
      }
    }
  }, [isAuthenticated, isLoading, onboardingStep, user, router]);

  const { isVerified } = checkBusinessVerification(user);

  if (isLoading || !isAuthenticated || (onboardingStep !== null && onboardingStep < 2) || !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-sm font-semibold text-slate-500">Verifying B2B profile...</p>
        </div>
      </div>
    );
  }

  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mx-auto" size={32} />
      </div>
    }>
      <CheckoutPageV2 />
    </React.Suspense>
  );
}
