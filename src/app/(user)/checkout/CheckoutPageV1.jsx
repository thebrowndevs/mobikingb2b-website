"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Wallet, Package, Plus, CheckCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import AddressForm from "@/components/AddressForm";
import RazorpayButton from "@/components/RazorpayButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// API Functions
import { getAddressesApi } from "@/lib/services/operations/AddressApi";
import { createCodOrder, verifyCoupon } from "@/lib/services/operations/OrderApi";
import CODWarningModal from "@/components/CODWarningModal";
import { getMyCart } from "@/lib/services/operations/CartApi";

const GST_RATE = 0.18;

export default function CheckoutPageV1() {
  const { user, accessToken, setUser, isLoading } = useAuth();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGST, setCustomerGST] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [processedCartItems, setProcessedCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  // const [gstRaw, setGstRaw] = useState(null)
  const [gstError, setGstError] = useState(null)

  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

  const checkGST = (gst) => {
    // Clear previous error
    setGstError(null);

    const value = (gst || "").toUpperCase().trim();

    // Empty is allowed (optional field)
    if (!value) return true;

    if (value.length !== 15) {
      setGstError("GST must be 15 characters.");
      return false;
    }

    if (!GST_REGEX.test(value)) {
      setGstError("Incorrect GST Number. This will not get submitted!");
      return false;
    }

    // valid
    setGstError(null);
    return true;
  };

  useEffect(() => {
    // validate whenever customerGST changes from anywhere
    checkGST(customerGST);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // console.log(paymentMethod);
    const appliedCoupon = await verifyCoupon(accessToken, couponCode,
      paymentMethod == "RAZORPAY" ? "online" : null);

    if (appliedCoupon) {
      // console.log(appliedCoupon);

      const start = new Date(appliedCoupon?.startDate);
      const end = new Date(appliedCoupon?.endDate);
      const now = Date.now();

      console.log("Start UTC:", start.toISOString());
      console.log("End UTC:", end.toISOString());
      console.log("Now UTC:", new Date(now).toISOString());

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
      toast.success("Coupon applied successfully")
    } else {
      setCoupon(null);
      setCouponCode("");

      setDiscount(0);
    }
    setCouponLoading(false);
  }


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
    // console.log("Called",accessToken)
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
  }

  useEffect(() => {
    if (accessToken) {
      initializeCart(accessToken);
    }
  }, [accessToken])

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
      const categoryCharges = new Map();
      rawItems.forEach((item) => {
        const category = item.productId?.category;
        // console.log(category)
        if (category?._id && category.deliveryCharge > 0) {
          categoryCharges.set(category._id, category.deliveryCharge);
        }
      });
      // const totalCalculatedCharge = Array.from(categoryCharges.values()).reduce(
      //   (acc, charge) => acc + charge,
      //   0
      // );

      let totalCalculatedCharge = 0
      if (categoryCharges && Array.from(categoryCharges.values())?.length && Math.max(...Array.from(categoryCharges.values()))) {
        totalCalculatedCharge = Math.max(...Array.from(categoryCharges.values()));
        // console.log(totalCalculatedCharge)
      }
      // console.log(Math.max(...Array.from(categoryCharges.values())))
      const taxableAmount = newSubtotal - discount + totalCalculatedCharge;
      // const calculatedGst = taxableAmount * GST_RATE;
      // const newGrandTotal = taxableAmount + calculatedGst;
      setProcessedCartItems(itemsForDisplay);
      setSubtotal(newSubtotal);
      setTotalSaved(newTotalSaved);
      setDeliveryCharge(totalCalculatedCharge || 0);
      // setGstAmount(calculatedGst);
      setGrandTotal(taxableAmount);
    }
  }, [user, discount]);

  useEffect(() => {
    if (coupon) {
      applyCoupon();
    }
  }, [user, paymentMethod, subtotal]);

  const handleAddressChange = () => {
    fetchAddresses();
    setIsAddressFormOpen(false);
  };

  const handleCodOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }
    const shippingAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("Please fill in all contact details.");
      return;
    }

    if (customerGST && !checkGST(customerGST)) {
      toast.error("Invalid GST No");
      return;
    }

    if (+grandTotal > 5000) {
      setActiveKey("COD_LIMIT");
      return;
    }
    setIsSubmitting(true);
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pinCode}`;
    // console.log("Formatted Address:", formattedAddress);
    const orderPayload = {
      userId: user?._id,
      cartId: user?.cart?._id,
      name: customerName,
      email: customerEmail,
      phoneNo: customerPhone,
      gst: customerGST,
      orderAmount: grandTotal,
      discount,
      coupon: coupon || "",
      deliveryCharge,
      subtotal,
      address: formattedAddress,
      addressId: shippingAddress?._id,
      method: "COD",
      isAppOrder: false,
      items: processedCartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantName: item.variantName,
        price: item.price,
      })),
    };
    //     console.log("Coupon: ",orderPayload);
    // return;
    try {
      const response = await createCodOrder(orderPayload, accessToken);
      if (response.success) {
        toast.success("Order placed successfully! Redirecting...");
        setOrderPlaced(true);
        setUser(response?.data?.data?.user);
        localStorage.setItem("user", JSON.stringify(response?.data?.data?.user));
        router.push("/account?tab=orders");
      } else {
        toast.error(response.error || "Could not place the order.");
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      toast.error(
        serverMessage || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || (processedCartItems.length === 0 && !orderPlaced)) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const selectedAddress = addresses.find(
    (addr) => addr._id === selectedAddressId
  );

  return (
    <div className="w-full mx-auto p-4">
      <Breadcrumb />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 lg:gap-2 mt-6">

        {/* Left Section */}
        <div className="lg:col-span-3 space-y-8">

          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="gst">{"GST NO (Optional)"}</Label>
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
                <Label htmlFor="coupon">{"Coupon Code (Optional)"}</Label>
                <div className="flex gap-5 justify-between">
                  <Input
                    className={`${coupon
                      ? "border border-green-500 bg-green-100 text-green-500 font-semibold"
                      : ""
                      }`}
                    id="coupon"
                    type="text"
                    value={couponCode}
                    readOnly={coupon}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />

                  {/* Apply Coupon Button */}
                  {
                    !coupon &&
                    <Button
                      className={"cursor-pointer"}
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                    >
                      Apply
                    </Button>
                  }

                  {/* Reset Coupon Button */}
                  {
                    coupon &&
                    <Button
                      className={"cursor-pointer"}
                      type="button"
                      onClick={() => {
                        setCoupon(null);
                        setDiscount(0);
                        setCouponCode("");
                      }}
                      disabled={couponLoading}
                    >
                      Reset
                    </Button>
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Select Shipping Address</CardTitle>
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
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr._id
                        ? "border-primary ring-2 ring-primary"
                        : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      {selectedAddressId === addr._id && (
                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                      )}
                      <div>
                        <p className="font-semibold text-lg capitalize">
                          {addr.label || "Address"}
                        </p>
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">{`${addr.street}, ${addr.city}, ${addr.state} - ${addr.pinCode}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {addr.phoneNumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>You have no saved addresses.</p>
                  <Button
                    variant="link"
                    onClick={() => setIsAddressFormOpen(true)}
                  >
                    Add a new address to continue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "COD"
                  ? "border-primary ring-2 ring-primary"
                  : "border-gray-200"
                  }`}
              >
                <Package className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Cash on Delivery (COD)</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay with cash upon delivery.
                  </p>
                </div>
              </div>
              <div
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "RAZORPAY"
                  ? "border-primary ring-2 ring-primary"
                  : "border-gray-200"
                  }`}
              >
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Pay Online</h3>
                  <p className="text-sm text-muted-foreground">
                    Credit/Debit Card, UPI, Netbanking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2">

          {/* Order Summary */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex justify-between items-center gap-2 text-lg font-semibold">
                <span>Order Summary</span>
                <span className="text-[17px] font-bold text-green-400">
                  {
                    totalSaved ? `Saved - Rs.${totalSaved}` : ""
                  }
                </span></CardTitle>
            </CardHeader>
            <CardContent>

              {/* Item Details */}
              <ul className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {processedCartItems.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantName}`}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-md border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              <Separator className="my-6" />

              {/* Order Amount Details */}
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₹{subtotal.toLocaleString()}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount</p>
                    <p>- ₹{discount.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <p>Delivery Charge</p>
                  <p>
                    {deliveryCharge > 0
                      ? `₹${deliveryCharge.toLocaleString()}`
                      : "Free"}
                  </p>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>
                  ₹
                  {grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Place Order Button */}
              {paymentMethod === "COD" ? (
                <Button
                  onClick={handleCodOrder}
                  size="lg"
                  className="w-full mt-6"
                  disabled={isSubmitting || !selectedAddressId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              ) : (
                <RazorpayButton
                  checkGST={checkGST}
                  grandTotal={grandTotal}
                  shippingAddress={selectedAddress}
                  cartItems={processedCartItems}
                  deliveryCharge={deliveryCharge}
                  gstAmount={gstAmount}
                  method={paymentMethod}
                  subtotal={subtotal}
                  discount={discount}
                  coupon={coupon || ""}
                  customerInfo={{
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone,
                    gst: customerGST,
                  }}
                />
              )}
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

      <CODWarningModal
        modalKey="COD_LIMIT"
        activeKey={activeKey}
        onClose={() => setActiveKey(null)}
        title="COD Order Limit"
        message="Cash on Delivery is available only for orders up to ₹5000."
      />
    </div>
  );
}
