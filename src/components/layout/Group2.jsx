"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import ProductCard1 from "../ProductCard1";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiConnector } from "@/lib/services/apiConnector";
import { homeEndPoints } from "@/lib/api";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const { GET_WEBSITE_GROUPS } = homeEndPoints;

export default function Group2() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, hasMore: true });
  const paginationRef = useRef(pagination); // mirror of pagination for synchronous reads
  const observerRef = useRef(null);
  const observedElRef = useRef(null);

  // keep paginationRef in sync
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchGroups = useCallback(
    async (pageNum = 1, initial = false) => {
      if (!initial && !paginationRef.current.hasMore) return;

      const limit = initial ? 3 : 2;

      try {
        if (!initial) setLoadingMore(true);

        const response = await apiConnector(
          "GET",
          `${GET_WEBSITE_GROUPS}?limit=${limit}&page=${pageNum}`
        );
        
        const newGroups = response?.data?.data?.groups || [];
        const newPagination = response?.data?.data?.pagination || {};

        setGroups((prev) => {
          if (initial) return newGroups;
          const existingIds = new Set(prev.map((g) => String(g._id)));
          const filtered = newGroups.filter((g) => !existingIds.has(String(g._id)));
          return [...prev, ...filtered];
        });

        setPagination({
          page: newPagination.page || 1,
          limit: newPagination.limit || limit,
          totalPages: newPagination.totalPages || 0,
          hasMore: (newPagination.page || 1) < (newPagination.totalPages || 0)
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

  useEffect(() => {
    fetchGroups(1, true);
  }, [fetchGroups]);

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting && !loadingMore && paginationRef.current.hasMore) {
            fetchGroups((paginationRef.current.page || 1) + 1, false);
          }
        },
        { threshold: 0.5, root: null }
      );
    }

    const lastGroupEl = document.querySelector(".group-last");

    if (observedElRef.current && observedElRef.current !== lastGroupEl) {
      try { observerRef.current.unobserve(observedElRef.current); } catch (e) { /* noop */ }
      observedElRef.current = null;
    }

    if (lastGroupEl && observedElRef.current !== lastGroupEl) {
      observerRef.current.observe(lastGroupEl);
      observedElRef.current = lastGroupEl;
    }

    return () => {
      if (observerRef.current && observedElRef.current) {
        try { observerRef.current.unobserve(observedElRef.current); } catch (e) { /* noop */ }
        observedElRef.current = null;
      }
    };
  }, [groups.length, loadingMore, fetchGroups]);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 lg:mx-auto">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="w-full pb-4 overflow-hidden">
            <div className="w-full lg:max-w-[90%] lg:mx-auto space-y-4">
              {/* Header row skeleton */}
              <div className="flex justify-between items-center px-4 pt-3">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
              </div>

              {/* Horizontal scroll cards skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-4 py-2">
                {Array.from({ length: 6 }).map((_, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`w-full space-y-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm animate-pulse 
                      ${cIdx >= 2 ? 'hidden sm:block' : ''} 
                      ${cIdx >= 3 ? 'hidden md:block' : ''} 
                      ${cIdx >= 4 ? 'hidden lg:block' : ''} 
                      ${cIdx >= 5 ? 'hidden xl:block' : ''}
                    `}
                  >
                    {/* Card Image */}
                    <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    {/* Card Title line 1 */}
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    {/* Card Price line */}
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="gap-0 flex flex-col w-full lg:mx-auto">
      {groups.map((group, idx) => {
        // Resolve items depending on groupType
        let items = [];
        if (group.groupType === 'subcategories') {
          items = group.subcategories || [];
        } else if (group.groupType === 'categories') {
          items = group.categories || [];
        } else {
          items = group.products?.filter(p => p.active) || [];
        }

        if (!items.length) return null;

        const bgColor = group?.webBackgroundColor || "#ffffff";
        const rgb = parseInt(bgColor.replace("#", ""), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? "text-gray-900" : "text-white";

        const isLast = idx === groups.length - 1;
        const isScroll = group.placement === 'scroll';

        // Render card helpers
        const renderItem = (item) => {
          if (group.groupType === 'subcategories') {
            return (
              <Link href={`/cs/${item.slug}`} className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 py-1">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-slate-100 overflow-hidden bg-white shadow-sm transition transform group-hover:scale-105 group-hover:shadow-md">
                  <img src={item.photos?.[0] || '/not-found-img.webp'} alt={item.name} className="object-cover w-full h-full p-1 rounded-full" />
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-indigo-650 transition truncate max-w-[85px] sm:max-w-[100px]">{item.name}</span>
              </Link>
            );
          } else if (group.groupType === 'categories') {
            return (
              <Link href={`/categories`} className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 py-1">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-slate-100 overflow-hidden bg-white shadow-sm transition transform group-hover:scale-105 group-hover:shadow-md">
                  <img src={item.image || '/not-found-img.webp'} alt={item.name} className="object-cover w-full h-full p-1 rounded-full" />
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-indigo-650 transition truncate max-w-[85px] sm:max-w-[100px]">{item.name}</span>
              </Link>
            );
          } else {
            return <ProductCard1 product={item} />;
          }
        };

        return (
          <section
            key={String(group._id)}
            className={`w-full overflow-hidden transition-all duration-300 ${group.isWebBgColorVisible ? 'pb-8 mb-4 sm:pb-9 pt-3 sm:pt-8' : 'pb-4'} ${isLast ? 'group-last' : ''}`}
            style={{ backgroundColor: group.isWebBgColorVisible ? bgColor : 'transparent' }}
          >
            <div className="w-full lg:max-w-[90%] lg:mx-auto">
              {/* ✅ Banner Section */}
              {group.isWebBannerVisible && group.webBanner ? (
                <div className="relative overflow-hidden px-2 sm:px-4 py-5">
                  {/* Desktop layout: 16:3 aspect ratio */}
                  <div className="hidden min-[501px]:block relative aspect-[16/3] w-full">
                    {group.bannerLink ? (
                      <a href={group.bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img
                          src={group.webBanner}
                          alt={group.heading || group.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                        />
                      </a>
                    ) : (
                      <img
                        src={group.webBanner}
                        alt={group.heading || group.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                      />
                    )}
                  </div>
                  {/* Mobile layout: 2:1 aspect ratio */}
                  <div className="block min-[501px]:hidden relative aspect-[2/1] w-full">
                    {group.bannerLink ? (
                      <a href={group.bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img
                          src={group.webBanner}
                          alt={group.heading || group.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                        />
                      </a>
                    ) : (
                      <img
                        src={group.webBanner}
                        alt={group.heading || group.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {/* Group header */}
              <div className={`mx-auto px-2 md:px-4 flex justify-between items-center mb-5 ${group.isWebBannerVisible && group.isWebBgColorVisible ? "  " : "pt-3"}`}>
                <h2 className={`text-2xl md:text-2xl lg:text-3xl font-bold ${group.isWebBgColorVisible ? ` ${textColor}` : "text-gray-800"}`}>
                  {group.heading || group.name}
                </h2>
                {group.groupType === 'products' && (
                  <Link href={`/gp/${group?._id}`}>
                    <Button variant="outline" className="bg-white text-gray-800 border-slate-200 hover:bg-slate-50">
                      See All Products
                    </Button>
                  </Link>
                )}
              </div>

              {/* Render Scroll/Swiper View */}
              {isScroll ? (
                <div className="relative px-4">
                  <Swiper
                    modules={[Autoplay, Navigation]}
                    slidesPerView={group.groupType === 'products' ? 2 : 4}
                    loop={items.length > (group.groupType === 'products' ? 6 : 4)}
                    speed={600}
                    spaceBetween={12}
                    autoplay={{
                      delay: 3500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    navigation={true}
                    breakpoints={
                      group.groupType === 'products'
                        ? {
                            480: { slidesPerView: 3, spaceBetween: 12 },
                            640: { slidesPerView: 4, spaceBetween: 12 },
                            1024: { slidesPerView: 5, spaceBetween: 12 },
                            1280: { slidesPerView: 6, spaceBetween: 12 },
                          }
                        : {
                            480: { slidesPerView: 5, spaceBetween: 12 },
                            768: { slidesPerView: 6, spaceBetween: 12 },
                            1024: { slidesPerView: 8, spaceBetween: 12 },
                          }
                    }
                    className="overflow-hidden py-2"
                  >
                    {items.map((item) => (
                      <SwiperSlide key={item._id}>
                        <div className="w-full">
                          {renderItem(item)}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                /* Render Grid View */
                <div className="px-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {items.map((item) => (
                      <div key={item._id} className="w-full">
                        {renderItem(item)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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