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

    // ✅ Fetch products for this group
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

    // ✅ Initial load
    useEffect(() => {
        fetchProducts(-1, true);
    }, [id, fetchProducts]);

    // ✅ Infinite scroll
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

    if (loading)
        return (
            <div className="h-80 w-full flex items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12 text-gray-400" />
            </div>
        );

    if (!group)
        return (
            <div className="p-6 text-center text-gray-600">
                Group not found or inactive.
            </div>
        );

    const {
        name,
        banner,
        bannerLink,
        isBannerVisble,
        isBannerLinkActive,
        isBackgroundColorVisible,
        backgroundColor,
    } = group;

    // ✅ Auto-detect text color based on background brightness
    const bgColor = backgroundColor || "#ffffff";
    // console.log(bgColor)
    const rgb = parseInt(bgColor.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? "text-gray-900" : "text-white";

    return (
        <section
            className={`transition-all duration-300 pb-8 ${isBackgroundColorVisible ? "pt-3 sm:pt-6" : "pt-3 sm:pt-6"
                }`}
            style={{
                backgroundColor: isBackgroundColorVisible ? bgColor : "transparent",
            }}
        >
            {/* ✅ Banner Section */}
            {isBannerVisble && banner ? (
                <div className="relative mb-5 overflow-hidden px-2 sm:px-4">
                    <div className="relative aspect-[12/5] w-full">
                        {isBannerLinkActive && bannerLink ? (
                            <a href={bannerLink} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={banner}
                                    alt={name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                                />
                            </a>
                        ) : (
                            <img
                                src={banner}
                                alt={name}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                            />
                        )}
                    </div>
                </div>
            ) : null}

            {/* ✅ Title */}
            <div className="max-w-[97vw] mx-auto px-4 flex justify-between items-center mb-6">
                <h1
                    className={`relative inline-block text-2xl md:text-3xl font-bold capitalize ${isBackgroundColorVisible ? textColor : "text-gray-900"
                        }`}
                >
                    {name}
                    <span className="absolute left-0 -bottom-2 w-20 h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"></span>
                </h1>
            </div>

            {/* ✅ Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3 px-2 sm:px-4">
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

            {/* ✅ Loading spinner while fetching more */}
            {loadingMore && (
                <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
                </div>
            )}

            {/* ✅ End text */}
            {!pagination.hasMore && !loadingMore && (
                <div
                    className={`text-center py-6 text-sm sm:text-base ${textColor === "text-white" ? "text-gray-200" : "text-gray-600"
                        }`}
                >
                    Thanks for shopping with Mobiking Wholesale.
                </div>
            )}
        </section>
    );
}
