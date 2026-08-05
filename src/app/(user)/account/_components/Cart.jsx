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
  const [processedCartItems, setProcessedCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const rawItems = user?.cart?.items || [];

    const items = rawItems.map((item) => {
      const product = item.productId || {};
      const productId = product._id;
      const variantName = item.variantName;
      const uniqueId = `${productId}-${variantName}`;
      // const price = product.sellingPrice?.[0]?.price || 0;
      const price = item?.price;
      const stock = product.variants?.[variantName] || 0;

      // Extract the slug from the populated product data
      const slug = product.slug;

      return {
        uniqueId,
        productId,
        variantName,
        name: product.fullName || "Unnamed Product",
        image: product.images?.[0] || "/placeholder.png",
        price,
        stock,
        quantity: item.quantity || 1,
        slug: slug, // Add the slug to the processed item object
      };
    });

    setProcessedCartItems(items);
    const newTotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
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
        // toast.success(
        //   `Item ${action === "add" ? "added to" : "removed from"} cart.`
        // );
      }
    } catch (err) {
      console.error("Cart update error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const hasItems = processedCartItems.length > 0;

  return (
    <div className="w-full mx-auto sm:p-4">
      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ul className="space-y-6 md:col-span-2">
            {processedCartItems.map((item) => {
              const isLoading = loadingItemId === item.uniqueId;
              return (
                <li key={item.uniqueId} className="flex gap-4 border-b pb-6">
                  {/* Correctly use the slug from the processed item */}
                  <Link href={item.slug ? `/ps/${item.slug}` : "#"}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-md border bg-gray-50"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-semibold text-base sm:text-lg">
                        {item.name}
                      </h2>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.variantName}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Price: ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          disabled={isLoading}
                          onClick={() => handleUpdateCart("remove", item)}
                        >
                          −
                        </Button>
                        <div className="w-12 text-center font-medium">
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          disabled={isLoading || item.quantity >= item.stock}
                          onClick={() => handleUpdateCart("add", item)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-lg font-bold text-right">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

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
