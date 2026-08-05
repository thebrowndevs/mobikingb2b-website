// components/FiltersPanel.jsx
"use client";

import React, { useMemo } from "react";

export default function FiltersPanel({
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    priceSort,
    setPriceSort,
    minPrice = 0,
    maxPrice = 50000,
    brands = [],
    selectedBrands = [],
    toggleBrand = () => { },
    onClear = () => { },
    onApply = null,
    showApplyButton = false,
}) {
    const trackBackground = useMemo(() => {
        const max = Number(maxPrice) || 1;
        const p1 = (Number(priceFrom) / max) * 100;
        const p2 = (Number(priceTo) / max) * 100;
        return `linear-gradient(to right, #dadae5 ${p1}% , #1e293b ${p1}% , #1e293b ${p2}%, #dadae5 ${p2}%)`;
    }, [priceFrom, priceTo, maxPrice]);

    const isBrandSelected = (b) => selectedBrands.some((sb) => sb._id === b._id);

    // zIndex strategy:
    // - Keep priceTo input slightly above (zIndex 2) so it's clickable.
    // - When values overlap (priceFrom is very close to priceTo), put priceFrom on top (zIndex 3) so user can still grab it.
    const fromZ = priceFrom >= priceTo ? 3 : 1;
    const toZ = 2;

    return (
        <div className="h-full flex flex-col">

            <div className="flex-1 overflow-y-auto pr-1">
                {/* Price Card */}
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
                                style={{ background: trackBackground }}
                            />

                            {/* lower thumb */}
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceFrom}
                                onInput={(e) => {
                                    const val = Number(e.currentTarget.value || minPrice);
                                    const newVal = Math.min(val, priceTo);
                                    setPriceFrom(newVal);
                                }}
                                className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                                aria-label="Minimum price"
                                style={{ zIndex: fromZ }}
                            />

                            {/* upper thumb */}
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceTo}
                                onInput={(e) => {
                                    const val = Number(e.currentTarget.value || maxPrice);
                                    const newVal = Math.max(val, priceFrom);
                                    setPriceTo(newVal);
                                }}
                                className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                                aria-label="Maximum price"
                                style={{ zIndex: toZ }}
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

                    {/* Sort */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setPriceSort(priceSort === "asc" ? "" : "asc")}
                            className={`flex-1 text-sm py-1 rounded border ${priceSort === "asc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                            aria-pressed={priceSort === "asc"}
                        >
                            Low → High
                        </button>
                        <button
                            onClick={() => setPriceSort(priceSort === "desc" ? "" : "desc")}
                            className={`flex-1 text-sm py-1 rounded border ${priceSort === "desc" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
                            aria-pressed={priceSort === "desc"}
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
                                const selected = isBrandSelected(b);
                                return (
                                    <button
                                        key={b._id ?? idx}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleBrand(b);
                                        }}
                                        className={`flex items-center gap-2 text-sm rounded px-2 py-1 w-full text-left transition ${selected ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                                        aria-pressed={selected}
                                    >
                                        {b?.image ? (
                                            <img src={b.image} alt={b.name} className="h-6 w-6 rounded object-cover" />
                                        ) : (
                                            <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">B</div>
                                        )}
                                        <span className="flex-1 truncate">{b?.name}</span>

                                        {selected && (
                                            <button
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    toggleBrand(b);
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

            {showApplyButton ? (
                <div className="pt-2">
                    <button onClick={() => onApply && onApply()} className="w-full rounded-md py-2 text-white bg-black" aria-label="Apply filters">
                        Apply Filters
                    </button>
                </div>
            ) : null}

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
        </div>
    );
}
