"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard1 from "../ProductCard1";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiConnector } from "@/lib/services/apiConnector";
import { homeEndPoints } from "@/lib/api";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";

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
        { threshold: 0.05, root: null }
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
            <div className="w-full space-y-4">
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

        const webBg = group?.webBackgroundColor || "#ffffff";
        const webRgb = parseInt(webBg.replace("#", ""), 16);
        const webR = (webRgb >> 16) & 0xff;
        const webG = (webRgb >> 8) & 0xff;
        const webB = webRgb & 0xff;
        const webBrightness = (webR * 299 + webG * 587 + webB * 114) / 1000;
        const webTextColorClass = group.isWebBgColorVisible
          ? (webBrightness > 128 ? "min-[501px]:text-gray-900" : "min-[501px]:text-white")
          : "min-[501px]:text-gray-800";

        const appBg = group?.appBackgroundColor || "#ffffff";
        const appRgb = parseInt(appBg.replace("#", ""), 16);
        const appR = (appRgb >> 16) & 0xff;
        const appG = (appRgb >> 8) & 0xff;
        const appB = appRgb & 0xff;
        const appBrightness = (appR * 299 + appG * 587 + appB * 114) / 1000;
        const appTextColorClass = group.isAppBgColorVisible
          ? (appBrightness > 128 ? "text-gray-900" : "text-white")
          : "text-gray-800";

        const isLast = idx === groups.length - 1;
        const isScroll = group.placement === 'scroll';

        // Render card helpers
        const renderItem = (item) => {
          if (group.groupType === 'subcategories') {
            return (
              <Link href={`/cs/${item.slug}`} className="group flex flex-col items-center text-center w-full py-1 ">
                <div className="relative w-full aspect-square rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm transition transform group-hover:scale-105 group-hover:shadow-md">
                  <img src={item.photos?.[0] || '/not-found-img.webp'} alt={item.name} className="object-cover w-full h-full p-1.5 rounded-xl" />
                </div>
                <span className="mt-2 text-xs sm:text-base font-medium text-slate-700 group-hover:text-indigo-650 transition truncate w-full px-1">{item.name}</span>
              </Link>
            );
          } else if (group.groupType === 'categories') {
            return (
              <Link href={`/categories`} className="group flex flex-col items-center text-center w-full py-1">
                <div className="relative w-full aspect-square rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm transition transform group-hover:scale-105 group-hover:shadow-md">
                  <img src={item.image || '/not-found-img.webp'} alt={item.name} className="object-cover w-full h-full p-1.5 rounded-xl" />
                </div>
                <span className="mt-2 text-xs sm:text-base font-medium text-slate-700 group-hover:text-indigo-650 transition truncate w-full px-1">{item.name}</span>
              </Link>
            );
          } else {
            return <ProductCard1 product={item} />;
          }
        };

        const prevElClass = `swiper-prev-${group._id}`;
        const nextElClass = `swiper-next-${group._id}`;

        return (
          <section
            key={String(group._id)}
            className={`w-full overflow-hidden transition-all duration-300 bg-[var(--app-bg-color)] min-[501px]:bg-[var(--web-bg-color)] ${isLast ? 'group-last' : ''
              } ${group.isAppBgColorVisible ? 'pb-8 pt-3' : 'pb-10'} ${group.isWebBgColorVisible ? 'sm:pb-9 sm:pt-8' : ''
              }`}
            style={{
              "--web-bg-color": group.isWebBgColorVisible ? webBg : "transparent",
              "--app-bg-color": group.isAppBgColorVisible ? appBg : "transparent",
            }}
          >
            <div className="w-full">
              {/* ✅ Banner Section */}
              {(group.isWebBannerVisible && group.webBanner) || (group.isAppBannerVisible && group.appBanner) ? (
                <div className="relative overflow-hidden px-2 sm:px-4 -pt-2 -sm:pt-6 pb-5">
                  {/* Desktop layout: 16:3 aspect ratio */}
                  {group.isWebBannerVisible && group.webBanner && (
                    <div className="hidden min-[501px]:block relative aspect-[16/3] w-full">
                      {group.bannerLink ? (
                        <a href={group.bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          <img
                            src={group.webBanner}
                            alt={group.heading || group.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          />
                        </a>
                      ) : (
                        <img
                          src={group.webBanner}
                          alt={group.heading || group.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  {/* Mobile layout: 5:2 aspect ratio */}
                  {group.isAppBannerVisible && group.appBanner && (
                    <div className="block min-[501px]:hidden relative aspect-[5/2] w-full">
                      {group.bannerLink ? (
                        <a href={group.bannerLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          <img
                            src={group.appBanner}
                            alt={group.heading || group.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          />
                        </a>
                      ) : (
                        <img
                          src={group.appBanner}
                          alt={group.heading || group.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Group header */}
              <div className={`mx-auto px-2 md:px-4 pt-2 flex flex-col sm:flex-row gap-3 justify-between items-center mb-3 ${((group.isWebBannerVisible && group.isWebBgColorVisible) || (group.isAppBannerVisible && group.isAppBgColorVisible)) ? "  " : "pt-3"}`}>
                <h2 className={`text-center sm:text-left uppercase text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight w-full sm:w-auto ${appTextColorClass} ${webTextColorClass}`}>
                  {group.heading || group.name}
                </h2>
                {group.groupType === 'products' && (
                  <Link href={`/gp/${group?._id}`} className="hidden sm:flex w-full sm:w-auto justify-center">
                    <Button variant="outline" className="bg-white cursor-pointer text-gray-800 border-slate-200 hover:bg-slate-50 w-full sm:w-auto">
                      See All Products
                    </Button>
                  </Link>
                )}
              </div>

              {/* Render Scroll/Swiper View */}
              {isScroll ? (
                <div className="relative w-full px-2 sm:px-4">
                  {/* Custom Navigation buttons (positioned in desktop margins using negative offsets) */}
                  <button className={`${prevElClass} absolute left-0 lg:-left-6 xl:-left-10 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black rounded-full p-2.5 shadow-md border border-slate-200 transition-all hover:scale-105 hidden sm:flex items-center justify-center`}>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className={`${nextElClass} absolute right-0 lg:-right-6 xl:-right-10 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black rounded-full p-2.5 shadow-md border border-slate-200 transition-all hover:scale-105 hidden sm:flex items-center justify-center`}>
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <Swiper
                    modules={[Autoplay, Navigation]}
                    slidesPerView={group.groupType === 'products' ? 2 : 2.2}
                    loop={items.length > (group.groupType === 'products' ? 6 : 4)}
                    speed={600}
                    spaceBetween={12}
                    autoplay={{
                      delay: 3500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    navigation={{
                      nextEl: `.${nextElClass}`,
                      prevEl: `.${prevElClass}`,
                    }}
                    breakpoints={
                      group.groupType === 'products'
                        ? {
                          480: { slidesPerView: 3, spaceBetween: 12 },
                          640: { slidesPerView: 4, spaceBetween: 12 },
                          1024: { slidesPerView: 5, spaceBetween: 12 },
                          1280: { slidesPerView: 6, spaceBetween: 12 },
                        }
                        : {
                          480: { slidesPerView: 2.8, spaceBetween: 8 },
                          640: { slidesPerView: 3.8, spaceBetween: 10 },
                          1024: { slidesPerView: 5.5, spaceBetween: 10 },
                          1280: { slidesPerView: 7.2, spaceBetween: 8 },
                          1536: { slidesPerView: 8.2, spaceBetween: 8 },
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
                  <div className={`grid gap-3 ${group.groupType === 'products'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
                    }`}>
                    {items.map((item) => (
                      <div key={item._id} className="w-full flex justify-center">
                        {renderItem(item)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile See All Products Button */}
              {group.groupType === 'products' && (
                <div className="flex sm:hidden w-full px-4 mt-4 justify-center">
                  <Link href={`/gp/${group?._id}`} className="w-full">
                    <Button variant="outline" className="bg-white text-gray-800 border-slate-200 hover:bg-slate-50 w-full font-semibold">
                      See All Products
                    </Button>
                  </Link>
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