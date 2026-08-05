"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoLogoGooglePlaystore, IoLogoApple } from "react-icons/io5";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.mobiking.wholesale";
const APP_STORE_URL = "https://apps.apple.com/in/app/mobiking/id6752223367";

export default function AppRedirectPage() {
  const [statusText, setStatusText] = useState("Detecting your device...");
  const [showManualLinks, setShowManualLinks] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      setStatusText("Redirecting to App Store...");
      window.location.href = APP_STORE_URL;
    } else if (isAndroid) {
      setStatusText("Redirecting to Play Store...");
      window.location.href = PLAY_STORE_URL;
    } else {
      // Laptop/Desktop/Other: Show options manually
      setStatusText("Choose your platform below to download");
      setShowManualLinks(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background grid/gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        
        {/* App Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-1.5 bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-inner">
            <Image
              src="/miniLogo.png"
              height={120}
              width={120}
              alt="Mobiking Logo"
              className="h-20 w-auto rounded-xl"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">
          Mobiking Wholesale
        </h1>
        
        <p className="text-slate-400 text-sm mb-8">
          Get the official app for a faster, safer, and premium wholesale experience.
        </p>

        {/* Loader or Status message */}
        <div className="flex flex-col items-center justify-center min-h-[80px] mb-6">
          {!showManualLinks && (
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          )}
          <p className="text-slate-300 font-medium text-sm">
            {statusText}
          </p>
        </div>

        {/* Manual selection buttons */}
        <div className="space-y-4">
          {showManualLinks ? (
            <>
              <Button
                onClick={() => window.location.href = PLAY_STORE_URL}
                className="w-full py-4 h-auto bg-sky-600 hover:bg-sky-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
              >
                <IoLogoGooglePlaystore className="h-6 w-6" />
                <span className="text-left font-medium">
                  Get it on Google Play
                </span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                onClick={() => window.location.href = APP_STORE_URL}
                className="w-full py-4 h-auto bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
              >
                <IoLogoApple className="h-6 w-6" />
                <span className="text-left font-medium">
                  Download on App Store
                </span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </>
          ) : (
            <button 
              onClick={() => setShowManualLinks(true)} 
              className="text-xs text-slate-500 hover:text-sky-400 underline transition-colors"
            >
              Not redirecting? Click here to select manually.
            </button>
          )}
        </div>

        {/* Ratings Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-300">4.8+ Rating</span>
          </div>
          <span>Rated by 10k+ businesses</span>
        </div>

      </div>
    </div>
  );
}
