"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ProductCard1 from "../ProductCard1";

export default function GroupProductsDialog({ open, onOpenChange, group, textColor }) {
    if (!group) return null;

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-auto p-0 border-0">
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-background/80 backdrop-blur-sm p-1.5"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col h-full">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className={`text-2xl font-bold ${textColor}`}>
                            {group.name} - All Products
                        </DialogTitle>
                        <DialogDescription>
                            Browse all products in this collection
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-6 max-h-[75vh]">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {group.products
                                .filter(product => product?.active && product?.totalStock > 0)
                                .map((product) => {
                                    const badge = getBadgeType(product);
                                    const discount = calculateDiscount(product);

                                    return (
                                        <div key={product._id} className="h-full">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}