"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrands, getSearchResults } from "@/lib/services/operations/HomeApi";
import ProductCard1 from "./ProductCard1";
import { useSearchParams } from "next/navigation";
import { SearchBar2 } from "./SearchBar2";
import { X, Sliders } from "lucide-react"; // optional icons; replace if not available

export default function SearchSection() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.get("searchKey");
  const searchQuery = searchParams.get("q");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const minPrice = 0;
  const maxPrice = 50000;

  const [priceFrom, setPriceFrom] = useState(minPrice);
  const [priceTo, setPriceTo] = useState(maxPrice);
  const [priceSort, setPriceSort] = useState("asc");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const containerRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL query -> local query (only if long enough)
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      setQuery(searchQuery);
      // show results if query present
      setShowDropdown(true);
    }
  }, [searchQuery]);

  // Debounced search (150ms)
  useEffect(() => {
    // if there's no searchKey and no query, clear
    if (!searchKey && !query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    const t = setTimeout(() => {
      getSearchResults(query, searchKey, priceFrom, priceTo, priceSort, selectedBrands)
        .then((data) => {
          setResults(data || []);
          setShowDropdown(true);
        })
        .catch(() => {
          setResults([]);
          setShowDropdown(false);
        })
        .finally(() => setIsLoading(false));
    }, 150);

    return () => {
      clearTimeout(t);
      setIsLoading(false);
    };
  }, [query, searchKey, priceFrom, priceTo, priceSort, selectedBrands]);

  // Fetch brands once
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

  // Escape key to close dropdown or mobile drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Toggle brand selection
  const toggleBrand = (b) => {
    const isSelected = selectedBrands.some((br) => br._id === b._id);
    if (isSelected) setSelectedBrands((prev) => prev.filter((br) => br._id !== b._id));
    else setSelectedBrands((prev) => [...prev, b]);
  };

  // Range input handlers
  const onFromInput = (e) => {
    const val = Number(e.currentTarget.value);
    setPriceFrom(Math.min(val, priceTo));
  };
  const onToInput = (e) => {
    const val = Number(e.currentTarget.value);
    setPriceTo(Math.max(val, priceFrom));
  };

  const trackBackground = useMemo(() => {
    const max = Number(maxPrice) || 1;
    const p1 = (Number(priceFrom) / max) * 100;
    const p2 = (Number(priceTo) / max) * 100;
    return `linear-gradient(to right, #dadae5 ${p1}% , #1e293b ${p1}% , #1e293b ${p2}%, #dadae5 ${p2}%)`;
  }, [priceFrom, priceTo, maxPrice]);

  // clear filters
  const clearAll = () => {
    setPriceFrom(minPrice);
    setPriceTo(maxPrice);
    setPriceSort("asc");
    setSelectedBrands([]);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* Mobile Search + Filter button */}
      <div className="mt-4 block md:hidden px-0">
        <SearchBar2 value={query} onChange={(v) => setQuery(v)} />
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="p-4 pt-0 -mt-2"
        >
          <div className="w-full h-full flex gap-4">
            {/* Sidebar - visible only on md+ */}
            <div className="hidden md:block min-w-[20vw] max-w-[25vw] h-[87vh] sticky top-20">
              <aside className="h-full bg-white rounded-lg shadow-sm border p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm text-sky-600 hover:text-sky-800"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {/* Price Card */}
                  <div className="bg-gray-50 rounded-md p-3 mb-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Price</h3>
                      <span className="text-xs text-gray-500">₹{priceFrom} — ₹{priceTo}</span>
                    </div>

                    {/* Slider */}
                    <div className="mb-3">
                      <div className="relative w-full h-10">
                        <div
                          aria-hidden
                          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded"
                          style={{
                            background: trackBackground,
                          }}
                        />

                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={priceFrom}
                          onInput={onFromInput}
                          className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                        />

                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={priceTo}
                          onInput={onToInput}
                          className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                        />
                      </div>

                      {/* numeric inputs */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Min</label>
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={priceFrom}
                            min={minPrice}
                            max={priceTo}
                            onChange={(e) => {
                              const v = Number(e.target.value || minPrice);
                              setPriceFrom(Math.min(Math.max(v, minPrice), priceTo));
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Max</label>
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={priceTo}
                            min={priceFrom}
                            max={maxPrice}
                            onChange={(e) => {
                              const v = Number(e.target.value || maxPrice);
                              setPriceTo(Math.max(Math.min(v, maxPrice), priceFrom));
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setPriceSort("asc")}
                        className={`flex-1 text-sm py-1 rounded border ${priceSort === "asc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                      >
                        Low → High
                      </button>
                      <button
                        onClick={() => setPriceSort("desc")}
                        className={`flex-1 text-sm py-1 rounded border ${priceSort === "desc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                      >
                        High → Low
                      </button>
                    </div>
                  </div>

                  {/* Brands */}
                  <div className="bg-white rounded-md p-3 mb-4 border">
                    <h4 className="text-sm font-medium mb-2">Brands</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                      {brands?.length === 0 ? (
                        <div className="text-xs text-gray-500">No brands found</div>
                      ) : (
                        brands.map((b, idx) => {
                          const isSelected = selectedBrands.some((brand) => brand._id === b._id);
                          return (
                            <button
                              key={b._id || idx}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleBrand(b);
                              }}
                              className={`flex items-center gap-2 text-sm rounded px-2 py-1 w-full text-left transition ${isSelected ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                            >
                              <img src={b?.image} alt={b?.name} className="h-6 w-6 rounded object-cover" />
                              <span className="flex-1 truncate">{b?.name}</span>
                              {isSelected && (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    setSelectedBrands((prev) => prev.filter((brand) => brand._id !== b._id));
                                  }}
                                  className="ml-2 text-xs opacity-80 hover:text-red-500"
                                  aria-label={`Remove ${b?.name}`}
                                >
                                  ✕
                                </button>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Results */}
            <div className="w-full">
              <h2 className="font-bold text-2xl mb-3">
                Search Results for
                <span className="capitalize italic text-blue-800">{` ${searchKey || query}`}</span>
              </h2>
              <div className="mt-3 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1 mb-2 text-sm bg-white"
                  aria-label="Open filters"
                >
                  <Sliders className="h-4 w-4" />
                  Filters
                </button>
              </div>

              {showDropdown && isLoading && (
                <div className="w-full flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-2 items-stretch place-items-stretch">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-64 rounded bg-gray-200 animate-pulse" />
                  ))}
                </div>
              )}

              {showDropdown && !isLoading && results.length > 0 && (
                <ul className="w-full flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-2 items-stretch place-items-stretch overflow-auto">
                  {results.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        // when user selects product, hide dropdown (you can change behavior)
                        setShowDropdown(false);
                      }}
                      className="cursor-pointer w-full h-full"
                    >
                      <ProductCard1 product={item} />
                    </li>
                  ))}
                </ul>
              )}

              {showDropdown && !isLoading && results.length === 0 && (
                <div className="text-gray-500">No products found.</div>
              )}
            </div>
          </div>

          {/* Mobile Drawer (bottom sheet) */}
          <div
            aria-hidden={!mobileFiltersOpen}
            className={`fixed inset-0 z-40 transition-opacity ${mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            {/* overlay */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity ${mobileFiltersOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* sheet */}
            <div
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              className={`fixed left-0 right-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-2xl bg-white shadow-xl transform transition-transform ${mobileFiltersOpen ? "translate-y-0" : "translate-y-[110%]"
                }`}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium">Filters</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => clearAll()} className="text-sm text-sky-600">Clear</button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-md p-1 hover:bg-gray-100"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-[65vh] overflow-y-auto">
                {/* Price card (mobile) */}
                <div className="bg-gray-50 rounded-md p-3 mb-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Price</h3>
                    <span className="text-xs text-gray-500">₹{priceFrom} — ₹{priceTo}</span>
                  </div>

                  <div className="mb-3">
                    <div className="relative w-full h-10">
                      <div
                        aria-hidden
                        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded"
                        style={{
                          background: trackBackground,
                        }}
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceFrom}
                        onInput={onFromInput}
                        className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceTo}
                        onInput={onToInput}
                        className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Min</label>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={priceFrom}
                          min={minPrice}
                          max={priceTo}
                          onChange={(e) => {
                            const v = Number(e.target.value || minPrice);
                            setPriceFrom(Math.min(Math.max(v, minPrice), priceTo));
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Max</label>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={priceTo}
                          min={priceFrom}
                          max={maxPrice}
                          onChange={(e) => {
                            const v = Number(e.target.value || maxPrice);
                            setPriceTo(Math.max(Math.min(v, maxPrice), priceFrom));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setPriceSort("asc")}
                      className={`flex-1 text-sm py-1 rounded border ${priceSort === "asc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                    >
                      Low → High
                    </button>
                    <button
                      onClick={() => setPriceSort("desc")}
                      className={`flex-1 text-sm py-1 rounded border ${priceSort === "desc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                    >
                      High → Low
                    </button>
                  </div>
                </div>

                {/* Brands */}
                <div className="bg-white rounded-md p-3 mb-4 border">
                  <h4 className="text-sm font-medium mb-2">Brands</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                    {brands?.length === 0 ? (
                      <div className="text-xs text-gray-500">No brands found</div>
                    ) : (
                      brands.map((b, idx) => {
                        const isSelected = selectedBrands.some((brand) => brand._id === b._id);
                        return (
                          <button
                            key={b._id || idx}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBrand(b);
                            }}
                            className={`flex items-center gap-2 text-sm rounded px-2 py-1 w-full text-left transition ${isSelected ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                          >
                            <img src={b?.image} alt={b?.name} className="h-6 w-6 rounded object-cover" />
                            <span className="flex-1 truncate">{b?.name}</span>
                            {isSelected && (
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setSelectedBrands((prev) => prev.filter((brand) => brand._id !== b._id));
                                }}
                                className="ml-2 text-xs opacity-80 hover:text-red-500"
                                aria-label={`Remove ${b?.name}`}
                              >
                                ✕
                              </button>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      // apply and close
                      setMobileFiltersOpen(false);
                      setShowDropdown(true);
                    }}
                    className="w-full rounded-md py-2 text-white bg-black"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slider styles (thumbs + track) */}
          <style jsx>{`
            input[type="range"] {
              -webkit-appearance: none;
              appearance: none;
              outline: none;
            }
            input[type="range"]::-webkit-slider-runnable-track {
              height: 8px;
              background: transparent;
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 9999px;
              background: #ffffff;
              border: 3px solid #1e293b;
              margin-top: -6px;
              cursor: grab;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            }
            input[type="range"]:active::-webkit-slider-thumb {
              cursor: grabbing;
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 9999px;
              background: #ffffff;
              border: 3px solid #1e293b;
              cursor: grab;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            }
          `}</style>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
