"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Star, Tag, } from "lucide-react";
import {
    addCartById,
    removeFromCartById,
} from "@/lib/services/operations/CartApi";
import ImageGallery from "./ImageGallery";
import CartActions from "./CartActions";
import VariantSelector from "./VariantSelector";
import ProductInfoBlock from "./ProductInfoBlock";
import FeaturedProducts from "./FeaturedProducts";
import { useEffect, useRef } from "react";
import { getRelatedProductsBySlug } from "@/lib/services/operations/HomeApi";


export default function ProductClient({ product }) {
    const [currentImage, setCurrentImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    const { user, accessToken, setUser, setLoginOpen } = useAuth();

    //      useEffect(() => {
    //     if (product?.variants && typeof product.variants === "object") {
    //       const firstVariant = Object.keys(product.variants)[0];
    //       if (firstVariant) setSelectedVariant(firstVariant);
    //     }
    //   }, [product?.variants]);



    // A single, unified handler for cart updates
    const handleUpdateCart = async (action) => {
        if (!accessToken) {
            toast.info("Please log in to update your cart.");
            setLoginOpen(true);
            return;
        }
        if (!product || !selectedVariant || isActionLoading) return;

        setIsActionLoading(true);
        try {
            const response = await (action === "add"
                ? addCartById
                : removeFromCartById)(
                    {
                        productId: product._id,
                        cartId: user.cart._id,
                        variantName: selectedVariant,
                    },
                    accessToken
                );
            if (response?.user) {
                setUser(response.user);
                // toast.success("Cart updated!");
            } else {
                toast.error(response.error || "Failed to update cart.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const { cartItem, variantStock, currentQty, displayPrice } = useMemo(() => {
        if (!product) return {};
        const stock = product.variants?.[selectedVariant] || 0;
        const item = user?.cart?.items?.find(
            (i) =>
                i.productId?._id === product._id && i.variantName === selectedVariant
        );

        // Get last selling price
        const price = product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;

        return {
            cartItem: item,
            variantStock: stock,
            currentQty: item?.quantity || 0,
            displayPrice: price,
        };
    }, [product, selectedVariant, user?.cart?.items]);

    // Calculate discount percentage if regular price exists
    const discountPercentage = useMemo(() => {
        if (product?.regularPrice && product.regularPrice > displayPrice) {
            return Math.round(((product.regularPrice - displayPrice) / product.regularPrice) * 100);
        }
        return 0;
    }, [product, displayPrice]);

    if (!product) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const relatedRef = useRef(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (!relatedRef.current || hasFetched) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !hasFetched) {
                    setLoadingRelated(true);
                    try {
                        const res = await getRelatedProductsBySlug(product.slug);
                        if (res?.length > 0) {
                            setRelatedProducts(res);
                        }
                    } catch (err) {
                        console.error("Error fetching related products:", err);
                    } finally {
                        setLoadingRelated(false);
                        setHasFetched(true);
                    }
                }
            },
            { threshold: 0.3 } // Trigger when 30% of section visible
        );

        observer.observe(relatedRef.current);
        return () => observer.disconnect();
    }, [product?.slug, hasFetched]);

    const checkStock = () => {
        if (!selectedVariant) {
            return product?.totalStock > 0
        } else {
            return variantStock > 0
        }
    }

    return (
        <div>
            <div className="w-full max-w-[1600px] mx-auto px-4 py-4 lg:py-3">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-4">
                    {/* Image Gallery Section */}
                    <div className="sm:sticky sm:top-22 sm:h-screen w-full sm:w-[40%]">
                        <ImageGallery
                            images={product.images || []}
                            fullName={product.fullName}
                            currentImage={currentImage}
                            setCurrentImage={setCurrentImage}
                        />
                    </div>

                    {/* Product Info Section */}
                    <div className="space-y-3 flex-1">
                        <div className="pb-2 border-b">
                            <span className="text-sm text-muted-foreground">
                                {product?.category?.name || "Electronics"}
                            </span>
                            <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 mt-1">
                                {product?.fullName}
                            </h1>

                            <div className="flex items-center mt-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < product?.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({product?.reviewCount} reviews)</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <span className="text-3xl font-bold text-gray-900">
                                        ₹{displayPrice.toLocaleString()}
                                    </span>

                                    {product.regularPrice && product.regularPrice > displayPrice && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg line-through text-gray-500">
                                                ₹{product.regularPrice.toLocaleString()}
                                            </span>
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                                                {discountPercentage}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-auto">
                                    {checkStock() ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Variant Selector */}
                        <VariantSelector
                            variants={product.variants || {}}
                            selectedVariant={selectedVariant}
                            setSelectedVariant={setSelectedVariant}
                        />

                        {/* Cart Actions */}
                        <CartActions
                            loading={isActionLoading}
                            currentQty={currentQty}
                            variantStock={variantStock}
                            onUpdateCart={handleUpdateCart}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1 h-full"
                                onClick={() => handleUpdateCart("add")}
                                disabled={currentQty >= variantStock || isActionLoading}
                            >
                                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <div>
                                        Add to Cart {!selectedVariant && "(Please select a variant!)"}
                                    </div>
                                }
                                {/* Add to Cart */}
                            </Button>
                        </div>

                        {/* Key Features */}
                        {product.descriptionPoints && product.descriptionPoints.length > 0 && (
                            <Card className={''}>
                                <CardContent className="px-6">
                                    <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {product.descriptionPoints.map((point, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
                                                    <Tag className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="text-gray-700">{point.replace(/["\\]/g, '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Key Information Table */}
                        {product.keyInformation && product.keyInformation.length > 0 && (
                            <Card>
                                <CardContent className="">
                                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        {product.keyInformation.map((info, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} p-4`}
                                            >
                                                <div className="w-1/3 font-medium text-gray-700">{info.title}</div>
                                                <div className="w-2/3 text-gray-600">{info.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Toggleable Product Details */}
                        <div className="transition-all ease-in-out duration-500">
                            <div className="p-0">
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out`}
                                >
                                    <ProductInfoBlock
                                        // fullName={product.fullName}
                                        description={product.description}
                                    />

                                    <Card className="mt-0">
                                        <CardContent>
                                            <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Category</div>
                                                    <div className="font-medium">{product.category?.name || "—"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Variant</div>
                                                    <div className="font-medium capitalize">{selectedVariant || "—"}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            <div ref={relatedRef} className="mt-0 lg:mt-6">
                {loadingRelated && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                {relatedProducts.length > 0 && (
                    <FeaturedProducts title="Related Products" products={relatedProducts} />
                )}
            </div>
        </div>
    );
}


// import React, { useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// export default function ProductClient({ product }) {
//     const router = useRouter();
//     const [quantity, setQuantity] = useState(1);
//     const [addingToCart, setAddingToCart] = useState(false);

//     console.log(product)

//     if (!product) {
//         return (
//             <div className="text-center py-20 text-gray-500">
//                 Product not found.
//             </div>
//         );
//     }

//     const handleAddToCart = async () => {
//         try {
//             setAddingToCart(true);
//             // Example — you can replace this with your real cart context or API call
//             const cart = JSON.parse(localStorage.getItem("cart")) || [];
//             const existing = cart.find((item) => item.id === product.id);

//             if (existing) {
//                 existing.quantity += quantity;
//             } else {
//                 cart.push({ ...product, quantity });
//             }

//             localStorage.setItem("cart", JSON.stringify(cart));
//             alert("Added to cart!");
//         } catch (error) {
//             console.error("Error adding to cart:", error);
//         } finally {
//             setAddingToCart(false);
//         }
//     };

//     return (
//         <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
//             {/* Product Image */}
//             <div className="flex justify-center items-center bg-gray-50 rounded-2xl overflow-hidden p-4">
//                 <Image
//                     src={product.image || "/placeholder.png"}
//                     alt={product.title}
//                     width={500}
//                     height={500}
//                     className="object-contain rounded-xl"
//                     priority
//                 />
//             </div>

//             {/* Product Details */}
//             <div>
//                 <h1 className="text-3xl font-semibold mb-3">{product.title}</h1>
//                 <p className="text-gray-600 mb-4">{product.description}</p>

//                 <div className="flex items-center gap-3 mb-4">
//                     <span className="text-2xl font-bold text-[#5f13c5]">
//                         ₹{product.price}
//                     </span>
//                     {product.oldPrice && (
//                         <span className="text-gray-400 line-through">
//                             ₹{product.oldPrice}
//                         </span>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-3 mb-6">
//                     <label className="text-sm text-gray-600">Quantity:</label>
//                     <div className="flex items-center border rounded-lg overflow-hidden">
//                         <button
//                             onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//                             className="px-3 py-1 border-r text-gray-600"
//                         >
//                             −
//                         </button>
//                         <span className="px-4 py-1">{quantity}</span>
//                         <button
//                             onClick={() => setQuantity((q) => q + 1)}
//                             className="px-3 py-1 border-l text-gray-600"
//                         >
//                             +
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-4">
//                     <Button
//                         onClick={handleAddToCart}
//                         disabled={addingToCart}
//                         className="bg-[#5f13c5] text-white hover:bg-[#4a0da1]"
//                     >
//                         {addingToCart ? "Adding..." : "Add to Cart"}
//                     </Button>

//                     <Button
//                         onClick={() => router.push("/checkout")}
//                         variant="outline"
//                         className="hover:bg-gray-100"
//                     >
//                         Buy Now
//                     </Button>
//                 </div>

//                 {/* Extra Info */}
//                 {/* <div className="mt-8 border-t pt-4 text-sm text-gray-600 space-y-2">
//                     <p><strong>Category:</strong> {product.category || "General"}</p>
//                     <p><strong>In Stock:</strong> {product.stock > 0 ? "Available" : "Out of Stock"}</p>
//                     <p><strong>SKU:</strong> {product.sku || "N/A"}</p>
//                 </div> */}
//             </div>
//         </div>
//     );
// }
