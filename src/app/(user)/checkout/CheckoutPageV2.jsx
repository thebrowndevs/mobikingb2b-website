"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, CheckCircle, FileText, Info, CreditCard } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import AddressForm from "@/components/AddressForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Script from "next/script";

// API Functions
import { getAddressesApi } from "@/lib/services/operations/AddressApi";
import { createQuotationApi } from "@/lib/services/operations/QuotationApi";
import { verifyCoupon } from "@/lib/services/operations/OrderApi";
import { getMyCart } from "@/lib/services/operations/CartApi";

export default function CheckoutPageV2() {
  const { user, accessToken, setUser, isLoading } = useAuth();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGST, setCustomerGST] = useState("");
  const [comments, setComments] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [processedCartItems, setProcessedCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuyNowSubmitting, setIsBuyNowSubmitting] = useState(false);
  const [gstError, setGstError] = useState(null);

  // Limits & Generic Modal
  const [minOrderLimit, setMinOrderLimit] = useState(0);
  const [minQuotationLimit, setMinQuotationLimit] = useState(0);
  const [limitsLoaded, setLimitsLoaded] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

  const checkGST = (gst) => {
    setGstError(null);
    const value = (gst || "").toUpperCase().trim();
    if (!value) return true;
    if (value.length !== 15) {
      setGstError("GST must be 15 characters.");
      return false;
    }
    if (!GST_REGEX.test(value)) {
      setGstError("Incorrect GST Number.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    checkGST(customerGST);
  }, [customerGST]);

  useEffect(() => {
    if (user) {
      setCustomerName(user?.business?.businessName || user?.fullName || user?.name || "");
      setCustomerEmail(user?.email || "");
      setCustomerPhone(user?.phoneNo || "");
      if (user?.business?.gstNumber) {
        setCustomerGST(user.business.gstNumber);
      }
    }
  }, [user]);

  // Fetch Limits
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await axios.get(`${backendUrl}/policy/limits`);
        if (response.data?.success) {
          setMinOrderLimit(response.data.data.minOrderLimit || 0);
          setMinQuotationLimit(response.data.data.minQuotationLimit || 0);
        }
      } catch (err) {
        console.error("Failed to fetch order limits", err);
      } finally {
        setLimitsLoaded(true);
      }
    };
    fetchLimits();
  }, []);

  const smallerLimit = Math.min(minOrderLimit, minQuotationLimit);

  useEffect(() => {
    if (limitsLoaded && subtotal > 0 && subtotal < smallerLimit) {
      setModalConfig({
        title: "Minimum Cart Value Required",
        message: "To proceed with checkout, your cart subtotal must be of at least:",
        highlightText: `₹${smallerLimit.toLocaleString()}`,
        additionalMessage: `Current subtotal is ₹${subtotal.toLocaleString()}.`,
        actionText: "Browse Products & Add Items",
        onAction: () => router.push("/"),
        showCloseButton: false
      });
    }
  }, [limitsLoaded, subtotal, smallerLimit, router]);

  useEffect(() => {
    if (!isLoading && !orderPlaced && user?.cart?.items?.length === 0) {
      toast.info("Your cart is empty. Redirecting home.");
      router.push("/");
    }
  }, [user, isLoading, router, orderPlaced]);

  // Apply Coupon
  const applyCoupon = async () => {
    if (!accessToken) return;
    setCouponLoading(true);
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      setCouponLoading(false);
      return;
    }
    const appliedCoupon = await verifyCoupon(accessToken, couponCode, "online");

    if (appliedCoupon) {
      const start = new Date(appliedCoupon?.startDate);
      const end = new Date(appliedCoupon?.endDate);
      const now = Date.now();

      if (start.getTime() > now) {
        setCouponLoading(false);
        setCoupon(null);
        setCouponCode("");
        toast.warning("Offer not started yet");
        return;
      }

      if (end.getTime() < now) {
        setCouponLoading(false);
        setCoupon(null);
        setCouponCode("");
        toast.error("Coupon expired");
        return;
      }

      let discountedAmount = subtotal * (parseFloat(appliedCoupon?.percent) * 0.01);
      discountedAmount = parseFloat(discountedAmount.toFixed(2));

      if (discountedAmount >= appliedCoupon?.value) {
        setDiscount(parseFloat(appliedCoupon?.value));
      } else {
        setDiscount(discountedAmount);
      }
      setCoupon(appliedCoupon?._id);
      toast.success("Coupon applied successfully");
    } else {
      setCoupon(null);
      setCouponCode("");
      setDiscount(0);
    }
    setCouponLoading(false);
  };

  // Address API
  const fetchAddresses = useCallback(async () => {
    if (!accessToken) return;
    setAddressLoading(true);
    try {
      const fetchedAddresses = await getAddressesApi(accessToken);
      setAddresses(fetchedAddresses);
      if (fetchedAddresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(fetchedAddresses[0]._id);
      }
      if (fetchedAddresses.length === 0) {
        setIsAddressFormOpen(true);
      }
    } catch (error) {
      toast.error("Could not fetch your saved addresses.");
    } finally {
      setAddressLoading(false);
    }
  }, [accessToken, selectedAddressId]);

  useEffect(() => {
    if (accessToken) {
      fetchAddresses();
    }
  }, [accessToken, fetchAddresses]);

  // Cart API
  const initializeCart = async () => {
    setCartLoading(true);
    const myCart = await getMyCart(accessToken);
    if (myCart) {
      const updatedUser = {
        ...user,
        cart: myCart,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setCartLoading(false);
  };

  useEffect(() => {
    if (accessToken) {
      initializeCart();
    }
  }, [accessToken]);

  useEffect(() => {
    const rawItems = user?.cart?.items || [];
    if (rawItems.length > 0) {
      const itemsForDisplay = rawItems.map((item) => ({
        productId: item.productId?._id,
        name: item.productId?.fullName || "Unnamed Product",
        image: item.productId?.images?.[0] || "/placeholder.png",
        price: item.price || 0,
        saved: (
          item?.productId?.regularPrice &&
          item?.productId?.regularPrice > (item.price || 0)
        ) ? (
          +item?.productId?.regularPrice - +(item.price || 0)
        ) : 0,
        quantity: item.quantity,
        variantName: item.variantName,
      }));
      const newSubtotal = itemsForDisplay.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const newTotalSaved = itemsForDisplay.reduce(
        (acc, item) => acc + item.saved * item.quantity,
        0
      );

      setProcessedCartItems(itemsForDisplay);
      setSubtotal(newSubtotal);
      setTotalSaved(newTotalSaved);
      setDeliveryCharge(0);
      setGrandTotal(newSubtotal);
    }
  }, [user]);

  useEffect(() => {
    if (coupon) {
      applyCoupon();
    }
  }, [user, subtotal]);

  const handleAddressChange = () => {
    fetchAddresses();
    setIsAddressFormOpen(false);
  };

  const handleRaiseQuotation = async () => {
    if (minQuotationLimit > 0 && subtotal < minQuotationLimit) {
      setModalConfig({
        title: "Minimum Value Required for Order Request",
        message: "To submit an Order Request, your cart subtotal must be of at least:",
        highlightText: `₹${minQuotationLimit.toLocaleString()}`,
        additionalMessage: `Current subtotal is ₹${subtotal.toLocaleString()}.`,
        actionText: "Add More Items",
        onAction: () => {
          setModalConfig(null);
          router.push("/");
        },
        showCloseButton: true
      });
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a warehouse address.");
      return;
    }
    const shippingAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (!customerName || !customerPhone) {
      toast.error("Please fill in contact name and phone number.");
      return;
    }

    if (customerGST && !checkGST(customerGST)) {
      toast.error("Please correct the GST number before proceeding.");
      return;
    }

    setIsSubmitting(true);
    const quotationPayload = {
      userId: user?._id,
      name: customerName,
      email: customerEmail,
      phoneNo: customerPhone,
      gst: customerGST,
      comments: comments.trim(),
      orderAmount: grandTotal,
      discount,
      coupon: coupon || undefined,
      deliveryCharge,
      subtotal,
      addressId: shippingAddress?._id
    };

    try {
      const response = await createQuotationApi(quotationPayload, accessToken);
      if (response.success) {
        setOrderPlaced(true);
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        router.push("/account?tab=quotations");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (minOrderLimit > 0 && subtotal < minOrderLimit) {
      setModalConfig({
        title: "Minimum Order Amount Required",
        message: "To proceed with direct Buy Now, your cart subtotal must be of at least:",
        highlightText: `₹${minOrderLimit.toLocaleString()}`,
        additionalMessage: `Current subtotal is ₹${subtotal.toLocaleString()}.`,
        actionText: "Add More Items",
        onAction: () => {
          setModalConfig(null);
          router.push("/");
        },
        showCloseButton: true
      });
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a warehouse address.");
      return;
    }
    const shippingAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (!customerName || !customerPhone) {
      toast.error("Please fill in contact name and phone number.");
      return;
    }

    if (customerGST && !checkGST(customerGST)) {
      toast.error("Please correct the GST number before proceeding.");
      return;
    }

    setIsBuyNowSubmitting(true);

    try {
      // 1. Create Online Order
      const res = await axios.post(
        `${backendUrl}/orders/online/new`,
        {
          name: customerName,
          email: customerEmail,
          phoneNo: customerPhone,
          gst: customerGST,
          comments: comments.trim(),
          coupon: coupon || undefined,
          addressId: shippingAddress?._id,
          isAppOrder: false
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      const rpOrder = res.data?.data;
      if (!rpOrder) throw new Error("Order creation failed.");

      // 2. Open Razorpay Modal
      const options = {
        key: rpOrder.key,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "Mobiking Wholesale",
        description: "Direct B2B Checkout Order Payment",
        order_id: rpOrder.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            toast.loading("Verifying your payment, please wait...");
            const verifyRes = await axios.post(
              `${backendUrl}/orders/online/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: rpOrder.paymentId
              },
              {
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            );

            toast.dismiss();

            if (verifyRes.data?.success) {
              toast.success("Order placed and paid successfully!");
              if (verifyRes.data?.data?.user) {
                setUser(verifyRes.data.data.user);
                localStorage.setItem("user", JSON.stringify(verifyRes.data.data.user));
              }
              router.push("/account?tab=orders");
            } else {
              toast.error("Payment verification failed. Please check with your bank.");
            }
          } catch (verifyErr) {
            toast.dismiss();
            console.error("Verification failed:", verifyErr);
            toast.error("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: "#ED1C24"
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Checkout failed. Please check product stock levels.";
      toast.error(errMsg);
    } finally {
      setIsBuyNowSubmitting(false);
    }
  };

  if (isLoading || !user || (processedCartItems.length === 0 && !orderPlaced) || !limitsLoaded) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#ED1C24]" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Razorpay checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Generic Limits & Warnings Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-none">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-[#ED1C24]">
                <Info size={32} />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">{modalConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                {modalConfig.message}
              </p>
              {modalConfig.highlightText && (
                <p className="text-3xl font-extrabold text-[#ED1C24] py-1 tracking-tight">
                  {modalConfig.highlightText}
                </p>
              )}
              {modalConfig.additionalMessage && (
                <p className="text-sm text-slate-500 leading-relaxed">
                  {modalConfig.additionalMessage}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={modalConfig.onAction}
                  className="w-full bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white font-bold py-6 text-base"
                >
                  {modalConfig.actionText}
                </Button>
                {modalConfig.showCloseButton && (
                  <Button
                    variant="ghost"
                    onClick={() => setModalConfig(null)}
                    className="w-full text-slate-500 font-semibold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Breadcrumb />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">

        {/* Left Section */}
        <div className="lg:col-span-3 space-y-6">

          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  type="text"
                  value={customerGST}
                  onChange={(e) => setCustomerGST(e.target.value)}
                  maxLength={15}
                />
                {gstError && <p className="text-sm text-red-500">{gstError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Special Instructions / Custom Requests (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Specify custom packaging, logistics preferences, or specific price targets..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="coupon">Coupon Code (Optional)</Label>
                <div className="flex gap-4">
                  <Input
                    className={`${coupon ? "border-green-500 bg-green-50 text-green-700 font-semibold" : ""}`}
                    id="coupon"
                    type="text"
                    value={couponCode}
                    readOnly={!!coupon}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  {!coupon ? (
                    <Button type="button" onClick={applyCoupon} disabled={couponLoading}>
                      Apply
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCoupon(null);
                        setDiscount(0);
                        setCouponCode("");
                      }}
                      disabled={couponLoading}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Select Warehouse Destination</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddressFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </CardHeader>
            <CardContent>
              {addressLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ED1C24]" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr._id
                        ? "border-[#ED1C24] ring-2 ring-[#ED1C24]/10 bg-slate-50/50"
                        : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      {selectedAddressId === addr._id && (
                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#ED1C24]" />
                      )}
                      <div>
                        <p className="font-semibold text-base capitalize">
                          {addr.label || "Warehouse"}
                        </p>
                        <p className="font-semibold text-sm">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">{`${addr.street}, ${addr.city}, ${addr.state} - ${addr.pinCode}`}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Phone: {addr.phoneNumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>You have no saved warehouses.</p>
                  <Button
                    variant="link"
                    className="text-[#ED1C24] hover:text-[#ED1C24]/80"
                    onClick={() => setIsAddressFormOpen(true)}
                  >
                    Add a new warehouse to continue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex justify-between items-center">
                <span>Order Request Summary</span>
                {totalSaved > 0 && (
                  <span className="text-sm font-bold text-green-600">
                    Saved - ₹{totalSaved}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Item Details */}
              <ul className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {processedCartItems.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantName}`}
                    className="flex items-center gap-4 text-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded border bg-white p-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} | Variant: {item.variantName}
                      </p>
                    </div>
                    <p className="font-medium text-right shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              <Separator />

              {/* Cost details */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between font-medium">
                  <p>Subtotal</p>
                  <p>₹{subtotal.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <p>Estimated Total</p>
                <p>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-2.5 text-xs text-slate-500">
                <Info size={16} className="text-[#ED1C24] shrink-0 mt-0.5" />
                <p>
                  This is a B2B order request. No payment is charged now. Mobiking admins will review stock availability, final pricing, and shipping logistics to process your order request.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white cursor-pointer font-bold py-6 text-base"
                  disabled={isSubmitting || isBuyNowSubmitting || !selectedAddressId}
                >
                  {isBuyNowSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Buy Now
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRaiseQuotation}
                  variant="secondary"
                  size="sm"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-bold py-4 text-sm"
                  disabled={isSubmitting || isBuyNowSubmitting || !selectedAddressId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Order Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Modal */}
      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={() => setIsAddressFormOpen(false)}
        onAddressChange={handleAddressChange}
      />
    </div>
  );
}
