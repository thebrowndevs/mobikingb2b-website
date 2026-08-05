"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BannerHome() {
  const { homeBanners } = useAuth();
  
  if (!homeBanners?.length) {
    return (
      <div className="w-full aspect-[1920/460]">
        <div className="bg-gray-200 w-full aspect-[1920/460] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full pb-6 mx-auto">
      <Swiper
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
        {homeBanners.map((item, idx) => {
          // Normalize item if it's a string (safeguard)
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
                />
              </div>
              {/* Mobile banner: visible on screens up to 500px (1:1 aspect ratio) */}
              <div className="block min-[501px]:hidden relative w-full aspect-square">
                <Image
                  src={banner.mobileUrl || banner.desktopUrl}
                  alt={`Banner ${idx + 1} Mobile`}
                  fill
                  className="object-cover object-center"
                  priority={idx === 0}
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
