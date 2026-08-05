"use client";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ProductCard1 from "@/components/ProductCard1";
import { getSubCategoryProductsBySlugPaginated } from "@/lib/services/operations/HomeApi";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [subCategory, setSubCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ lastIndex: -1, hasMore: true, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const paginationRef = useRef(pagination);
  const observerRef = useRef(null);
  const observedElRef = useRef(null);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // ✅ Fetch products for this subcategory
  const fetchProducts = useCallback(
    async (cursor = null, initial = false) => {
      if (!initial && !paginationRef.current.hasMore) return;

      const limit = 10;
      const lastIndexToSend =
        typeof cursor === "number"
          ? cursor
          : paginationRef.current.lastIndex ?? -1;

      try {
        if (!initial) setLoadingMore(true);

        const data = await getSubCategoryProductsBySlugPaginated({
          slug,
          limit,
          lastIndex: lastIndexToSend
        });

        const newSubCat = data?.subCategory || null;
        const newProducts = data?.products || [];
        const newPagination = data?.pagination || {};

        if (initial) setSubCategory(newSubCat);

        setProducts((prev) => {
          if (initial) return newProducts;
          const existingIds = new Set(prev.map((p) => String(p._id)));
          const filtered = newProducts.filter(
            (p) => !existingIds.has(String(p._id))
          );
          return [...prev, ...filtered];
        });

        setPagination((prev) => {
          const merged = { ...prev, ...newPagination };
          paginationRef.current = merged;
          return merged;
        });
      } catch (err) {
        console.error("Failed to fetch subcategory products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

  // ✅ Initial load on slug change
  useEffect(() => {
    setProducts([]);
    setPagination({ lastIndex: -1, hasMore: true, total: 0 });
    setLoading(true);
    fetchProducts(-1, true);
  }, [slug, fetchProducts]);

  // ✅ Infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !pagination.hasMore) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting && paginationRef.current.hasMore) {
            fetchProducts(paginationRef.current.lastIndex, false);
          }
        },
        { threshold: 0.5 }
      );
    }

    const lastProductEl = document.querySelector(".product-last");

    if (observedElRef.current && observedElRef.current !== lastProductEl) {
      try {
        observerRef.current.unobserve(observedElRef.current);
      } catch { }
      observedElRef.current = null;
    }

    if (lastProductEl && observedElRef.current !== lastProductEl) {
      observerRef.current.observe(lastProductEl);
      observedElRef.current = lastProductEl;
    }

    return () => {
      if (observerRef.current && observedElRef.current) {
        try {
          observerRef.current.unobserve(observedElRef.current);
        } catch { }
        observedElRef.current = null;
      }
    };
  }, [products.length, pagination.hasMore, loadingMore, fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-gray-400" />
      </div>
    );
  }

  const categoryName = subCategory?.name || slug.replace(/-/g, " ");

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <Breadcrumb />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {categoryName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination.total} product{pagination.total !== 1 && "s"} found in this category
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2 md:gap-3">
              {products.map((product, idx) => {
                const isLast = idx === products.length - 1;
                return (
                  <div
                    key={product._id}
                    className={`w-full ${isLast ? "product-last" : ""}`}
                  >
                    <ProductCard1 product={product} />
                  </div>
                );
              })}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            )}

            {!pagination.hasMore && !loadingMore && (
              <div className="text-center py-8 text-sm text-gray-500">
                Thanks for shopping with Mobiking Wholesale.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
