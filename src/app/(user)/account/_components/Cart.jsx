"use client";

import { useAuth } from "@/context/AuthContext";
import {
  addCartById,
  removeFromCartById,
} from "@/lib/services/operations/CartApi";
import React, { useEffect, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function Cart() {
  const { user, accessToken, setUser } = useAuth();

  const [loadingItemId, setLoadingItemId] = useState(null);
  const [groupedCart, setGroupedCart] = useState([]);
  const [total, setTotal] = useState(0);

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

    const newTotal = rawItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const hasItems = groupedCart.length > 0;

  return (
    <div className="w-full mx-auto sm:p-4">
      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {groupedCart.map((group) => {
              return (
                <div key={group.productId} className="border rounded-xl p-5 bg-white shadow-sm space-y-4 text-left">
                  {/* Product Card Info */}
                  <div className="flex gap-4">
                    <Link href={group.slug ? `/ps/${group.slug}` : "#"}>
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-md border bg-gray-50 flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-slate-800 text-base sm:text-lg line-clamp-2 leading-snug">
                        {group.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs bg-red-50 text-[#ED1C24] px-2.5 py-0.5 rounded-full font-bold">
                          Slab: {group.appliedSlab}+ units
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                          Total Qty: {group.totalQty} units
                        </span>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <p className="text-lg font-black text-slate-900">
                        ₹{group.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Sub-items list */}
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    {group.items.map((item) => {
                      const isLoading = loadingItemId === item.uniqueId;
                      return (
                        <div key={item.uniqueId} className="flex items-center justify-between pl-6 py-1">
                          <div className="text-left">
                            <span className="font-semibold text-slate-700 capitalize text-sm">{item.variantName}</span>
                            <span className="text-xs text-slate-500 block">₹{item.price.toFixed(2)} / unit</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg bg-white">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isLoading}
                                onClick={() => handleUpdateCart("remove", group.productId, item.variantId, 1, item.uniqueId)}
                              >
                                −
                              </Button>
                              <div className="w-10 text-center font-bold text-slate-800 text-sm">
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
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
                              className="text-slate-400 hover:text-[#ED1C24] transition text-sm font-semibold p-1"
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

          <div className="md:col-span-1">
            <div className="border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold border-b pb-4 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₹{total.toLocaleString()}</p>
                </div>
              </div>
              {/* <div className="flex justify-between font-bold text-lg border-t mt-4 pt-4">
                <p>Total</p>
                <p>₹{total.toLocaleString()}</p>
              </div> */}
              <Button size="lg" className="w-full mt-6 asChild">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto w-16 h-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty!</h2>
          <p className="mt-2 text-gray-500">
            Add items to your cart to see them here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
