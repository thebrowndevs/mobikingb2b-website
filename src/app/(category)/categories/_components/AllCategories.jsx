"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ChevronRight, LayoutGrid } from "lucide-react";
import { getCategories } from "@/lib/services/operations/HomeApi";

export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [selectedCategoryMobile, setSelectedCategoryMobile] = useState(null);
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
        if (mounted) {
          setCategories(active);
          if (active.length > 0) {
            setActiveCategoryId(active[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const activeCategory = categories.find((c) => c._id === activeCategoryId);
  const visibleSubs = activeCategory 
    ? (activeCategory.subCategories || []).filter((s) => s?.active !== false)
    : [];

  if (loading) {
    return (
      <section className="w-full pb-16 pt-4 bg-slate-50">
        <div className="w-full md:max-w-[90%] mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-6 pt-4 space-y-2 animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded-sm" />
            <div className="h-4 w-96 bg-slate-200 rounded-sm" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start mt-6">
            {/* Left Sidebar Skeleton */}
            <div className="w-full md:w-[280px] bg-white border border-slate-200 rounded-sm overflow-hidden flex-shrink-0 p-4 space-y-4 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-slate-200" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded-sm" />
                </div>
              ))}
            </div>

            {/* Right Grid Skeleton */}
            <div className="flex-1 w-full bg-white border border-slate-200 rounded-sm p-6 min-h-[50vh] animate-pulse">
              <div className="h-6 w-48 bg-slate-200 rounded-sm mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-sm p-3 flex flex-col items-center gap-3">
                    <div className="w-full aspect-square rounded-sm bg-slate-200" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="w-full px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-slate-800">No categories found</h3>
          <p className="text-sm text-slate-500 mt-2">Please check back later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full pb-16 pt-4 bg-slate-50">
      <div className="w-full md:max-w-[90%] mx-auto px-4">
        
        {/* Page Header */}
        <header className="mb-6 pt-4">
          <h1 className="text-center sm:text-left text-xl sm:text-2xl font-bold uppercase text-slate-800 tracking-wide">
            Shop by Categories
          </h1>
          <p className="text-center sm:text-left text-xs text-slate-500 mt-1">
            Browse through our wholesale categories and collections
          </p>
        </header>

        {/* ---------------------------------------------------- */}
        {/* MOBILE VIEW LAYOUT (Step-by-step Card Navigation) */}
        {/* ---------------------------------------------------- */}
        <div className="block md:hidden mt-6">
          {selectedCategoryMobile === null ? (
            /* Phase 1: Show parent categories as cards */
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategoryMobile(category)}
                  className="bg-white border border-slate-200 rounded-sm p-3 flex flex-col items-center text-center transition hover:border-indigo-650"
                >
                  <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-slate-250 border border-slate-200 mb-3 flex-shrink-0">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover p-1 rounded-sm" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 capitalize truncate w-full">
                    {category.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">
                    {(category.subCategories || []).filter(s => s.active !== false).length} Subcategories
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Phase 2: Show subcategories grid of the selected parent category */
            <div className="w-full">
              <button
                onClick={() => setSelectedCategoryMobile(null)}
                className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs mb-5 px-1 py-1"
              >
                &larr; Back to Categories
              </button>
              
              <div className="pb-3 border-b border-slate-200 mb-5">
                <h2 className="text-lg font-bold text-slate-850 capitalize">
                  {selectedCategoryMobile.name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select a subcategory to browse products
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(selectedCategoryMobile.subCategories || [])
                  .filter((s) => s?.active !== false)
                  .map((sub) => {
                    const previewImage = sub.photos?.[0] || "/not-found-img.webp";
                    return (
                      <Link
                        key={sub._id}
                        href={`/cs/${sub.slug}`}
                        className="bg-white border border-slate-200 hover:border-indigo-600 rounded-sm overflow-hidden p-3 flex flex-col items-center text-center transition-all duration-300"
                      >
                        <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                          <img 
                            src={previewImage} 
                            alt={sub.name} 
                            className="object-cover w-full h-full p-1 rounded-sm" 
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-indigo-650 transition truncate w-full px-1 capitalize">
                          {sub.name}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* DESKTOP VIEW LAYOUT (Sticky Sidebar catalog browser) */}
        {/* ---------------------------------------------------- */}
        <div className="hidden md:flex flex-row gap-6 items-start mt-6">
          
          {/* LEFT SIDEBAR: Parent Categories */}
          <div className="w-[280px] flex-shrink-0 sticky top-24 bg-white border border-slate-200 rounded-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</span>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 p-0">
              {categories.map((category) => {
                const isActive = category._id === activeCategoryId;
                return (
                  <button
                    key={category._id}
                    onClick={() => setActiveCategoryId(category._id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-all duration-205 flex-shrink-0 border-l-4 ${
                      isActive 
                        ? "bg-indigo-50 border-indigo-600 text-indigo-650 font-bold" 
                        : "bg-white border-transparent text-slate-650 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-slate-250 border border-slate-200 flex-shrink-0">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                    </div>
                    <span className="text-sm capitalize truncate">{category.name}</span>
                    <ChevronRight size={14} className="ml-auto opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT VIEW: Selected Category Subcategories Grid */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-sm p-6 min-h-[50vh]">
            {activeCategory && (
              <>
                <div className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 capitalize">
                      {activeCategory.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing {visibleSubs.length} subcategories in this section
                    </p>
                  </div>
                </div>

                {visibleSubs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-sm text-slate-400 font-medium">No subcategories listed under this category.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleSubs.map((sub) => {
                      const previewImage = sub.photos?.[0] || "/not-found-img.webp";
                      return (
                        <Link
                          key={sub._id}
                          href={`/cs/${sub.slug}`}
                          className="group bg-white border border-slate-200 hover:border-indigo-600 rounded-sm overflow-hidden p-3 flex flex-col items-center text-center transition-all duration-300"
                        >
                          <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                            <img 
                              src={previewImage} 
                              alt={sub.name} 
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 p-1 rounded-sm" 
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-650 transition truncate w-full px-1 capitalize">
                            {sub.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
