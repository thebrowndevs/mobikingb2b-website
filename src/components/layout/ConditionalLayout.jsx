'use client';

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, onboardingStep } = useAuth();
  const isIsolatedPage = pathname?.startsWith("/onboarding") || pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!isLoading && isAuthenticated && onboardingStep !== null && onboardingStep < 2) {
      const isStatic = pathname === "/about-us" || pathname === "/contact";
      if (!isIsolatedPage && !isStatic) {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, isLoading, onboardingStep, isIsolatedPage, pathname, router]);

  if (isIsolatedPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col justify-between">
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}
