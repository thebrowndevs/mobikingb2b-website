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
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [qty, setQty] = useState(60);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const { user, accessToken, setUser, setLoginOpen } = useAuth();

    // Default to first variant on load
    useEffect(() => {
        if (product?.variants && product.variants.length > 0) {
            setSelectedVariantId(product.variants[0]._id);
        }
    }, [product]);

    const activeVariant = useMemo(() => {
        return product?.variants?.find(v => v._id === selectedVariantId);
    }, [product, selectedVariantId]);

    // Dynamic gallery images switching based on active variant
    const galleryImages = useMemo(() => {
        if (activeVariant && activeVariant.images && activeVariant.images.length > 0) {
            return activeVariant.images;
        }
        return product?.images || [];
    }, [product, activeVariant]);

    // Handle adding selected variant to cart
    const handleAddToCart = async () => {
        if (!accessToken) {
            toast.info("Please log in to update your cart.");
            setLoginOpen(true);
            return;
        }

        if (!selectedVariantId || !activeVariant) {
            toast.warning("Please select a variant.");
            return;
        }

        const quantityToAdd = parseInt(qty);
        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            toast.warning("Please enter a valid quantity.");
            return;
        }

        setIsActionLoading(true);
        try {
            const response = await addCartById({
                items: [{
                    productId: product._id,
                    variantId: selectedVariantId,
                    quantity: quantityToAdd
                }]
            }, accessToken);

            if (response?.user) {
                setUser(response.user);
                toast.success(`Successfully added ${quantityToAdd} units of "${activeVariant.name}" to cart.`);
                setQty(60); // Reset quantity spinner
            } else {
                toast.error(response?.error || "Failed to update cart.");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handle removing a variant completely from the cart
    const handleRemoveFromCart = async (variantId, variantName, currentCartQty) => {
        if (!accessToken) return;

        setIsActionLoading(true);
        try {
            const response = await removeFromCartById({
                items: [{
                    productId: product._id,
                    variantId: variantId,
                    quantity: currentCartQty
                }]
            }, accessToken);

            if (response?.user) {
                setUser(response.user);
                toast.success(`Removed "${variantName}" from cart.`);
            } else {
                toast.error(response?.error || "Failed to update cart.");
            }
        } catch (error) {
            console.error("Remove from cart error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const getCartQty = (variantName) => {
        const item = user?.cart?.items?.find(
            (i) => i.productId?._id === product._id && i.variantName === variantName
        );
        return item?.quantity || 0;
    };

    // Calculate total quantity of this product currently in the cart
    const totalCartQty = useMemo(() => {
        if (!product || !user?.cart?.items) return 0;
        return product.variants?.reduce((sum, v) => sum + getCartQty(v.name), 0) || 0;
    }, [product, user?.cart?.items]);

    // Calculate which price slab is currently active based on totalCartQty
    const activeSlabIndex = useMemo(() => {
        if (!product?.sellingPrice?.slabs) return 0;
        const slabs = product.sellingPrice.slabs;
        let activeIdx = 0;
        // Slabs are usually [60, 300, 1000]
        for (let i = slabs.length - 1; i >= 0; i--) {
            if (totalCartQty >= slabs[i].quantity) {
                activeIdx = i;
                break;
            }
        }
        return activeIdx;
    }, [product, totalCartQty]);

    // Active slab unit price
    const currentUnitPrice = useMemo(() => {
        if (!product) return 0;
        const slabs = product.sellingPrice?.slabs;
        if (slabs && slabs.length > 0) {
            return slabs[activeSlabIndex].price;
        }
        return product.basePrice || 0;
    }, [product, activeSlabIndex]);

    // Total subtotal of this product in cart
    const productSubtotal = useMemo(() => {
        return totalCartQty * currentUnitPrice;
    }, [totalCartQty, currentUnitPrice]);

    // Calculate discount percentage if regular price exists
    const discountPercentage = useMemo(() => {
        if (product?.regularPrice && product.regularPrice > currentUnitPrice) {
            return Math.round(((product.regularPrice - currentUnitPrice) / product.regularPrice) * 100);
        }
        return 0;
    }, [product, currentUnitPrice]);

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
            { threshold: 0.3 }
        );

        observer.observe(relatedRef.current);
        return () => observer.disconnect();
    }, [product?.slug, hasFetched]);

    const addedCartItems = useMemo(() => {
        if (!product || !user?.cart?.items) return [];
        return user.cart.items.filter(
            item => item.productId?._id === product._id
        );
    }, [product, user?.cart?.items]);

    return (
        <div>
            <div className="w-full lg:max-w-[90%] mx-auto px-4 py-4 lg:py-3">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-4">
                    {/* Image Gallery Section */}
                    <div className="sm:sticky sm:top-22 sm:h-screen w-full sm:w-[40%]">
                        <ImageGallery
                            images={galleryImages}
                            fullName={product.fullName}
                            currentImage={currentImage}
                            setCurrentImage={setCurrentImage}
                        />
                    </div>

                    {/* Product Info Section */}
                    <div className="space-y-3 flex-1">
                        <div className="pb-2 ">
                            {/* <span className="text-sm text-muted-foreground">
                                {product?.category?.name || "Electronics"}
                            </span> */}
                            <h1 className="text-2xl md:text-2xl font-semibold tracking-tight text-gray-900 mt-1">
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

                        {/* Dynamic B2B Price Slabs Section */}
                        {product.sellingPrice?.slabs && product.sellingPrice.slabs.length > 0 ? (
                            <div className="mb-2">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    {product.sellingPrice.slabs.map((slab, index) => {
                                        const minQty = slab.quantity;
                                        const nextSlab = product.sellingPrice.slabs[index + 1];
                                        const maxQty = nextSlab ? nextSlab.quantity - 1 : 4000;
                                        const rangeLabel = nextSlab ? `${minQty}-${maxQty} units` : `≥${minQty} units`;
                                        const isActive = activeSlabIndex === index;

                                        return (
                                            <div
                                                key={index}
                                                className={`flex flex-col items-center justify-center p-3 rounded-sm border shadow-none transition-all duration-200 ${isActive
                                                    ? "bg-white border-slate-900 text-slate-900"
                                                    : "bg-white border-slate-200 text-slate-400"
                                                    }`}
                                            >
                                                <span className={`text-lg md:text-2xl font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                                                    ₹{slab.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className={`text-[10px] sm:text-xs ${isActive ? "text-slate-800 font-bold" : "text-slate-400 font-medium"} mt-1 capitalize tracking-wide`}>
                                                    {rangeLabel}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div>
                                        <span className="text-3xl font-bold text-gray-900">
                                            ₹{currentUnitPrice.toLocaleString()}
                                        </span>

                                        {product.regularPrice && product.regularPrice > currentUnitPrice && (
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
                                </div>
                            </div>
                        )}


                        {/* Interactive Variant Selectors & Quick Add to Cart */}
                        <div className="space-y-4 pt-4">
                            {/* Variant Select by Name Chips */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-2">Variant Options</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants?.map((v) => {
                                        const isSelected = selectedVariantId === v._id;
                                        const cartQty = getCartQty(v.name);

                                        return (
                                            <button
                                                key={v._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVariantId(v._id);
                                                    setCurrentImage(0); // Reset image index
                                                }}
                                                className={`relative pl-1.5 pr-4 py-1 rounded-md border text-sm font-medium transition duration-200 flex items-center gap-2 ${isSelected
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                                    }`}
                                            >
                                                {v.images?.[0] && (
                                                    <img
                                                        src={v.images[0]}
                                                        alt={v.name}
                                                        className="w-8 h-8 object-contain rounded bg-slate-50 border border-slate-100"
                                                    />
                                                )}
                                                <span className="capitalize">{v.name}</span>
                                                {cartQty > 0 && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-700"
                                                        }`}>
                                                        x{cartQty}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Variant Quantity Spinner and Add Button */}
                            {activeVariant && (
                                <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-800 capitalize">
                                            Select Quantity for "{activeVariant.name}"
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            MOQ: {product.moq || 60} units | Max order: 4,000 units
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 self-start sm:self-center">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                className="w-9 h-9 rounded-md border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95 disabled:opacity-40"
                                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                                disabled={qty <= 1}
                                            >
                                                –
                                            </button>
                                            <input
                                                type="text"
                                                value={qty}
                                                onChange={(e) => {
                                                    let num = parseInt(e.target.value);
                                                    if (isNaN(num) || num < 1) num = 1;
                                                    if (num > 4000) num = 4000;
                                                    setQty(num);
                                                }}
                                                className="w-16 h-9 text-center border border-slate-300 bg-white rounded-md font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                                            />
                                            <button
                                                type="button"
                                                className="w-9 h-9 rounded-md border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95 disabled:opacity-40"
                                                onClick={() => setQty(q => Math.min(4000, q + 1))}
                                                disabled={qty >= 4000}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <Button
                                            className="bg-[#ED1C24] hover:bg-[#D1171D] text-white font-semibold py-2 h-9 px-5 rounded-md shadow transition duration-200"
                                            onClick={handleAddToCart}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                            ) : (
                                                "Add to Cart"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Added Items in Cart List */}
                            {addedCartItems.length > 0 && (
                                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mt-3">
                                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                                        <h4 className="text-sm font-extrabold text-slate-800">Added Items in Cart</h4>
                                        <span className="text-xs bg-red-50 text-[#ED1C24] font-bold px-2 py-0.5 rounded">
                                            Product Total: ₹{productSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {addedCartItems.map((item) => (
                                            <div key={item._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                                                <div className="text-left">
                                                    <span className="font-semibold text-slate-900 capitalize text-sm">{item.variantName}</span>
                                                    <span className="text-xs text-slate-500 block">{item.quantity} units x ₹{item.price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        ₹{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFromCart(item.variantId, item.variantName, item.quantity)}
                                                        className="text-slate-400 hover:text-[#ED1C24] transition duration-150 p-1"
                                                        title="Remove variant"
                                                        disabled={isActionLoading}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                                    {/* <Card className="mt-0">
                                        <CardContent>
                                            <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Category</div>
                                                    <div className="font-medium">{product.category?.name || "—"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Variants</div>
                                                    <div className="font-medium capitalize">{product.variants?.map(v => v.name).join(", ") || "—"}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card> */}
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
