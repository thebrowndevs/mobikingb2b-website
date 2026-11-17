"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Home, ShoppingBag, RotateCcw } from "lucide-react";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") || "success").toLowerCase();
  const amount = searchParams.get("amount") || "";
  const orderId = searchParams.get("orderId") || "";
  const paymentId = searchParams.get("paymentId") || "";
  const reason = searchParams.get("reason") || "";

  const isSuccess = status === "success";
  const isPending = status === "pending" || status === "authorizing";
  const isFailed = !isSuccess && !isPending;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-slate-800">
        {/* Header decoration bar */}
        <div
          className={`h-3 w-full ${
            isSuccess ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"
          }`}
        />

        <div className="p-6 sm:p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-5">
            {isSuccess && (
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce-short">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            )}
            {isPending && (
              <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="h-12 w-12 text-amber-600" />
              </div>
            )}
            {isFailed && (
              <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-rose-600" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isSuccess
              ? "Payment Successful!"
              : isPending
              ? "Payment Authorizing"
              : "Payment Failed"}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {isSuccess
              ? "Your transaction has been processed and recorded successfully."
              : isPending
              ? "Your payment is currently being authorized by your bank. Once confirmed, your order status will be updated automatically."
              : reason
              ? `The payment could not be completed (${reason}). Please try again or contact support.`
              : "The payment could not be completed. Please try again or contact support."}
          </p>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 space-y-3 text-left text-sm">
            {amount && (
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="font-bold text-slate-900 text-base">₹{Number(amount).toLocaleString()}</span>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Order ID</span>
                <span className="font-mono font-semibold text-slate-800">#{orderId}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Ref</span>
                <span className="font-mono text-xs text-slate-600 max-w-[180px] truncate">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : isPending
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {isSuccess ? "PAID" : isPending ? "AUTHORIZING" : "FAILED"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            {isSuccess && (
              <Link
                href="/account?tab=orders"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                View My Orders
              </Link>
            )}

            {isPending && (
              <Link
                href="/account?tab=orders"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                Check Order in My Orders
              </Link>
            )}

            {isFailed && (
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Retry Payment
              </Link>
            )}

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
            >
              <Home className="h-4 w-4" />
              Return to Website
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span>Secured Transaction Confirmation</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
          Loading payment status...
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
