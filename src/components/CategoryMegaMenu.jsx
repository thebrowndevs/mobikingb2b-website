"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories } from "@/lib/services/operations/HomeApi";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CategoryMegaMenu() {
  const { loginOpen } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close menu if login popup opens
  useEffect(() => {
    if (loginOpen) setIsOpen(false);
  }, [loginOpen]);

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

        // Sort by number of active subcategories descending
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
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading || categories.length === 0) return null;

  const triggerButton = (
    <button
      className={`flex items-center gap-1.5 text-lg text-primary tracking-tight transition-all focus:outline-none bg-transparent border-0 cursor-pointer font-medium ${isOpen
        ? "text-primary/80"
        : "text-primary hover:text-primary/80"
        }`}
    >
      <LayoutGrid size={18} className="text-slate-400" />
      <span>Categories</span>
      <ChevronDown
        size={14}
        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "opacity-65"}`}
      />
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {triggerButton}
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 border-r-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left text-[#002244] flex items-center gap-2">
              <LayoutGrid size={20} />
              EXPLORE
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-70px)] pb-20">
            {categories.map((category) => (
              <div key={category._id} className="border-b border-slate-50 last:border-0">
                <div
                  className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                >
                  <span className="text-sm font-bold text-[#002244]">{category.name}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${expandedCategory === category._id ? "rotate-180" : ""}`}
                  />
                </div>
                <AnimatePresence>
                  {expandedCategory === category._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-slate-50/50"
                    >
                      <div className="grid grid-cols-1 gap-1 p-2">
                        {category.subCategories
                          ?.filter((sub) => sub?.active !== false)
                          .map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/cs/${sub.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="px-4 py-3 text-sm text-slate-600 hover:text-[#002244]"
                            >
                              {sub.name}
                            </Link>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {triggerButton}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 lg:-left-40 mt-1 w-[95vw] max-w-[850px] bg-white border border-gray-200 rounded-xl overflow-hidden z-[100]"
          >
            <div className="flex h-[450px]">
              {/* Left Sidebar: Parent Categories */}
              <div className="w-[200px] bg-[#F8FAFC] border-r border-slate-100 p-3 overflow-y-auto shrink-0">
                <h3 className="text-[10px] font-bold text-[#002244]/40 uppercase tracking-[0.2em] mb-4 px-2">
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
                        onClick={() => setIsOpen(false)}
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

              {/* Right Content: Subcategories (Mega Menu Layout) */}
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
                            onClick={() => setIsOpen(false)}
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
                              onClick={() => setIsOpen(false)}
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
  );
}
