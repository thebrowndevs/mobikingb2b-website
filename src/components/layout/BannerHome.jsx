"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { apiConnector } from "@/lib/services/apiConnector";
import { homeEndPoints } from "@/lib/api";

const { GET_WEBSITE_BANNERS } = homeEndPoints;

export default function BannerHome() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiConnector("GET", GET_WEBSITE_BANNERS);
        setBanners(response?.data?.data || []);
      } catch (err) {
        console.error("Failed to load banners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full pb-6 mx-auto">
        {/* Desktop skeleton aspect 1920:460 */}
        <div className="hidden min-[501px]:block w-full aspect-[1920/460] bg-slate-200 dark:bg-slate-800 animate-pulse" />
        {/* Mobile skeleton aspect 1:1 */}
        <div className="block min-[501px]:hidden w-full aspect-[5/3] bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <div className="w-full pb-4 sm:pb-6 mx-auto">
      <Swiper
        style={{
          "--swiper-pagination-color": "#000000",
        }}
        modules={[Autoplay, Pagination, Navigation]}
        loop
        speed={600}
        spaceBetween={16}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        pagination={{ clickable: true }}
        className="overflow-hidden"
      >
        {banners.map((item, idx) => {
          const banner = typeof item === "string"
            ? { desktopUrl: item, mobileUrl: item, redirectUrl: "" }
            : item;

          const BannerContent = (
            <>
              {/* Desktop banner: visible on screens wider than 500px (1920:460 ratio) */}
              <div className="hidden min-[501px]:block relative w-full aspect-[1920/460]">
                <Image
                  src={banner.desktopUrl || banner.mobileUrl}
                  alt={`Banner ${idx + 1} Desktop`}
                  fill
                  className="object-cover object-center"
                  priority={idx === 0}
                  unoptimized
                />
              </div>
              {/* Mobile banner: visible on screens up to 500px (1:1 aspect ratio) */}
              <div className="block min-[501px]:hidden relative w-full aspect-[5/3]">
                <Image
                  src={banner.mobileUrl || banner.desktopUrl}
                  alt={`Banner ${idx + 1} Mobile`}
                  fill
                  className="object-cover object-center"
                  priority={idx === 0}
                  unoptimized
                />
              </div>
            </>
          );

          return (
            <SwiperSlide key={idx}>
              {banner.redirectUrl ? (
                <Link href={banner.redirectUrl} className="block cursor-pointer">
                  {BannerContent}
                </Link>
              ) : (
                <div className="block">
                  {BannerContent}
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
