"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard1 from "../ProductCard1";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiConnector } from "@/lib/services/apiConnector";
import { homeEndPoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
const { GET_HOME_WEBSITE } = homeEndPoints;

export default function Group2() {
  const {setHomeBanners} = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ lastIndex: -1, hasMore: true });
  const paginationRef = useRef(pagination); // mirror of pagination for synchronous reads
  const scrollContainerRefs = useRef({});
  const observerRef = useRef(null);
  const observedElRef = useRef(null);

  // keep paginationRef in sync whenever pagination state changes
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // fetchGroups accepts explicit cursor and initial flag
  const fetchGroups = useCallback(
    async (cursor = null, initial = false) => {
      // if not initial and server says no more, bail out
      if (!initial && !paginationRef.current.hasMore) return;

      const limit = initial ? 5 : 3;
      const lastIndexToSend = typeof cursor === "number" ? cursor : paginationRef.current.lastIndex ?? -1;

      try {
        if (!initial) setLoadingMore(true);

        // console.log("Requesting groups with", { limit, productLimit: 14, lastIndex: lastIndexToSend });

        const response = await apiConnector(
          "GET",
          `${GET_HOME_WEBSITE}?limit=${limit}&productLimit=14&lastIndex=${lastIndexToSend}`
        );
        setHomeBanners(response?.data?.data?.banners)
        const newGroups = response?.data?.data?.groups || [];
        const newPagination = response?.data?.data?.pagination || {};

        // Append new groups without duplicates
        setGroups((prev) => {
          const existingIds = new Set(prev.map((g) => String(g._id)));
          const filtered = newGroups.filter((g) => !existingIds.has(String(g._id)));
          return [...prev, ...filtered];
        });

        // Merge and update pagination safely; update paginationRef synchronously inside setState callback
        setPagination((prev) => {
          const merged = { ...prev, ...newPagination };
          paginationRef.current = merged;
          return merged;
        });
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // First load
  useEffect(() => {
    fetchGroups(-1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver: observe the current last group element, unobserve previous, and request next page
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting && !loadingMore && paginationRef.current.hasMore) {
            // explicit cursor from paginationRef to avoid stale closure
            fetchGroups(paginationRef.current.lastIndex, false);
          }
        },
        { threshold: 0.5, root: null }
      );
    }

    const lastGroupEl = document.querySelector(".group-last");

    // if the observed element changed, unobserve previous and observe new
    if (observedElRef.current && observedElRef.current !== lastGroupEl) {
      try { observerRef.current.unobserve(observedElRef.current); } catch (e) { /* noop */ }
      observedElRef.current = null;
    }

    if (lastGroupEl && observedElRef.current !== lastGroupEl) {
      observerRef.current.observe(lastGroupEl);
      observedElRef.current = lastGroupEl;
    }

    // cleanup on unmount: unobserve element but keep observer for reuse
    return () => {
      if (observerRef.current && observedElRef.current) {
        try { observerRef.current.unobserve(observedElRef.current); } catch (e) { /* noop */ }
        observedElRef.current = null;
      }
    };
    // we intentionally depend on groups.length to re-run when list grows/shrinks
  }, [groups.length, loadingMore]);

  const scrollLeft = (groupId) => {
    const container = scrollContainerRefs.current[groupId];
    if (container) container.scrollBy({ left: -600, behavior: "smooth" });
  };

  const scrollRight = (groupId) => {
    const container = scrollContainerRefs.current[groupId];
    if (container) container.scrollBy({ left: 600, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-gray-400" />
      </div>
    );

  return (
    <div className="gap-0 md:gap-0 flex flex-col lg:px-[0px] w-full lg:mx-auto">
      {groups.map((group, idx) => {
        if (!group.products?.length) return null;

        const bgColor = group?.backgroundColor || "#ffffff";
        const rgb = parseInt(bgColor.substring(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? "text-gray-900" : "text-white";

        const activeProducts = group.products.filter((p) => p?.active && p?.totalStock > 0);

        if (!activeProducts.length) return null;

        const isLast = idx === groups.length - 1;

        return (
          <section
            key={String(group._id)}
            className={`w-full overflow-hidden transition-all duration-300 ${group.isBackgroundColorVisible ? 'pb-8 mb-4 sm:pb-9 pt-3 sm:pt-8' : 'pb-4'} ${isLast ? 'group-last' : ''}`}
            style={{ backgroundColor: group.isBackgroundColorVisible ? bgColor : 'transparent' }}
          >
               {/* ✅ Banner Section */}
            {group.isBannerVisble && group.banner ? (
                <div className={`relative overflow-hidden px-2 sm:px-4 py-5 `}>
                    <div className="relative aspect-[12/5] w-full">
                        {group.isBannerLinkActive && group.bannerLink ? (
                            <a href={group.bannerLink} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={group.banner}
                                    alt={group.name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                                />
                            </a>
                        ) : (
                            <img
                                src={group.banner}
                                alt={group.name}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                            />
                        )}
                    </div>
                </div>
            ) : null}

            {/* Group header */}
            <div className={`mx-auto px-2 md:px-4 flex justify-between items-center mb-5 ${group.isBannerVisble && group.isBackgroundColorVisible ? "  ": "pt-3"}`}>
              <h2 className={`text-2xl md:text-2xl lg:text-3xl font-bold ${group.isBackgroundColorVisible ? ` ${textColor}` : "text-gray-800"
                }`}>
                {group.name}
              </h2>
              <Link href={`/gp/${group?._id}`}>
                <Button variant="outline" className={'bg-white text-gray-800'}>
                  See All Products
                </Button>
              </Link>
            </div>

            {/* Desktop horizontal scroll */}
            <div className="hidden lg:block relative px-4">
              {activeProducts.length > 6 && (
                <>
                  <button onClick={() => scrollLeft(group._id)} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg border">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => scrollRight(group._id)} className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg border">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div ref={(el) => (scrollContainerRefs.current[group._id] = el)} className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-2">
                {activeProducts.map((product) => (
                  <div key={product._id} className="min-w-44 max-w-55 flex-shrink-0">
                    <ProductCard1 product={product} textColor={textColor} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile grid */}
            <div className="lg:hidden overflow-x-auto px-2 sm:px-4">
              <div className={`grid grid-flow-col ${activeProducts.length <= 1 ? "grid-rows-1" : "grid-rows-2"} max-w-[97vw] mx-auto gap-2`}>
                {activeProducts.map((product) => (
                  <div key={product._id} className="min-w-[160px] w-[160px] h-full">
                    <ProductCard1 product={product} textColor={textColor} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
}