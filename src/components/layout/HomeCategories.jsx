"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { apiConnector } from "@/lib/services/apiConnector";
import { homeEndPoints } from "@/lib/api";

const { GET_WEBSITE_CATEGORIES } = homeEndPoints;

export default function HomeCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiConnector("GET", GET_WEBSITE_CATEGORIES);
        setCategories(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch homepage categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="w-full pb-4 sm:pb-8 mx-auto">
        <div className="mx-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3 animate-pulse">
                {/* Circular image placeholder */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-full bg-slate-200 dark:bg-slate-800" />
                {/* Text placeholder */}
                <div className="h-3 w-12 sm:w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="w-full pb-4 sm:pb-8 mx-auto">
      <div className="mx-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold text-slate-800 tracking-wider uppercase mb-5">
          Shop by Category
        </h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={4}
          loop={categories.length > 4}
          speed={600}
          spaceBetween={12}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            300: { slidesPerView: 3, spaceBetween: 10 },
            350: { slidesPerView: 4, spaceBetween: 10 },
            768: { slidesPerView: 6, spaceBetween: 12 },
            1024: { slidesPerView: 7, spaceBetween: 10 },
            1280: { slidesPerView: 8, spaceBetween: 10 },
          }}
          className="overflow-hidden py-2"
        >
          {categories.map((category, idx) => {
            const imageSrc = category.photos?.[0] || "/not-found-img.webp";
            return (
              <SwiperSlide key={idx}>
                <Link
                  href={`/cs/${category.slug}`}
                  className="group flex flex-col items-center text-center shrink-0 w-full"
                >
                  {/* Premium circular wrapper with shadow and scale effect */}
                  <div className="relative w-22 h-22 sm:w-28 sm:h-28 lg:w-44 lg:h-44 xl:w-44 xl:h-44 rounded-full bg-white border border-slate-100 overflow-hidden shadow-sm transform transition duration-350 ease-out group-hover:scale-105 group-hover:shadow-md group-hover:border-indigo-100">
                    <Image
                      src={imageSrc}
                      alt={category.name}
                      fill
                      className="object-cover p-1.5 rounded-full"
                      unoptimized
                    />
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs sm:text-base font-normal text-slate-700 group-hover:text-indigo-650 transition-colors duration-250 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[160px] xl:max-w-[180px]">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}