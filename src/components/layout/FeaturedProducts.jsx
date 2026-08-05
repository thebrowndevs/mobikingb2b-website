"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProductCard1 from "../ProductCard1";
import { getHomeLayoutGroups } from "@/lib/services/operations/HomeApi";

export default function FeaturedProducts() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log(groups)
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await getHomeLayoutGroups();
                setGroups(data.filter((group) => group.name === 'Featured'));
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);
    // console.log(groups)

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
        return { text: "20% OFF", color: "bg-red-500" };
    };

    const calculateDiscount = (product) => {
        if (product.sellingPrice?.length > 1) {
            const original = product.sellingPrice[0].price;
            const discounted = product.sellingPrice[1].price;
            return Math.round(((original - discounted) / original) * 100);
        }
        return null;
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
                const textColor = brightness > 28 ? "text-gray-900" : "text-white";

                return (
                    <section
                        key={group._id}
                        className={`w-full overflow-hidden transition-all duration-300 ${group.isBackgroundColorVisible ? 'pb-20 sm:pb-32 pt-10' : 'pb-18'
                            }`}
                        style={{
                            backgroundColor: group.isBackgroundColorVisible ? bgColor : 'transparent',
                        }}
                    >
                        {/* Banner */}
                        {group.isBannerVisble && group.banner ? (
                            <div className={`relative mb-3 md:mb-5 overflow-hidden ${group.isBackgroundColorVisible && 'max-w-[95vw] mx-auto'}`}>
                                <img
                                    src={group.banner}
                                    alt={group.name}
                                    className="w-full h-32 md:h-96 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.parentNode.style.display = 'none';
                                    }}
                                />
                                <div className="max-w-[95vw] mx-auto px-4 sm:px-0">
                                    <h2
                                        className={`relative inline-block text-2xl md:text-4xl lg:text-5xl mt-7 font-extrabold mb-4 ${textColor}`}
                                    >
                                        {group.name}
                                        <span className="absolute left-0 -bottom-2 w-26 h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"></span>
                                    </h2>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-[95vw] mx-auto px-4 sm:px-0">
                                <h2
                                    className={`relative inline-block text-2xl md:text-4xl lg:text-5xl mt-3 font-extrabold mb-8 ${textColor}`}
                                >
                                    {group.name}
                                    <span className="absolute left-0 -bottom-2 w-26 h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"></span>
                                </h2>
                            </div>
                        )}

                        {/* Grid with horizontal scroll and two rows */}
                        <div className="overflow-x-auto px-4 sm:px-0">
                            <div className="grid grid-flow-col grid-rows-2 max-w-[95vw] mx-auto sm:grid-rows-1 gap-2 lg:grid-cols-5 lg:grid-flow-row">
                                {group.products.map((product) => {
                                    const badge = getBadgeType(product);
                                    const discount = calculateDiscount(product);

                                    // if (product?.totalStock > 0 && product?.active)
                                    // if ( product?.active)
                                    return (
                                        <div key={product._id} className=" h-full">
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
        </div>
    );
}
