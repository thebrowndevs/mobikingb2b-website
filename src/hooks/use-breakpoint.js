"use client";

import { useState, useEffect } from "react";

// This is the default 'lg' breakpoint from Tailwind/shadcn
const LG_BREAKPOINT = 1024;
const TB_BREAKPOINT = 640;

export const useBreakpoint = () => {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTab, setIsTab] = useState(true);

  useEffect(() => {
    // This function will only run on the client side
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
      setIsTab(window.innerWidth >= TB_BREAKPOINT);
    };

    // Check on initial mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return { isDesktop, isTab };
};