"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getCategories } from "@/lib/services/operations/HomeApi";
import { ChevronRight, Sparkles, LayoutGrid } from "lucide-react";

export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCategories();
        const active = (data || []).filter(
          (d) =>
            d &&
            d.active === true &&
            Array.isArray(d.subCategories) &&
            d.subCategories.some((s) => s?.active !== false)
        );
        if (mounted) setCategories(active);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="w-full px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold">No categories found</h3>
          <p className="text-sm text-gray-500 mt-2">Please check back later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full pb-10">
      <div className="max-w-[1450px] mx-auto">
        <header className="mb-6">
          {/* Enhanced Mobile Header */}
          <div className="sm:hidden relative mb-4 overflow-hidden ">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-gray-800 z-0"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMTUiLz48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyNSIvPjwvZz48L3N2Zz4=')] z-0 opacity-20"></div>

            <div className="relative z-10 px-6 py-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Shop by Category
              </h1>
              <p className="text-purple-100 text-sm max-w-xs mx-auto leading-relaxed">
                Discover our carefully curated collections tailored just for you
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center z-10">
              <div className="w-32 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Desktop/Large screen header (unchanged) */}
          <div className="hidden sm:flex items-center pt-10 justify-between">
            <h1 className="text-3xl font-bold ">Shop by Category</h1>
          </div>
        </header>


        {/* Responsive grid */}
        <div className="grid grid-cols-2 px-3 sm:px-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-2 lg:gap-2">
          {categories.map((category) => {
            // show only active subcategories
            const visibleSubs = (category.subCategories || []).filter((s) => s?.active !== false);

            return (
              <article
                key={category._id}
                className="bg-white rounded-sm border hover:border-black transition-shadow duration-200 overflow-hidden flex flex-col"
                aria-labelledby={`cat-${category._id}-title`}
              >
                {/* Square image */}
                <div className="relative w-full" style={{ paddingTop: "100%" }}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name || "Category image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}

                  {/* TRAPEZIUM LABEL */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] text-center">
                    <div
                      className="bg-white text-black text-sm font-semibold py-1 px-3"
                      style={{
                        clipPath: "polygon(5% 0, 95% 0, 85% 100%, 15% 100%)",
                        borderRadius: "8px",         // thoda rounded
                        overflow: "hidden"           // rounded corners visible hone ke liye
                      }}
                    >
                      {category.name}
                    </div>
                  </div>

                  <div className="absolute left-3 bottom-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                    {visibleSubs.length}
                  </div>
                </div>

                <div className="p-2 md:p-4 flex-1 flex flex-col">
                  {/* SUBCATEGORIES */}
                  <div className="my-1">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-1">
                      {visibleSubs.length === 0 ? (
                        <span className="text-sm text-gray-400">No active subcategories</span>
                      ) : (
                        visibleSubs.map((sub) => (
                          <Link
                            key={sub._id}
                            href={`/cs/${sub.slug}`}
                            className="block text-start text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-gray-700 transition"
                          >
                            {sub.name}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Full-width transparent Show all button with border */}
                  {/* <div className="mt-auto">
                    <Link
                      href={`/cs/${category.slug || ""}`}
                      className="block w-full text-center border border-black/80 text-white hover:bg-black/80 bg-black/90 px-3 py-2 rounded-md transition"
                      aria-label={`Show all in ${category.name}`}
                    >
                      Show all
                    </Link>
                  </div> */}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* hide scrollbar helper (optional) */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
