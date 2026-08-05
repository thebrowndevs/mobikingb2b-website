"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";

// Context and UI Components
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// API Functions
import { removeWishlistById } from "@/lib/services/operations/WishlistApi";
import { addCartById } from "@/lib/services/operations/CartApi";

// --- NEW: Import the custom hook ---
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function WishlistSheet({ isOpen, onClose }) {
  const { user, accessToken, setUser } = useAuth();
  const [loadingProductId, setLoadingProductId] = useState(null);

  // --- NEW: Use the hook to determine the screen size ---
  const { isDesktop } = useBreakpoint();

  const wishlistItems = user?.wishlist || [];

  const handleRemove = async (productId) => {
    if (loadingProductId || !accessToken) return;

    setLoadingProductId(productId);
    try {
      const response = await removeWishlistById({ productId }, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
        // toast.success("Item removed from wishlist.");
      }
    } catch (error) {
      toast.error("Failed to remove item.");
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (loadingProductId || !accessToken) return;
    const variants = product.variants || {};
    const variantKeys = Object.keys(variants);

    if (variantKeys.length === 0) {
      toast.error("This product is currently unavailable.");
      return;
    }

    // Logic to find first available variant
    const firstAvailableVariant =
      variantKeys.find((key) => variants[key] > 0) || variantKeys[0];
    const isProductInStock = variants[firstAvailableVariant] > 0;

    if (!isProductInStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    setLoadingProductId(product._id);
    const body = {
      productId: product._id,
      cartId: user?.cart?._id,
      variantName: firstAvailableVariant,
    };

    try {
      const response = await addCartById(body, accessToken);
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
        // toast.success(`${product.fullName} added to cart!`);
      }
    } catch (error) {
      toast.error("Failed to add item to cart.");
      console.error("Failed to add to cart from wishlist:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (wishlistItems.length === 0) {
      return (
        <div className="text-center flex flex-col items-center justify-center h-full px-4">
          <Heart className="mx-auto w-16 h-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-gray-500 text-center">
            Save items you love by clicking the heart icon.
          </p>
          <Button asChild className="mt-6" onClick={onClose}>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {wishlistItems.map((item, idx) => {
          const price = item.sellingPrice?.[item.sellingPrice?.length - 1]?.price || 0;
          const isLoading = loadingProductId === item._id;
          const variants = item.variants || {};
          const variantKeys = Object.keys(variants);
          const defaultVariantName =
            variantKeys.length > 0 ? variantKeys[0] : null;

          return (
            <div
              key={`${item._id}-${idx}`}
              className="flex gap-4 border-b pb-6 last:border-b-0"
            >
              <Link href={`/ps/${item.slug}`} onClick={onClose}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md border bg-gray-50"
                />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/ps/${item.slug}`} onClick={onClose}>
                    <h2 className="font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2">
                      {item.fullName}
                    </h2>
                  </Link>
                  {defaultVariantName && (
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {defaultVariantName}
                    </p>
                  )}
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    ₹{price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemove(item._id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        // --- NEW: Conditionally set the 'side' prop and add responsive classes ---
        side={isDesktop ? "right" : "bottom"}
        className="w-full lg:max-w-md p-0 flex flex-col lg:h-full h-auto rounded-t-2xl lg:rounded-t-none" // Responsive height and rounded corners
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            My Wishlist ({wishlistItems.length})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  );
}
