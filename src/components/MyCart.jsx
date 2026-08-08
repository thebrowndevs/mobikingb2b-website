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

  const [groupedCart, setGroupedCart] = useState([]);

  useEffect(() => {
    const rawItems = user?.cart?.items || [];
    const groups = {};

    for (const item of rawItems) {
      const product = item.productId || {};
      const pId = product._id;
      if (!pId) continue;

      if (!groups[pId]) {
        groups[pId] = {
          productId: pId,
          name: product.fullName || "Unnamed Product",
          image: product.images?.[0] || "/placeholder.png",
          slug: product.slug,
          appliedSlab: item.appliedSlab?.quantity || 60,
          totalQty: 0,
          totalValue: 0,
          items: []
        };
      }

      groups[pId].totalQty += item.quantity;
      groups[pId].totalValue += item.quantity * item.price;
      groups[pId].items.push({
        uniqueId: `${pId}-${item.variantName}`,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
        stock: 4000
      });
    }

    const groupedList = Object.values(groups);
    setGroupedCart(groupedList);

    const totalAmount = rawItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  }, [user]);

  const handleUpdateCart = async (action, pId, vId, qtyToChange, uniqueId) => {
    if (loadingItemId || !accessToken) return;
    setLoadingItemId(uniqueId);
    const body = {
      items: [{
        productId: pId,
        variantId: vId,
        quantity: qtyToChange
      }]
    };
    try {
      const apiCall = action === "add" ? addCartById : removeFromCartById;
      const response = await apiCall(body, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (err) {
      console.error("Cart update error:", err);
      toast.error(`Failed to update cart.`);
    } finally {
      setLoadingItemId(null);
    }
  };

  const hasItems = groupedCart.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className="flex flex-col w-full lg:max-w-md p-0 lg:h-full h-auto rounded-t-2xl lg:rounded-t-none"
      >
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            My Cart ({user?.cart?.items?.length || 0})
          </SheetTitle>
        </SheetHeader>

        {loading

          ? <Loader2 className="w-6 h-6 animate-spin self-center my-10" />

          : hasItems ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {groupedCart.map((group) => {
                  return (
                    <div key={group.productId} className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 space-y-3">
                      {/* Product Group Header */}
                      <div className="flex gap-3">
                        <img
                          src={group.image}
                          alt={group.name}
                          className="w-16 h-16 object-contain rounded-md border bg-white flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 text-left leading-snug">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[10px] bg-red-50 text-[#ED1C24] px-2 py-0.5 rounded-full font-bold">
                              Slab: {group.appliedSlab}+ units
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                              Total: {group.totalQty} units
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 text-sm">
                            ₹{group.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Variant Sub-items List */}
                      <div className="border-t border-slate-100 pt-2.5 space-y-2">
                        {group.items.map((item) => {
                          const isLoading = loadingItemId === item.uniqueId;
                          return (
                            <div key={item.uniqueId} className="flex items-center justify-between pl-4 py-1">
                              <div className="text-left">
                                <span className="font-semibold text-slate-700 capitalize text-xs">{item.variantName}</span>
                                <span className="text-[10px] text-slate-500 block">₹{item.price.toFixed(2)} / unit</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center border rounded-md bg-white">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    disabled={isLoading}
                                    onClick={() => handleUpdateCart("remove", group.productId, item.variantId, 1, item.uniqueId)}
                                  >
                                    −
                                  </Button>
                                  <div className="w-8 flex justify-center items-center">
                                    {isLoading ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <span className="font-bold text-slate-800 text-xs">
                                        {item.quantity}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    disabled={isLoading || item.quantity >= item.stock}
                                    onClick={() => handleUpdateCart("add", group.productId, item.variantId, 1, item.uniqueId)}
                                  >
                                    +
                                  </Button>
                                </div>
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleUpdateCart("remove", group.productId, item.variantId, item.quantity, item.uniqueId)}
                                  className="text-slate-400 hover:text-[#ED1C24] transition text-xs font-semibold p-1"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
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
                      Complete your B2B profile & primary warehouse address to proceed.
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
