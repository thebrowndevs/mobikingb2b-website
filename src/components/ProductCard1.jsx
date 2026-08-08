"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";
import {
  getWishlistById,
  removeWishlistById,
} from "@/lib/services/operations/WishlistApi";
import {
  addCartById,
  removeFromCartById,
} from "@/lib/services/operations/CartApi";
import { cn } from "@/lib/utils";

export default function ProductCard1({ product, badge, discount }) {
  const { user, accessToken, setUser, setLoginOpen } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const variants = product.variants || {};
  const variantEntries = Object.entries(variants);
  const [defaultVariantName, defaultVariantStock] = variantEntries?.filter(vr => vr[1] > 0)[0] || [
    null,
    0,
  ];

  const cartItem = user?.cart?.items?.find(
    (item) =>
      item.productId?._id === product._id &&
      item.variantName === defaultVariantName
  );
  const quantity = cartItem?.quantity || 0;
  const isWishlisted =
    user?.wishlist?.some((item) => item._id === product._id) || false;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!accessToken) {
      setLoginOpen(true);
      return;
    }

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    const body = { productId: product._id };

    try {
      const apiCall = isWishlisted ? removeWishlistById : getWishlistById;
      const response = await apiCall(body, accessToken);

      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Wishlist update error:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleUpdateCart = async (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (!accessToken) {
      setLoginOpen(true);
      return;
    }
    if (!defaultVariantName || isLoading) return;

    setIsLoading(true);
    const body = {
      productId: product._id,
      cartId: user?.cart?._id,
      variantName: defaultVariantName,
    };

    try {
      const apiCall = action === "add" ? addCartById : removeFromCartById;
      const response = await apiCall(body, accessToken);

      if (response?.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      // silent for now
    } finally {
      setIsLoading(false);
    }
  };

  const displayPrice = product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;
  const originalPrice = product?.regularPrice;

  // --- RATING DATA ---
  const rating = typeof product.rating === "number" ? product.rating : (product?.rating ? Number(product.rating) : 4);
  const reviewCount = product.reviewCount || 425;

  // helper to render stars (fractional fill supported)
  const renderStars = (ratingValue) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      // fill fraction between 0..1 for this star slot
      const fill = Math.max(0, Math.min(1, ratingValue - i));
      stars.push(
        <span key={i} className="relative inline-block w-4 h-4 text-[14px] leading-none -mr-1" aria-hidden>
          {/* base (gray) star */}
          <span className="text-gray-300 select-none">★</span>

          {/* colored overlay clipped to fill percent */}
          {fill > 0 && (
            <span
              className="absolute left-0 top-0 overflow-hidden select-none"
              style={{ width: `${fill * 100}%` }}
            >
              <span className="text-yellow-400">★</span>
            </span>
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="w-full transition-all h-full">
      <div
        className={cn(
          "flex flex-col h-full justify-between gap-2 border rounded-sm p-3 relative group transition-shadow duration-300",
          quantity > 0
            ? "bg-green-50 border-green-600 shadow-md"
            : "bg-white border-gray-200 hover:shadow-md"
        )}
      >
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/60 hover:bg-white"
          disabled={isWishlistLoading || isLoading}
        >
          {isWishlistLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
          ) : (
            <Heart
              className={`h-5 w-5 ${isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
                }`}
            />
          )}
        </button>

        {/* Image and Badge */}
        <Link href={`/ps/${product.slug}`} className="block">
          <div className="relative w-full h-[120px] sm:h-[200px] bg-white rounded-lg flex items-center justify-center mb-2 overflow-hidden">
            <img
              src={product.images?.[0] ?? "/not-found-img.webp"}
              alt={product.fullName || "Product image"}
              className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // prevent infinite loop if fallback image also fails
                if (e.currentTarget.src !== window.location.origin + "/not-found-img.webp") {
                  e.currentTarget.src = "/not-found-img.webp";
                }
              }}
            />
            {discount && (
              <div className={`absolute top-0 left-1 ${badge.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow`}>
                {`${discount || 0} %`}
              </div>
            )}
          </div>

          <h1 className="text-sm font-medium text-gray-900 line-clamp-4 text-left">
            {product.fullName}
          </h1>

          {/* RATING ROW */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {renderStars(rating)}
            </div>
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">{rating ? rating.toFixed(1) : "0.0"}</span>
              <span className="ml-1">({reviewCount?.toLocaleString() || 0})</span>
            </span>
          </div>
        </Link>        {/* Price + MOQ */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col items-start gap-1">
          <p className="text-sm font-extrabold text-[#ED1C24]">
            {product.minPrice !== undefined && product.maxPrice !== undefined ? (
              product.minPrice === product.maxPrice ? (
                `₹${product.minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                `₹${product.minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${product.maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )
            ) : (
              `₹${displayPrice.toLocaleString()}`
            )}
          </p>
          <div className="flex items-center justify-between w-full text-[11px] text-gray-500 font-semibold">
            <span>MOQ: {product.moq || 60} units</span>
            {variantEntries.length > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold capitalize">
                {variantEntries.length} {variantEntries.length === 1 ? "variant" : "variants"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
