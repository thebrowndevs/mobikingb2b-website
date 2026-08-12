"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { apiConnector } from "@/lib/services/apiConnector";
import ProductCard1 from "@/components/ProductCard1";
import { homeEndPoints } from "@/lib/api";
import { useParams } from "next/navigation";

export default function GroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ lastIndex: -1, hasMore: true });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const paginationRef = useRef(pagination);
    const observerRef = useRef(null);
    const observedElRef = useRef(null);

    const { GET_GROUP_PRODUCTS_BY_ID_API } = homeEndPoints;

    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    // Fetch products for this group
    const fetchProducts = useCallback(
        async (cursor = null, initial = false) => {
            if (!initial && !paginationRef.current.hasMore) return;

            const limit = 20;
            const lastIndexToSend =
                typeof cursor === "number"
                    ? cursor
                    : paginationRef.current.lastIndex ?? -1;

            try {
                if (!initial) setLoadingMore(true);

                const response = await apiConnector(
                    "GET",
                    `${GET_GROUP_PRODUCTS_BY_ID_API}/${id}?limit=${limit}&lastIndex=${lastIndexToSend}`
                );

                const newGroup = response?.data?.data?.group || null;
                const newProducts = response?.data?.data?.products || [];
                const newPagination = response?.data?.data?.pagination || {};

                if (initial) setGroup(newGroup);

                setProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => String(p._id)));
                    const filtered = newProducts.filter(
                        (p) => !existingIds.has(String(p._id))
                    );
                    return [...prev, ...filtered];
                });

                setPagination((prev) => {
                    const merged = { ...prev, ...newPagination };
                    paginationRef.current = merged;
                    return merged;
                });
            } catch (err) {
                console.error("Failed to fetch group products:", err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [id]
    );

    // Initial load
    useEffect(() => {
        fetchProducts(-1, true);
    }, [id, fetchProducts]);

    // Infinite scroll
    useEffect(() => {
        if (loading || loadingMore || !pagination.hasMore) return;

        if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry?.isIntersecting && paginationRef.current.hasMore) {
                        fetchProducts(paginationRef.current.lastIndex, false);
                    }
                },
                { threshold: 0.5 }
            );
        }

        const lastProductEl = document.querySelector(".product-last");

        if (observedElRef.current && observedElRef.current !== lastProductEl) {
            try {
                observerRef.current.unobserve(observedElRef.current);
            } catch { }
            observedElRef.current = null;
        }

        if (lastProductEl && observedElRef.current !== lastProductEl) {
            observerRef.current.observe(lastProductEl);
            observedElRef.current = lastProductEl;
        }

        return () => {
            if (observerRef.current && observedElRef.current) {
                try {
                    observerRef.current.unobserve(observedElRef.current);
                } catch { }
                observedElRef.current = null;
            }
        };
    }, [products.length, pagination.hasMore, loadingMore, fetchProducts]);

    if (loading) {
        return (
            <div className="w-full pb-16 pt-4 bg-slate-50">
                <div className="w-full px-4">
                    {/* Banner Skeleton */}
                    <div className="hidden min-[501px]:block w-full aspect-[16/3] bg-slate-200 animate-pulse rounded-sm mb-6" />
                    <div className="block min-[501px]:hidden w-full aspect-[2/1] bg-slate-200 animate-pulse rounded-sm mb-6" />
                    {/* Header Skeleton */}
                    <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-sm mb-8" />
                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 12 }).map((_, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-sm p-3 animate-pulse space-y-3">
                                <div className="w-full aspect-square bg-slate-200 rounded-sm" />
                                <div className="h-4 w-3/4 bg-slate-200 rounded-sm" />
                                <div className="h-4 w-1/2 bg-slate-200 rounded-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!group)
        return (
            <div className="p-6 text-center text-gray-600">
                Group not found or inactive.
            </div>
        );

    // Support both website keys and legacy backend API keys
    const name = group.heading || group.name;
    const webBanner = group.webBanner || group.banner;
    const bannerLink = group.bannerLink;
    const isWebBannerVisible = group.isWebBannerVisible !== undefined ? group.isWebBannerVisible : group.isBannerVisble;
    const isWebBgColorVisible = group.isWebBgColorVisible !== undefined ? group.isWebBgColorVisible : group.isBackgroundColorVisible;
    const webBackgroundColor = group.webBackgroundColor || group.backgroundColor || "#ffffff";
    const isBannerLinkActive = group.isBannerLinkActive !== undefined ? group.isBannerLinkActive : true;

    // Auto-detect text color based on background brightness
    const bgColor = webBackgroundColor;
    const rgb = parseInt(bgColor.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? "text-gray-900" : "text-white";

    return (
        <section
            className={`transition-all duration-300 pb-16 ${isWebBgColorVisible ? "pt-3 sm:pt-6" : "pt-3 sm:pt-6"
                }`}
            style={{
                backgroundColor: isWebBgColorVisible ? bgColor : "transparent",
            }}
        >
            <div className="w-full px-4">

                {/* Banner Section */}
                {isWebBannerVisible && webBanner ? (
                    <div className="relative mb-6 overflow-hidden">
                        {/* Desktop layout: 16:3 aspect ratio */}
                        <div className="hidden min-[501px]:block relative aspect-[16/3] w-full">
                            {isBannerLinkActive && bannerLink ? (
                                <a href={bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <img
                                        src={webBanner}
                                        alt={name}
                                        className="absolute inset-0 w-full h-full object-cover rounded-sm"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={webBanner}
                                    alt={name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-sm"
                                />
                            )}
                        </div>
                        {/* Mobile layout: 2:1 aspect ratio */}
                        <div className="block min-[501px]:hidden relative aspect-[2/1] w-full">
                            {isBannerLinkActive && bannerLink ? (
                                <a href={bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <img
                                        src={webBanner}
                                        alt={name}
                                        className="absolute inset-0 w-full h-full object-cover rounded-sm"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={webBanner}
                                    alt={name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-sm"
                                />
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Title */}
                <div className="flex justify-between items-center mb-6 pt-2">
                    <h1
                        className={`text-2xl sm:text-3xl font-bold uppercase tracking-tight ${isWebBgColorVisible ? textColor : "text-gray-950"
                            }`}
                    >
                        {name}
                    </h1>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {products.map((product, idx) => {
                        const isLast = idx === products.length - 1;
                        return (
                            <div
                                key={product._id}
                                className={`w-full ${isLast ? "product-last" : ""}`}
                            >
                                <ProductCard1 product={product} />
                            </div>
                        );
                    })}
                </div>

                {/* Loading spinner while fetching more */}
                {loadingMore && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
                    </div>
                )}

                {/* End text */}
                {!pagination.hasMore && !loadingMore && (
                    <div
                        className={`text-center pt-10 pb-4 text-xs sm:text-sm font-medium ${textColor === "text-white" ? "text-gray-200" : "text-gray-400"
                            }`}
                    >
                        Thanks for shopping with Mobiking Wholesale.
                    </div>
                )}
            </div>
        </section>
    );
}
