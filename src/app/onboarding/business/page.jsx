'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import GstToggle from "@/components/onboarding/GstToggle";
import GstLookupCard from "@/components/onboarding/GstLookupCard";
import GstResultPreview from "@/components/onboarding/GstResultPreview";
import BusinessDetailsForm from "@/components/onboarding/BusinessDetailsForm";
import StepTransition from "@/components/onboarding/StepTransition";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function OnboardingBusinessPage() {
  const router = useRouter();

  // Onboarding internal flow state:
  // 1 -> choose GST or not
  // 2 -> verify GSTIN (if yes chosen)
  // 3 -> complete business profile details
  const [subStep, setSubStep] = useState(1);
  const [gstOption, setGstOption] = useState(null); // 'yes' | 'no'
  const [gstDetails, setGstDetails] = useState(null);

  const handleOptionSelect = (option) => {
    setGstOption(option);
    if (option === "yes") {
      setSubStep(2);
    } else {
      setGstDetails(null);
      setSubStep(3);
    }
  };

  const handleGstVerified = (details) => {
    setGstDetails(details);
    setSubStep(3);
  };

  const handleBack = () => {
    if (subStep === 2) {
      setSubStep(1);
      setGstOption(null);
    } else if (subStep === 3) {
      if (gstOption === "yes") {
        setSubStep(2);
        setGstDetails(null);
      } else {
        setSubStep(1);
        setGstOption(null);
      }
    }
  };

  return (
    <OnboardingShell activeStep={2}>
      <div className="relative">
        {/* Back navigation button inside shell content */}
        {subStep > 1 && (
          <button
            onClick={handleBack}
            className="absolute -top-3 -left-3 md:-left-5 p-1 rounded-full text-slate-400 hover:text-primary transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="pt-2">
          <AnimatePresence mode="wait">
            {subStep === 1 && (
              <StepTransition stepKey="step-selection">
                <GstToggle value={gstOption} onChange={handleOptionSelect} />
              </StepTransition>
            )}

            {subStep === 2 && (
              <StepTransition stepKey="step-gst-verification">
                <GstLookupCard onGstVerified={handleGstVerified} />
              </StepTransition>
            )}

            {subStep === 3 && (
              <StepTransition stepKey="step-business-form">
                <div className="space-y-6">
                  {gstOption === "yes" && gstDetails && (
                    <GstResultPreview
                      gstDetails={gstDetails}
                      onReset={() => {
                        setSubStep(2);
                        setGstDetails(null);
                      }}
                    />
                  )}
                  <BusinessDetailsForm
                    gstDetails={gstDetails}
                    onCompleted={() => router.push("/onboarding/warehouse")}
                  />
                </div>
              </StepTransition>
            )}
          </AnimatePresence>
        </div>
      </div>
    </OnboardingShell>
  );
}
