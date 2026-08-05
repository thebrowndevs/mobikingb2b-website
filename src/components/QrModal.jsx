"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { IoLogoGooglePlaystore, IoLogoApple } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function QrModal() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only run on the homepage
    if (pathname !== "/") return;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Open after 10 seconds instead of immediately
    const timeoutId = setTimeout(() => {
      setOpen(true);
    }, 10000); // 10 seconds

    // Re-open every 5 minutes (300000 ms)
    const intervalId = setInterval(() => setOpen(true), 5 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [pathname]);


  // utils inside your component file (or import them)
  const PLAY_WEB = "https://play.google.com/store/apps/details?id=com.mobiking.wholesale";
  const IOS_WEB = "https://apps.apple.com/in/app/mobiking/id6752223367";

  function isEmbeddedBrowser() {
    const ua = navigator.userAgent || navigator.vendor || "";
    // common in-app browser signatures
    return /(FBAN|FBAV|Instagram|Line|Twitter|Pinterest|WhatsApp|LinkedIn|Snapchat|Discord|Messenger)/i.test(ua);
  }

  /**
   * Try to open in Chrome using an intent that targets Chrome package.
   * This attempts to hand the URL to Chrome specifically (may open Play Store
   * or browser). Not guaranteed to work in all in-app browsers.
   */
  function openInChromeIntent(url) {
    // Use Chrome intent format; browser_fallback_url ensures fallback to https if Chrome can't handle
    const encoded = encodeURIComponent(url);
    const intentUrl = `intent://#Intent;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encoded};package=com.android.chrome;end`;
    // Assign location (better than window.open for intent URIs)
    window.location.href = intentUrl;
  }

  /**
   * Try multiple programmatic methods to open externally. Returns a Promise
   * that resolves true if we attempted a method (not a guarantee it opened externally).
   */
  function tryOpenExternal(url) {
    return new Promise((resolve) => {
      // 1) If Android and Chrome likely present, try the chrome intent first
      const isAndroid = /android/i.test(navigator.userAgent || "");
      if (isAndroid) {
        try {
          openInChromeIntent(url);
          // Give the intent a short time to resolve; this is best-effort
          setTimeout(() => resolve(true), 800);
          return;
        } catch (e) {
          // fallthrough
        }
      }

      // 2) Try window.open (new tab)
      try {
        const newWin = window.open(url, "_blank", "noopener,noreferrer");
        if (newWin) {
          // Some in-app browsers will return a window object even if they won't open externally.
          resolve(true);
          return;
        }
      } catch (e) {
        // fallthrough
      }

      // 3) Try same-tab navigation (more reliable for intents/redirects)
      try {
        window.location.href = url;
        resolve(true);
        return;
      } catch (e) {
        // fallthrough
      }

      // 4) Nothing worked programmatically
      resolve(false);
    });
  }
  const handleDownload = async (os) => {
    const url = os === "ios" ? IOS_WEB : PLAY_WEB;

    // If we detect an embedded/in-app browser, prefer the "open external" flow
    if (isEmbeddedBrowser()) {
      // Try programmatic attempts first
      const attempted = await tryOpenExternal(url);

      if (!attempted) {
        // fallback UX: copy link and show a friendly prompt
        try {
          await navigator.clipboard.writeText(url);
          alert(`This in-app browser can't open the ${os === "ios" ? "App Store" : "Play Store"}. Link copied — open your device browser and paste the link.`);
        } catch (err) {
          // Clipboard may be blocked — show the link and simple instructions
          alert(`Please open this link in your device browser:\n\n${url}\n\n(Use 'Open in Browser' from the in-app browser menu)`);
        }
      }

      setOpen(false);
      return;
    }

    // Not an embedded browser: normal open (same-tab for Android, new tab for iOS if you prefer)
    const isAndroid = /android/i.test(navigator.userAgent || "");
    if (isAndroid) {
      // same-tab to let Chrome do the intent->Play flow without producing unknown-scheme errors
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  };


  // Mobile Drawer Content
  const MobileDrawer = () => (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="px-6 pb-8 pt-4 max-h-[85vh]">

        <DrawerHeader className="px-0 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src={'/miniLogo.png'}
              height={400}
              width={400}
              alt="logo"
              className="h-28 w-auto"
            />
          </div>
          <DrawerTitle className="text-xl font-semibold text-gray-900">
            Get Our Latest App!
          </DrawerTitle>
          <DrawerDescription className="text-gray-600 mt-0">
            Download the latest version of Mobiking Wholesale App!
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 mt-2">
          {platform === "ios" ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={() => handleDownload("ios")}
                className="w-full py-3 h-auto bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 rounded-xl"
              >
                <div className="flex items-center justify-center w-full">
                  <IoLogoApple className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Download on App Store</div>
                    <div className="text-xs text-gray-400">Available for iOS</div>
                  </div>
                </div>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={() => handleDownload("android")}
                className="w-full py-3 h-auto bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 rounded-xl"
              >
                <div className="flex items-center justify-center w-full">
                  <IoLogoGooglePlaystore className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Update Now!</div>
                    <div className="text-xs text-gray-400">Download for Android</div>
                  </div>
                </div>
              </Button>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>Rated 4.8+ on both stores</span>
          </div>
          <p className="text-xs text-gray-400">
            Faster, safer, and better experience
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );

  // Desktop Dialog Content
  const DesktopDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-md lg:max-w-lg border-0">

        <div className="flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-gray-100">
          {/* Left Section - App Info */}
          <div className="lg:w-2/5 p-6 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-200">
            <Image
              src={'/miniLogo.png'}
              height={400}
              width={400}
              alt="logo"
              className="h-28 w-auto"
            />
            <h3 className="font-semibold text-gray-900 mb-2">Mobiking Wholesale App</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enhanced mobile experience
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span>4.8+ Rating</span>
            </div>
          </div>

          {/* Right Section - QR Code */}
          <div className="lg:w-3/5 p-6 flex flex-col items-center justify-center">
            <DialogHeader className="mb-4 text-center">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Scan to Download
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Point your camera at the QR code
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <Image
                src="/qr-code.png"
                alt="Download the App QR Code"
                width={160}
                height={160}
                className="rounded"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("android")}
                className="text-xs"
              >
                <IoLogoGooglePlaystore className="h-3 w-3 mr-1" />
                Android
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("ios")}
                className="text-xs"
              >
                <IoLogoApple className="h-3 w-3 mr-1" />
                iOS
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return isMobile ? <MobileDrawer /> : <DesktopDialog />;
}
