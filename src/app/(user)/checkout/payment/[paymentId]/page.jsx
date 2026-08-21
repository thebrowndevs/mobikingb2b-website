"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Script from "next/script";
import {
  CreditCard,
  ArrowLeft,
  Tag,
  CheckCircle2,
  AlertCircle,
  ShoppingBag
} from "lucide-react";

export default function CheckoutPaymentPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { paymentId } = params;
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (isAuthLoading) return;
    if (!accessToken) {
      toast.error("Please login to proceed with the payment.");
      router.push("/");
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/payment/${paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const match = res.data?.data;

        if (!match) {
          toast.error("Payment request not found or already processed.");
          router.push("/account");
          return;
        }
        setPayment(match);
      } catch (err) {
        console.error("Failed to fetch pending payment:", err);
        toast.error("Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [accessToken, isAuthLoading, paymentId]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      // Validate coupon on backend
      const res = await axios.get(`${backendUrl}/coupon/check/${couponCode}/online`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const couponData = res.data?.data;
      if (couponData) {
        setAppliedCoupon(couponData);
        toast.success("Coupon code applied successfully!");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid coupon code.";
      setCouponError(errMsg);
      toast.error(errMsg);
      setAppliedCoupon(null);
    }
  };

  const getDiscountedAmount = () => {
    if (!payment) return 0;
    if (!appliedCoupon) return payment.amount;

    let discount = 0;
    if (appliedCoupon.percent) {
      discount = payment.amount * (parseFloat(appliedCoupon.percent) * 0.01);
      if (appliedCoupon.value && discount > appliedCoupon.value) {
        discount = appliedCoupon.value;
      }
    } else {
      discount = appliedCoupon.value || 0;
    }
    return Math.max(0, payment.amount - discount);
  };

  const handlePayNow = async () => {
    if (!payment) return;
    setSubmittingPayment(true);
    try {
      // 1. Create Razorpay order
      const res = await axios.post(
        `${backendUrl}/payment/create-razorpay-order`,
        {
          paymentId: payment.paymentId,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      const rpOrder = res.data?.data;
      if (!rpOrder) throw new Error("Order creation failed.");

      // 2. Configure Razorpay Standard Checkout
      const options = {
        key: rpOrder.key,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "Mobiking Wholesale",
        description: `Payment for Order #${payment.orderIdString}`,
        order_id: rpOrder.razorpayOrderId,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            setLoading(true);
            const verifyRes = await axios.post(
              `${backendUrl}/payment/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            );

            if (verifyRes.data?.success) {
              toast.success("Payment completed successfully!");
              router.push("/account");
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Failed to verify payment with server.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || ""
        },
        theme: {
          color: "#2563EB"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to initiate payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!payment) return null;

  if (payment.status === "Paid") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-scale-up">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 shadow-inner">
            <CheckCircle2 className="w-12 h-12 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Payment Successful!
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your payment of <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{payment.amount.toLocaleString("en-IN")}</span> has been processed successfully.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-5 divide-y divide-zinc-200/30 dark:divide-zinc-800/30 space-y-3.5 text-left text-sm">
            <div className="flex justify-between items-center pt-0">
              <span className="text-zinc-500 font-medium">Order Number</span>
              <span className="font-extrabold text-zinc-800 dark:text-zinc-200">#{payment.orderIdString}</span>
            </div>
            <div className="flex justify-between items-center pt-3.5">
              <span className="text-zinc-500 font-medium">Transaction ID</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate max-w-[200px]">
                {payment.transactionId || "rp_pay_success_101"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3.5">
              <span className="text-zinc-500 font-medium">Payment Method</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Online</span>
            </div>
            <div className="flex justify-between items-center pt-3.5">
              <span className="text-zinc-500 font-medium">Date & Time</span>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                {payment.paidAt ? new Date(payment.paidAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => router.push("/account?tab=orders")}
              className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              View Order Details
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl transition-all active:scale-95 text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalAmount = getDiscountedAmount();
  const discountAmount = payment.amount - finalAmount;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Details Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Complete Financial Order Details */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Order Financial Status
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Total Order Value
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white">
                    ₹{payment.orderAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                    Paid So Far
                  </span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    ₹{payment.amountPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/20">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                    Balance Remaining
                  </span>
                  <span className="text-lg font-black text-rose-700 dark:text-rose-400">
                    ₹{payment.remainingAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-1.5">
                  <span>Payment Progress</span>
                  <span>{payment.orderAmount > 0 ? Math.round((payment.amountPaid / payment.orderAmount) * 100) : 0}% Paid</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${payment.orderAmount > 0 ? Math.min(100, (payment.amountPaid / payment.orderAmount) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Order Summary Details
              </h2>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block mb-0.5">
                    Order Sequence ID
                  </span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    #{payment.orderIdString}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block mb-0.5">
                    Payment Status
                  </span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-1 rounded-full">
                    {payment.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block">
                  Items Details
                </span>
                {payment.items && payment.items.length > 0 ? (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                    {payment.items.map((item, idx) => {
                      const itemDiscount = (item.discount || 0) * (item.quantity || 1);
                      return (
                        <div key={idx} className="py-4 flex flex-col gap-1">
                          <div className="flex items-center gap-4">
                            {/* Product Thumbnail Image */}
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden flex items-center justify-center shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-6 h-6 text-zinc-400" />
                              )}
                            </div>

                            <div className="flex-1 flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                                  {item.name}
                                </p>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                  Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                                ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          {itemDiscount > 0 && (
                            <div className="flex justify-between text-xs text-emerald-600 font-medium pl-20">
                              <span>Item-Level Discount</span>
                              <span>- ₹{itemDiscount.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No items listed in order details.</p>
                )}
              </div>

              {/* Financial Breakout of the Order */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block mb-1">
                  Order Cost Breakdown
                </span>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Order Subtotal</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ₹{payment.orderSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {payment.orderDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Subtotal Discount</span>
                    <span>- ₹{payment.orderDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Delivery Charge</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ₹{payment.orderDeliveryCharge.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-zinc-900 dark:text-white">Total Order Amount</span>
                  <span className="text-zinc-900 dark:text-white">
                    ₹{payment.orderAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Payment Section Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Checkout
              </h2>

              {/* Coupon section */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase block mb-2">
                  Apply Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon &quot;{appliedCoupon.code}&quot; applied!
                  </p>
                )}
              </div>

              {/* Pricing Breakout of This Payment Installment */}
              <div className="space-y-3 mb-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block mb-1">
                  Installment Details
                </span>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Gross Subtotal</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                {payment.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Installment Discount</span>
                    <span>- ₹{payment.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-zinc-900 dark:text-white">Amount to Pay</span>
                  <span className="text-zinc-900 dark:text-white text-lg">
                    ₹{finalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                disabled={submittingPayment}
                onClick={handlePayNow}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submittingPayment ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Pay with Razorpay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
