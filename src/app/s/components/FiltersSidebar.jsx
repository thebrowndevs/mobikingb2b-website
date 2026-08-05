"use client";

import React from "react";
import FiltersPanel from "./FiltersPanel";

export default function FiltersSidebar({
    onClear = () => { },
    ...props
}) {
    return (
        <div className="hidden md:block bg-white rounded-lg shadow-sm border p-4  min-w-[20vw] max-w-[25vw] h-[87vh] sticky top-20">
            <aside className="h-full">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
                    <button type="button" onClick={onClear} className="text-sm text-sky-600 hover:text-sky-800">
                        Clear
                    </button>
                </div>
                <FiltersPanel {...props} showApplyButton={false} />
            </aside>
        </div>
    );
}
