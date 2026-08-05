"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/services/operations/OrderApi";

export default function RazorpayButton({
  checkGST,
  grandTotal,
  shippingAddress,
  cartItems,
  deliveryCharge,
  gstAmount,
  method,
  discount,
  coupon,
  subtotal,
  customerInfo,
}) {
  const { user, accessToken, setUser } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect to load Razorpay's checkout script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initiatePayment = async () => {
    if (!shippingAddress) {
      toast.error("Please select a shipping address first.");
      return;
    }
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.contact) {
      toast.error("Please fill in all contact details.");
      return;
    }

    if (customerInfo?.gst && !checkGST(customerInfo?.gst)) {
      toast.error("Invalid GST No");
      return;
    }

    setIsProcessing(true);

    try {
      const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pinCode}`;

      const orderPayloadForCreation = {
        userId: user?._id,
        cartId: user?.cart?._id,
        name: customerInfo.name,
        email: customerInfo.email,
        phoneNo: customerInfo.contact,
        // orderAmount: grandTotal,
        // amount: Math.round(grandTotal * 100), // Amount in paisa for Razorpay
        coupon,
        discount: discount,
        deliveryCharge: deliveryCharge,
        gst: customerInfo?.gst,
        subtotal: subtotal,
        address: formattedAddress,
        addressId: shippingAddress?._id,
        method: method, // Using the 'method' prop passed from checkout page
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantName: item.variantName,
          price: item.price,
        })),
      };

      // Step 1: Create a Razorpay order via your backend
      const razorpayOrderResponse = await createRazorpayOrder(
        orderPayloadForCreation,
        accessToken,
        setUser,
        router
      );

      // Check for a successful response and a valid order ID
      if (!razorpayOrderResponse?.success || !razorpayOrderResponse.apiResponse?.order?.id) {
        toast.error(razorpayOrderResponse?.error || "Could not connect to payment gateway.");
        setIsProcessing(false);
        return;
      }

      // const { order: rzpOrder } = razorpayOrderResponse.apiResponse;

      // // Step 2: Configure and open the Razorpay checkout modal
      // const options = {
      //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      //   amount: rzpOrder.amount,
      //   currency: "INR",
      //   name: "Your Store Name",
      //   description: "Order Payment",
      //   order_id: rzpOrder.id,
      //   handler: async function (response) {
      //     const verificationData = {
      //       razorpay_payment_id: response.razorpay_payment_id,
      //       razorpay_order_id: response.razorpay_order_id,
      //       razorpay_signature: response.razorpay_signature,
      //       orderPayload: {
      //         ...orderPayloadForCreation,
      //         paymentStatus: "Paid",
      //         isAppOrder: false,
      //       },
      //     };

      //     // Step 3: Verify the payment on your backend
      //     const finalResponse = await verifyRazorpayPayment(verificationData, accessToken);

      //     if (finalResponse?.success) {
      //       toast.success("Payment successful and order placed!");
      //       setUser(finalResponse.data.user);
      //       localStorage.setItem("user", JSON.stringify(finalResponse.data.user));
      //       router.push("/account?tab=orders");
      //     } else {
      //       toast.error(finalResponse?.error || "Payment verification failed. Please contact support.");
      //     }
      //   },
      //   prefill: {
      //     name: customerInfo.name,
      //     email: customerInfo.email,
      //     contact: customerInfo.contact,
      //   },
      //   theme: {
      //     color: "#3399cc",
      //   },
      // };

      // const paymentObject = new window.Razorpay(options);
      // paymentObject.open();
      // setIsProcessing(false);

      // paymentObject.on("payment.failed", function (response) {
      //   toast.error("Payment failed. Please try again or choose another method.");
      //   console.error("Razorpay payment failed:", response.error);
      //   setIsProcessing(false);
      // });
    } catch (error) {
      console.error("Payment initiation error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={initiatePayment} size="lg" className="w-full mt-6" disabled={isProcessing || !shippingAddress}>
      {isProcessing ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
      ) : (
        "Proceed to Pay"
      )}
    </Button>
  );
}