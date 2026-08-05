"use client";

import { getCategories } from "@/lib/services/operations/HomeApi";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HomeCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        const active = data?.filter(d => d.active === true)

        setCategories(active);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="w-full  pb-4 sm:pb-8 mx-auto">
      <div className="mx-4">
        {/* <h2 className="text-center text-2xl font-bold mb-6 text-gray-900">
          Shop by Category
        </h2> */}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={4}          // mobile default
            loop
            speed={600}
            spaceBetween={16}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            breakpoints={{
              768: { slidesPerView: 6 },   // tablet
              1024: { slidesPerView: 8 },  // desktop
            }}
            className="overflow-hidden"
          >
            {categories.map((category, idx) => (
              <SwiperSlide key={idx}>
                <Link
                  href={
                    category.subCategories?.[0]?.slug
                      ? `/cs/${category.subCategories[0].slug}`
                      : "/categories"
                  }
                  className="group flex-shrink-0 max-[400px]:w-24 w-28 sm:w-32 md:w-36 lg:w-40"
                >
                  <div className="relative w-full aspect-square bg-gray-100 rounded-sm sm:my-4 overflow-hidden shadow-sm transform transition group-hover:scale-105">
                    <Image
                      src={category.image || "/not-found-img.webp"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <span className="block text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors truncate">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}