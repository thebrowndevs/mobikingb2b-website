// components/SearchSection.jsx
"use client";
import React, { useEffect, useState } from "react";
import FiltersSidebar from "./FiltersSidebar";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import ResultsGrid from "./ResultsGrid";
import { useSearchParams } from "next/navigation";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import SearchBar2 from "../../../components/SearchBar2";
import { getBrands } from "@/lib/services/operations/HomeApi"; // fetch brands

export default function SearchSection() {
  const searchParams = useSearchParams();
  const searchKeyParam = searchParams.get("searchKey") ?? "";
  const qParam = searchParams.get("q") ?? "";

  const [priceFrom, setPriceFrom] = useState(0);
  const [priceTo, setPriceTo] = useState(50000);
  const [priceSort, setPriceSort] = useState("");
  const [brands, setBrands] = useState([]); // fetched from API
  const [selectedBrands, setSelectedBrands] = useState([]);

  const toggleBrand = (b) => {
    setSelectedBrands((prev) =>
      prev.some((sb) => sb._id === b._id) ? prev.filter((sb) => sb._id !== b._id) : [...prev, b]
    );
  };

  // fetch brands once
  useEffect(() => {
    let mounted = true;
    getBrands()
      .then((data) => {
        if (mounted) setBrands(data || []);
      })
      .catch(() => {
        if (mounted) setBrands([]);
      });
    return () => (mounted = false);
  }, []);

  const minPrice = 0;
  const maxPrice = 50000;

  // Pass dynamic filter state into hook so it re-fetches when filters change
  const {
    query,
    setQuery,
    searchKey,
    setSearchKey,
    results,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    clearAll,
    setResults,
    lastIndex,
  } = usePaginatedSearch({
    initialQuery: qParam,
    initialSearchKey: searchKeyParam,
    initialLimit: 12,
    nextLimit: 6,
    priceFrom,
    priceTo,
    priceSort,
    selectedBrands,
    debounceMs: 150,
  });

  // sync route param -> hook
  useEffect(() => {
    if (qParam) setQuery(qParam);
    if (searchKeyParam) setSearchKey(searchKeyParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, searchKeyParam]);

  // Clear must reset both local filters and hook results
  const handleClear = () => {
    setPriceFrom(minPrice);
    setPriceTo(maxPrice);
    setPriceSort("");
    setSelectedBrands([]);
    clearAll();
  };

  return (
    <div className="w-full">
      <div className="mt-4 block md:hidden px-0">
        <SearchBar2 value={query} onChange={(v) => setQuery(v)} />

        <div className="px-3 mb-3 -mt-2">
          <MobileFiltersDrawer
            priceFrom={priceFrom}
            setPriceFrom={setPriceFrom}
            priceTo={priceTo}
            setPriceTo={setPriceTo}
            priceSort={priceSort}
            setPriceSort={setPriceSort}
            brands={brands}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            onClear={handleClear}
            // onApply not necessary because hook auto-listens to filter state changes,
            // but we provide it to close drawer from the mobile component
            onApply={() => { }}
          />
        </div>
      </div>

      <div className="p-4 pt-0 -mt-2 sm:mt-4">
        <div className="w-full h-full flex gap-4">
          <div className="hidden md:block min-w-[20vw] max-w-[25vw] h-[87vh] sticky top-20">
            <FiltersSidebar
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              priceSort={priceSort}
              setPriceSort={setPriceSort}
              brands={brands}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              onClear={handleClear}
            />
          </div>

          <div className="w-full">
            <h2 className="font-bold text-2xl mb-3">
              Search Results for
              <span className="capitalize italic text-blue-800">{` ${searchKey || query}`}</span>
            </h2>

            <ResultsGrid
              results={results}
              isLoading={isLoading}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
              loadMore={loadMore}
              onProductClick={() => {
                /* optionally hide dropdown */
              }}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
