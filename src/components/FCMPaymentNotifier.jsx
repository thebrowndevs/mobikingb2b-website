"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { requestPermissionAndSubscribe } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  X,
  CreditCard,
  ExternalLink,
  Bell,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FCMPaymentNotifier() {
  const { user, isAuthenticated, accessToken } = useAuth();
  const router = useRouter();
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const formatTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Just now";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch pending payments list
  const fetchPendingPayments = async () => {
    if (!accessToken) return;
    try {
      const res = await axios.get(`${backendUrl}/payment/pending`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setPendingPayments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch pending payments list:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register FCM subscription unconditionally
    const setupFCM = async () => {
      try {
        await requestPermissionAndSubscribe(user?._id || null);
      } catch (err) {
        console.error("FCM Subscription error:", err);
      }
    };
    setupFCM();
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setPendingPayments([]);
      return;
    }

    fetchPendingPayments();

    // Setup foreground FCM messaging listener
    const setupListener = async () => {
      try {
        const messaging = await import("@/lib/firebase").then(m => m.getMessagingInstance());
        if (!messaging) return;

        const { onMessage } = await import("firebase/messaging");
        const unsubscribe = onMessage(messaging, (payload) => {
          // console.log("Foreground FCM message received: ", payload);
          const data = payload?.data;

          if (data && data.event === "pending_payments_api_reload") {
            // Check if it matches current logged in user
            if (data.userId === String(user?._id)) {
              setIncomingRequest({
                paymentId: data.paymentId,
                orderId: data.orderId,
                amount: data.amount || "0",
                orderIdString: data.orderIdString || "requested",
                createdAt: data.createdAt || new Date().toISOString()
              });
              toast.info("New payment request received!");
              fetchPendingPayments(); // Refresh list to update floating widget
            }
          }
        });
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up foreground message listener:", err);
      }
    };

    let unsub;
    setupListener().then(fn => { unsub = fn; });

    return () => {
      if (unsub) unsub();
    };
  }, [isAuthenticated, accessToken, user]);

  // Dismiss incoming payment request modal automatically after 1 minute (60 seconds)
  useEffect(() => {
    if (incomingRequest) {
      const timer = setTimeout(() => {
        setIncomingRequest(null);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [incomingRequest]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Inject custom CSS keyframe animations for blinking/waving glow */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-glow-wave {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            transform: scale(1) translateY(0px);
            border-color: rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 8px 30px rgba(59, 130, 246, 0.8), 0 0 15px rgba(59, 130, 246, 0.3);
            transform: scale(1.02) translateY(-4px);
            border-color: rgba(59, 130, 246, 0.9);
          }
        }
        .animate-glow-wave {
          animation: float-glow-wave 2s infinite ease-in-out;
        }
      `}} />

      {/* 1. Rectangular Paytm-Style Incoming Payment Banner (Top Viewport) */}
      {incomingRequest && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slide-down">
          <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border-2 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl animate-glow-wave transition-all duration-300">
            {/* Paytm Blue Top Bar decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Payment Request
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Mobiking B2B is requesting payment of{" "}
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    ₹{parseFloat(incomingRequest.amount).toLocaleString("en-IN")}
                  </span>{" "}
                  for Order #{incomingRequest.orderIdString}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Requested at {formatTime(incomingRequest.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shrink-0 text-xs px-4"
                onClick={() => {
                  const id = incomingRequest.paymentId;
                  setIncomingRequest(null);
                  router.push(`/checkout/payment/${id}`);
                }}
              >
                Pay Now
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <button
                onClick={() => setIncomingRequest(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Floating Pending Payments Circle - Positioned above Hero Section in Y axis */}
      {pendingPayments.length > 0 && (
        <div
          className="fixed top-[28%] right-6 z-40 flex flex-col items-end"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Core Circular Button */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
            <button
              className="relative w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
              onClick={() => setIsHovered(!isHovered)}
            >
              <CreditCard className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md">
                {pendingPayments.length}
              </span>
            </button>
          </div>

          {/* Expanded Interactive Payments List (Appears below the button since button is high up) */}
          {isHovered && (
            <div className="mt-3 w-80 max-h-96 overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl p-4 animate-slide-down">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5 mb-3">
                <span className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600 animate-swing" />
                  Pending Payments
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {pendingPayments.length} Active
                </span>
              </div>
              <div className="space-y-3">
                {pendingPayments.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-zinc-950 dark:to-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                  >
                    {/* Paytm style top border accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Request from Mobiking B2B
                        </span>
                        <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                          Order #{p.orderIdString || "B2B Order"}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Requested at {formatTime(p.createdAt)}
                        </span>
                      </div>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/checkout/payment/${p.paymentId}`)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all shadow-sm shadow-blue-600/10 active:scale-95"
                    >
                      Pay Now
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
