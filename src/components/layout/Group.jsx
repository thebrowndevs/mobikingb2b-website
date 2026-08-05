"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard1 from "../ProductCard1";
import { getHomeLayoutGroups } from "@/lib/services/operations/HomeApi";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GroupProductsDialog from "./GroupProductsDialog";

export default function Group() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollContainerRefs = useRef({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getHomeLayoutGroups();
        setGroups(data.filter((group) => group.active));
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const scrollLeft = (groupId) => {
    const container = scrollContainerRefs.current[groupId];
    if (container) {
      container.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = (groupId) => {
    const container = scrollContainerRefs.current[groupId];
    if (container) {
      container.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  const handleSeeAll = (group) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  if (loading)
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-gray-400" />
      </div>
    );

  if (!groups.length)
    return (
      <div className="h-60 w-full flex flex-col items-center justify-center gap-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <p className="text-gray-500">No groups available at the moment</p>
      </div>
    );

  const getBadgeType = (product) => {
    if (product.newArrival) return { text: "NEW", color: "bg-blue-500" };
    if (product.bestSeller) return { text: "BESTSELLER", color: "bg-purple-500" };
    if (product.recommended) return { text: "RECOMMENDED", color: "bg-green-500" };
    return { text: "", color: "bg-green-500" };
  };

  const calculateDiscount = (product) => {
    if (product.sellingPrice?.length >= 1) {
      const original = product?.regularPrice != undefined && product?.regularPrice >= 0 ? product?.regularPrice : product?.sellingPrice[0]?.price;
      const discounted = product?.sellingPrice[product.sellingPrice.length - 1]?.price;

      if (discounted < original)
        return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  return (
    <div className="gap-0 md:gap-0 flex flex-col lg:px-[0px] w-full lg:mx-auto">
      {groups.map((group) => {
        if (!group.products?.length) return null;

        // Calculate text color based on background brightness
        const bgColor = group.backgroundColor || "#ffffff";
        const rgb = parseInt(bgColor.substring(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? "text-gray-900" : "text-white";

        const activeProducts = group.products.filter(product =>
          product?.active && product?.totalStock > 0
        );

        if (activeProducts.length === 0) return null;

        return (
          <section
            key={group._id}
            className={`w-full overflow-hidden transition-all duration-300 ${group.isBackgroundColorVisible ? 'pb-5 mb-10 sm:pb-5 pt-3 sm:pt-8' : 'pb-7'
              }`}
            style={{
              backgroundColor: group.isBackgroundColorVisible ? bgColor : 'transparent',
            }}
          >
            {/* Banner */}
            {group.isBannerVisble && group.banner ? (
              <div className={`relative mb-3 md:mb-5 overflow-hidden px-2 sm:px-4 ${group.isBackgroundColorVisible && 'px-2 sm:px-4'}`}>
                <div className="relative aspect-[12/5] w-full px-2 sm:px-4">
                  {group?.bannerLink ?
                    <Link href={group?.bannerLink}>
                      <img
                        src={group.banner}
                        alt={group.name}
                        className={`absolute inset-0 w-full h-full object-cover rounded-md mx-auto ${group.isBackgroundColorVisible && 'rounded-md mx-auto'}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.style.display = 'none';
                        }}
                      />
                    </Link>
                    : <img
                      src={group.banner}
                      alt={group.name}
                      className={`absolute inset-0 w-full h-full object-cover rounded-md mx-auto ${group.isBackgroundColorVisible && 'rounded-md mx-auto'}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.style.display = 'none';
                      }}
                    />
                  }
                </div>
                <div className="max-w-[97vw] mx-auto px-2 sm:px-0 flex justify-between items-center">
                  <h2 className={`relative capitalize inline-block text-2xl md:text-2xl lg:text-3xl mt-5 font-bold mb-2 ${textColor}`}>
                    {group.name}
                    <span className="absolute left-0 -bottom-2 w-20 h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"></span>
                  </h2>

                  {/* See All Button for large screens */}
                  <div className="hidden  lg:block">
                    <Button
                      variant="outline"
                      onClick={() => handleSeeAll(group)}
                      className={textColor === 'text-white' ? 'text-white cursor-pointer border-white hover:bg-white hover:text-gray-900' : 'cursor-pointer'}
                    >
                      See All Products
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-[97vw] mx-auto px-4 flex justify-between items-center">
                <h2
                  className={`relative capitalize inline-block text-2xl md:text-2xl lg:text-3xl mt-3 font-bold mb-8 ${textColor}`}
                >
                  {group.name}
                  <span className="absolute left-0 -bottom-2 w-20 h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"></span>
                </h2>

                {/* See All Button for large screens */}
                <div className="hidden lg:block">
                  <Button
                    variant="outline"
                    onClick={() => handleSeeAll(group)}
                    className={textColor === 'text-white' ? 'text-white border-white hover:bg-white hover:text-gray-900' : ''}
                  >
                    See All Products
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Layout - Original Grid */}
            <div className="lg:hidden overflow-x-auto px-2 sm:px-4">
              {(() => {
                // determine mobile rows: if only 1 product -> 1 row, else 2 rows
                const mobileRowsClass = activeProducts.length <= 1 ? "grid-rows-1" : "grid-rows-2";

                return (
                  <div className={`grid grid-flow-col ${mobileRowsClass} max-w-[97vw] mx-auto gap-2`}>
                    {activeProducts.map((product) => {
                      const badge = getBadgeType(product);
                      const discount = calculateDiscount(product);
                      return (
                        <div key={product._id} className="min-w-[160px] w-[160px] h-full">
                          <ProductCard1
                            product={product}
                            badge={badge}
                            discount={discount}
                            textColor={textColor}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Desktop Layout - Horizontal Scroll with Arrows */}
            <div className="hidden lg:block relative px-4">
              {activeProducts.length > 6 && (
                <>
                  <button
                    onClick={() => scrollLeft(group._id)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg border"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollRight(group._id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg border"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div
                ref={el => scrollContainerRefs.current[group._id] = el}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {activeProducts.map((product) => {
                  const badge = getBadgeType(product);
                  const discount = calculateDiscount(product);
                  return (
                    <div key={product._id} className="min-w-44 max-w-55 flex-shrink-0">
                      <ProductCard1
                        product={product}
                        badge={badge}
                        discount={discount}
                        textColor={textColor}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Dialog for showing all products */}
      <GroupProductsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={selectedGroup}
        textColor={selectedGroup ? (() => {
          const bgColor = selectedGroup.backgroundColor || "#ffffff";
          const rgb = parseInt(bgColor.substring(1), 16);
          const r = (rgb >> 16) & 0xff;
          const g = (rgb >> 8) & 0xff;
          const b = rgb & 0xff;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 128 ? "text-gray-900" : "text-white";
        })() : "text-gray-900"}
      />
    </div>
  );
}