// components/ResultsGrid.jsx
"use client";
import ProductCard1 from "@/components/ProductCard1";
import React, { useRef, useEffect } from "react";

export default function ResultsGrid({
    results = [],
    isLoading = false,
    isFetchingMore = false,
    hasMore = false,
    loadMore = () => { },
    onProductClick = () => { },
}) {
    const sentinelRef = useRef(null);

    // Intersection Observer to trigger loadMore
    useEffect(() => {
        if (!hasMore) return;
        const node = sentinelRef.current;
        if (!node) return;

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadMore();
                    }
                });
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0.1,
            }
        );

        obs.observe(node);
        return () => obs.disconnect();
    }, [hasMore, loadMore]);

    return (
        <>
            {isLoading && (
                <div className="w-full flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2 items-stretch place-items-stretch">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-64 rounded bg-gray-200 animate-pulse" />
                    ))}
                </div>
            )}

            {!isLoading && results.length === 0 && <div className="text-gray-500">No products found.</div>}

            {!isLoading && results.length > 0 && (
                <ul className="w-full flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2 items-stretch place-items-stretch overflow-auto">
                    {results.map((item, idx) => (
                        <li
                            key={item._id ?? idx}
                            onClick={() => onProductClick(item)}
                            className="cursor-pointer w-full h-full"
                        >
                            <ProductCard1 product={item} />
                        </li>
                    ))}
                </ul>
            )}

            {/* sentinel */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {isFetchingMore && (
                <div className="mt-3 text-center text-sm text-gray-500">Loading more products...</div>
            )}

            {!isFetchingMore && !hasMore && results.length > 0 && (
                <div className="mt-3 text-center text-sm text-gray-500"></div>
            )}
        </>
    );
}
