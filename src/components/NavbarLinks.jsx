"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories } from "@/lib/services/operations/HomeApi";
import { quickLinks } from "@/data/footerLinks";

export default function NavbarLinks() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const active = (data || []).filter(
          (d) =>
            d &&
            d.active === true &&
            Array.isArray(d.subCategories) &&
            d.subCategories.some((s) => s?.active !== false)
        );

        const sorted = active.sort((a, b) => {
          const aCount = (a.subCategories || []).filter(s => s?.active !== false).length;
          const bCount = (b.subCategories || []).filter(s => s?.active !== false).length;
          return bCount - aCount;
        });

        setCategories(sorted);
        if (sorted.length > 0) {
          setHoveredCategory(sorted[0]);
        }
      } catch (err) {
        console.error("Error fetching categories in NavbarLinks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="hidden md:flex items-center gap-8 flex-1">
      {/* Categories Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setIsCategoriesOpen(true)}
        onMouseLeave={() => setIsCategoriesOpen(false)}
      >
        <div className="flex items-center gap-1">
          <Link
            href="/categories"
            className="text-lg text-primary tracking-tight hover:text-primary/80 transition-colors font-medium"
          >Categories</Link>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`} />
        </div>

        <AnimatePresence>
          {isCategoriesOpen && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 lg:-left-20 mt-0 w-[95vw] max-w-[850px] bg-white border border-slate-200 rounded-xl overflow-hidden z-[100] shadow-none"
            >
              <div className="flex h-[450px]">
                {/* Left Sidebar: Parent Categories */}
                <div className="w-[200px] bg-[#F8FAFC] border-r border-slate-100 p-3 overflow-y-auto shrink-0">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
                    EXPLORE
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        onMouseEnter={() => setHoveredCategory(category)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${hoveredCategory?._id === category._id
                          ? "bg-white text-[#002244] ring-1 ring-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#002244]"
                          }`}
                      >
                        <Link
                          href="/categories"
                          className="flex-1 text-[13px] font-bold leading-tight"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          {category.name}
                        </Link>
                        <ChevronRight
                          size={12}
                          className={`transition-transform flex-shrink-0 ml-2 ${hoveredCategory?._id === category._id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                            }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Content: Subcategories */}
                <div className="flex-1 p-6 bg-white overflow-y-auto relative">
                  <AnimatePresence mode="wait">
                    {hoveredCategory && (
                      <motion.div
                        key={hoveredCategory._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full flex flex-col"
                      >
                        <div className="flex items-center gap-4 mb-4 p-3 bg-[#F8FAFC] rounded-lg border border-slate-100">
                          <div className="w-24 h-24 bg-white rounded-md flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                            {hoveredCategory.image ? (
                              <img
                                src={hoveredCategory.image}
                                alt={hoveredCategory.name}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <LayoutGrid size={48} className="text-slate-200" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-extrabold text-[#002244] mb-1">
                              {hoveredCategory.name}
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-md mb-2">
                              Explore our full range of {hoveredCategory.name.toLowerCase()} products.
                            </p>
                            <Link
                              href="/categories"
                              onClick={() => setIsCategoriesOpen(false)}
                              className="text-[11px] font-extrabold text-primary hover:underline flex items-center gap-1 transition-colors"
                            >
                              View All {hoveredCategory.name} Categories
                              <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {hoveredCategory.subCategories
                            ?.filter((sub) => sub?.active !== false)
                            .map((sub) => (
                              <Link
                                key={sub._id}
                                href={`/cs/${sub.slug}`}
                                onClick={() => setIsCategoriesOpen(false)}
                                className="group p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
                              >
                                <h4 className="text-[14px] font-bold text-[#002244] group-hover:text-primary mb-1.5 transition-colors">
                                  {sub.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-500">
                                  Premium {sub.name.toLowerCase()} solutions for wholesale.
                                </p>
                              </Link>
                            ))}
                        </div>

                        {hoveredCategory.subCategories?.length === 0 && (
                          <div className="flex-1 flex items-center justify-center text-slate-300 italic text-sm">
                            No subcategories found for this category.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link
        href="/about-us"
        className="text-lg text-primary tracking-tight hover:text-primary/80 transition-colors font-medium"
      >
        About Us
      </Link>
      <Link
        href="/contact"
        className="text-lg text-primary tracking-tight hover:text-primary/80 transition-colors font-medium"
      >
        Contact Us
      </Link>
      <Link
        href="/blogs"
        className="text-lg text-primary tracking-tight hover:text-primary/80 transition-colors font-medium"
      >
        Read Blogs
      </Link>

      {/* Quick Links / More Menu */}
      <div
        className="relative"
        onMouseEnter={() => setIsQuickLinksOpen(true)}
        onMouseLeave={() => setIsQuickLinksOpen(false)}
      >
        <div className="flex items-center gap-1 text-lg text-primary tracking-tight hover:text-primary/80 transition-colors font-medium cursor-pointer py-2">
          <span>More</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isQuickLinksOpen ? "rotate-180" : ""}`} />
        </div>

        <AnimatePresence>
          {isQuickLinksOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-none p-1.5 z-[100]"
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.url}
                  className="block px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors"
                  onClick={() => setIsQuickLinksOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
