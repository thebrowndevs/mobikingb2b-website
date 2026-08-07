// src/components/MyCart.js

"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Loader, Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  addCartById,
  getMyCart,
  removeFromCartById,
} from "@/lib/services/operations/CartApi";
import Link from "next/link";
import { toast } from "sonner";

// --- Step 1: Import the custom hook ---
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function MyCart({ isOpen, onClose }) {
  const { user, accessToken, setUser, onboardingStep } = useAuth();

  // --- Step 2: Use the hook to determine the screen size ---
  const { isDesktop } = useBreakpoint();

  const [loadingItemId, setLoadingItemId] = useState(null);
  const [processedCartItems, setProcessedCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const initializeCart = async () => {
    // console.log("Called",accessToken)
    setLoading(true);
    const myCart = await getMyCart(accessToken);
    if (myCart) {
      const updatedUser = {
        ...user,
        cart: myCart,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (accessToken) {
      initializeCart(accessToken);
    }
  }, [isOpen])

  useEffect(() => {
    const rawItems = user?.cart?.items || [];
    const processedItems = rawItems.map((item) => {
      const product = item.productId || {};
      const uniqueId = `${product._id}-${item.variantName}`;
      return {
        uniqueId,
        productId: product._id,
        variantName: item.variantName,
        name: product.fullName || "Unnamed Product",
        image: product.images?.[0] || "/placeholder.png",
        price: product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0,
        quantity: item.quantity || 1,
        stock: product.variants?.[item.variantName] || 0,
      };
    });

    setProcessedCartItems(processedItems);
    const totalAmount = processedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  }, [user]);

  const handleUpdateCart = async (action, item) => {
    if (loadingItemId || !accessToken) return;
    setLoadingItemId(item.uniqueId);
    const body = {
      productId: item.productId,
      cartId: user?.cart?._id,
      variantName: item.variantName,
    };
    try {
      const apiCall = action === "add" ? addCartById : removeFromCartById;
      const response = await apiCall(body, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
        // Using a more subtle toast for quick actions
        // toast.message(`Cart updated.`);
      }
    } catch (err) {
      console.error("Cart update error:", err);
      toast.error(`Failed to update cart.`);
    } finally {
      setLoadingItemId(null);
    }
  };

  const hasItems = processedCartItems.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className="flex flex-col w-full lg:max-w-md p-0 lg:h-full h-auto rounded-t-2xl lg:rounded-t-none"
      >
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            My Cart ({processedCartItems.length})
          </SheetTitle>
        </SheetHeader>

        {loading

          ? <Loader2 className="w-6 h-6 animate-spin self-center my-10" />

          : hasItems ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {processedCartItems.map((item) => {
                  const isLoading = loadingItemId === item.uniqueId;
                  return (
                    <div key={item.uniqueId} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-contain rounded-md border bg-gray-50"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-sm line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.variantName}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isLoading}
                              onClick={() => handleUpdateCart("remove", item)}
                            >
                              −
                            </Button>
                            <div className="w-10 flex justify-center items-center">
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <span className="font-medium text-sm">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isLoading || item.quantity >= item.stock}
                              onClick={() => handleUpdateCart("add", item)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="font-medium text-right text-base">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 border-t bg-white">
                <div className="flex justify-between font-semibold text-lg mb-4">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                {onboardingStep !== null && onboardingStep < 2 ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs font-semibold text-amber-700 leading-normal">
                      Complete your B2B profile & primary warehouse address to place orders.
                    </div>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/onboarding" onClick={onClose}>
                        Complete B2B Profile
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button asChild size="lg" className="w-full">
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Your cart is empty
              </h3>
              <p className="text-sm">
                Looks like you haven't added anything yet.
              </p>
              <Button asChild className="mt-6" onClick={onClose}>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          )}
      </SheetContent>
    </Sheet>
  );
}
