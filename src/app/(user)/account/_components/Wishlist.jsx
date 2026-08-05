"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { removeWishlistById } from "@/lib/services/operations/WishlistApi";
import { addCartById } from "@/lib/services/operations/CartApi";
// Assuming both these functions are in the same file based on your import

export default function Wishlist() {
  const { user, accessToken, setUser } = useAuth();

  // State to track which item is being processed by its ID
  const [loadingProductId, setLoadingProductId] = useState(null);

  // This correctly gets the wishlist items from the user object in your AuthContext
  const wishlistItems = user?.wishlist || [];

  const handleRemove = async (productId) => {
    if (loadingProductId || !accessToken) return;

    setLoadingProductId(productId);
    try {
      // This function needs to be implemented in your API services.
      // It should take a productId and return the updated user object.
      const response = await removeWishlistById({ productId }, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (loadingProductId || !accessToken) return;

    // This "default variant" strategy is the correct approach for this UI.
    // It correctly uses the `variants` object from your API response.
    const defaultVariantName = Object.keys(product.variants || {})[0];
    if (!defaultVariantName) {
      console.error("Product has no variants to add to cart.");
      return;
    }

    setLoadingProductId(product._id);
    const body = {
      productId: product._id,
      cartId: user?.cart?._id,
      variantName: defaultVariantName,
    };

    try {
      const response = await addCartById(body, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Failed to add to cart from wishlist:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  // A good practice: show a loading state until the user data is available.
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto sm:p-4">
      {wishlistItems.length > 0 ? (
        <div className="space-y-6">
          {wishlistItems.map((item) => {
            // This correctly extracts the price from the nested array in your API response
            const price = item.sellingPrice?.[0]?.price || 0;
            const isLoading = loadingProductId === item._id;

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row gap-4 border-b pb-6"
              >
                {/* Link uses `item.slug` - correct */}
                <Link href={`/ps/${item.slug}`}>
                  <img
                    // Image uses `item.images` - correct
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.fullName}
                    className="w-full sm:w-32 h-32 object-contain rounded-md border bg-gray-50"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/ps/${item.slug}`}>
                      <h2 className="font-semibold text-base sm:text-lg hover:text-primary transition-colors">
                        {/* Name uses `item.fullName` - correct */}
                        {item.fullName}
                      </h2>
                    </Link>
                    <p className="text-xl font-bold text-gray-800 mt-2">
                      ₹{price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(item._id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State UI
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Heart className="mx-auto w-16 h-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-gray-500">
            Save items you love by clicking the heart icon.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
