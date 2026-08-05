// src/app/ps/[slug]/page.jsx
import React from "react";
import ProductClient from "./components/ProductClient"; // <-- move your client-side logic into this component
import { getProductsBySlug } from "@/lib/services/operations/HomeApi";

// Server-side metadata generator
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    // Fetch product details for SEO
    const product = await getProductsBySlug(slug);

    if (!product) {
      return {
        title: "Product Not Found | Mobiking Wholesale",
        description: "Sorry, we couldn't find the product you’re looking for.",
      };
    }

    const title = `${product.fullName} | Buy Now at Best Price – Mobiking Wholesale`;
    const description = product.description?.slice(0, 150) || "Check out this amazing product on Mobiking Wholesale.";
    const imageUrl = product.images?.[0] || "/logo.png";
    const url = `https://mobikingwholesale.com/ps/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        images: [{ url: imageUrl, width: 800, height: 800, alt: product.fullName }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | Mobiking Wholesale",
      description: "Explore top-quality products at best prices.",
    };
  }
}

// Server Component (for SEO)
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductsBySlug(slug);

  if (!product) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Product Not Found</h1>
        <p>Please check the link or go back to our store.</p>
      </div>
    );
  }

  return <ProductClient product={product} />;
}


// // src/app/ps/[slug]/page.js

// import React, { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "sonner";
// import { Loader2, Heart, Star, Tag, ChevronDown, ChevronUp } from "lucide-react";

// // API Functions
// import { getProductsBySlug } from "@/lib/services/operations/HomeApi";
// import {
//   addCartById,
//   removeFromCartById,
// } from "@/lib/services/operations/CartApi";
// import ImageGallery from "./components/ImageGallery";
// import CartActions from "./components/CartActions";
// import VariantSelector from "./components/VariantSelector";
// import ProductInfoBlock from "./components/ProductInfoBlock";
// import FeaturedProducts from "@/components/layout/FeaturedProducts";

// export default function ProductPage() {
//   const { slug } = useParams();
//   const [product, setProduct] = useState(null);
//   const [currentImage, setCurrentImage] = useState(0);
//   const [selectedVariant, setSelectedVariant] = useState("");
//   const [isActionLoading, setIsActionLoading] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);

//   const { user, accessToken, setUser, setIsAuthModalOpen, setPendingAction, setLoginOpen } =
//     useAuth();

//   useEffect(() => {
//     async function fetchProduct() {
//       try {
//         const res = await getProductsBySlug(slug);
//         if (res) {
//           setProduct(res);
//           const variantEntries = Object.entries(res.variants || {});
//           const firstInStock = variantEntries.find(
//             ([name, stock]) => stock > 0
//           );
//           if (firstInStock) {
//             setSelectedVariant(firstInStock[0]);
//           } else if (variantEntries.length > 0) {
//             setSelectedVariant(variantEntries[0][0]);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch product", error);
//       }
//     }
//     if (slug) fetchProduct();
//   }, [slug]);

//   // A single, unified handler for cart updates
//   const handleUpdateCart = async (action) => {
//     if (!accessToken) {
//       toast.info("Please log in to update your cart.");
//       setLoginOpen(true);
//       return;
//     }
//     if (!product || !selectedVariant || isActionLoading) return;

//     setIsActionLoading(true);
//     try {
//       const response = await (action === "add"
//         ? addCartById
//         : removeFromCartById)(
//           {
//             productId: product._id,
//             cartId: user.cart._id,
//             variantName: selectedVariant,
//           },
//           accessToken
//         );
//       if (response?.user) {
//         setUser(response.user);
//         // toast.success("Cart updated!");
//       } else {
//         toast.error(response.error || "Failed to update cart.");
//       }
//     } catch (error) {
//       toast.error("An error occurred. Please try again.");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const { cartItem, variantStock, currentQty, displayPrice } = useMemo(() => {
//     if (!product) return {};
//     const stock = product.variants?.[selectedVariant] || 0;
//     const item = user?.cart?.items?.find(
//       (i) =>
//         i.productId?._id === product._id && i.variantName === selectedVariant
//     );

//     // Get last selling price
//     const price = product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;

//     return {
//       cartItem: item,
//       variantStock: stock,
//       currentQty: item?.quantity || 0,
//       displayPrice: price,
//     };
//   }, [product, selectedVariant, user?.cart?.items]);

//   const handleAddToCart = () => {

//   }

//   // Calculate discount percentage if regular price exists
//   const discountPercentage = useMemo(() => {
//     if (product?.regularPrice && product.regularPrice > displayPrice) {
//       return Math.round(((product.regularPrice - displayPrice) / product.regularPrice) * 100);
//     }
//     return 0;
//   }, [product, displayPrice]);

//   if (!product) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="w-full max-w-[1600px] mx-auto px-4 py-4 lg:py-3">
//         <div className="flex flex-col md:flex-row gap-6 lg:gap-4">
//           {/* Image Gallery Section */}
//           <div className="sm:sticky sm:top-22 sm:h-screen w-full sm:w-[40%]">
//             <ImageGallery
//               images={product.images || []}
//               fullName={product.fullName}
//               currentImage={currentImage}
//               setCurrentImage={setCurrentImage}
//             />
//           </div>

//           {/* Product Info Section */}
//           <div className="space-y-3 flex-1">
//             <div className="pb-2 border-b">
//               <span className="text-sm text-muted-foreground">
//                 {product.category?.name || "Electronics"}
//               </span>
//               <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 mt-1">
//                 {product.fullName}
//               </h1>

//               <div className="flex items-center mt-3">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-4 w-4 ${i < product?.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-sm text-gray-500 ml-2">({product?.reviewCount} reviews)</span>
//               </div>
//             </div>

//             {/* Price Section */}
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex flex-wrap items-center gap-4">
//                 <div>
//                   <span className="text-3xl font-bold text-gray-900">
//                     ₹{displayPrice.toLocaleString()}
//                   </span>

//                   {product.regularPrice && product.regularPrice > displayPrice && (
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="text-lg line-through text-gray-500">
//                         ₹{product.regularPrice.toLocaleString()}
//                       </span>
//                       <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
//                         {discountPercentage}% OFF
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="ml-auto">
//                   {variantStock > 0 ? (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
//                       <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
//                       In Stock
//                     </span>
//                   ) : (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
//                       Out of Stock
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <Separator />

//             {/* Variant Selector */}
//             <VariantSelector
//               variants={product.variants || {}}
//               selectedVariant={selectedVariant}
//               setSelectedVariant={setSelectedVariant}
//             />

//             {/* Cart Actions */}
//             <CartActions
//               loading={isActionLoading}
//               currentQty={currentQty}
//               variantStock={variantStock}
//               onUpdateCart={handleUpdateCart}
//             />

//             <div className="flex gap-3 pt-2">
//               {/* <Button variant="outline" className="flex-1">
//                 <Heart className="h-4 w-4 mr-2" /> Wishlist
//               </Button> */}
//               <Button
//                 className="flex-1"
//                 onClick={() => handleUpdateCart("add")}
//                 disabled={currentQty >= variantStock}
//               >
//                 {/* {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> + "Adding" : "Add to Cart"} */}
//                 Add to Cart
//               </Button>
//             </div>

//             {/* Key Features */}
//             {product.descriptionPoints && product.descriptionPoints.length > 0 && (
//               <Card className={''}>
//                 <CardContent className="px-6">
//                   <h3 className="text-lg font-semibold mb-3">Key Features</h3>
//                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {product.descriptionPoints.map((point, index) => (
//                       <li key={index} className="flex items-start">
//                         <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
//                           <Tag className="h-4 w-4 text-primary" />
//                         </div>
//                         <span className="text-gray-700">{point.replace(/["\\]/g, '')}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Key Information Table */}
//             {product.keyInformation && product.keyInformation.length > 0 && (
//               <Card>
//                 <CardContent className="">
//                   <h3 className="text-lg font-semibold mb-4">Specifications</h3>
//                   <div className="border rounded-lg overflow-hidden">
//                     {product.keyInformation.map((info, index) => (
//                       <div
//                         key={index}
//                         className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} p-4`}
//                       >
//                         <div className="w-1/3 font-medium text-gray-700">{info.title}</div>
//                         <div className="w-2/3 text-gray-600">{info.content}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Toggleable Product Details */}
//             <div className="transition-all ease-in-out duration-500">
//               <div className="p-0">
//                 {/* <button
//                   className="flex items-center justify-between w-full px-6"
//                   onClick={() => setShowDetails(!showDetails)}
//                 >
//                   <h3 className={`text-lg font-semibold ${showDetails && 'mb-3'}`}>Product Details</h3>
//                   {showDetails ? (
//                     <ChevronUp className="h-5 w-5 text-gray-500" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5 text-gray-500" />
//                   )}
//                 </button> */}

//                 <div
//                   className={`overflow-hidden transition-all duration-500 ease-in-out`}
//                 >
//                   <ProductInfoBlock
//                     // fullName={product.fullName}
//                     description={product.description}
//                   />

//                   <Card className="mt-0">
//                     <CardContent>
//                       <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <div className="text-sm text-gray-500">Category</div>
//                           <div className="font-medium">{product.category?.name || "—"}</div>
//                         </div>
//                         <div>
//                           <div className="text-sm text-gray-500">Variant</div>
//                           <div className="font-medium capitalize">{selectedVariant || "—"}</div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       <div className="mt-7">
//         <FeaturedProducts />
//       </div>
//     </div>
//   );
// }