"use client";

import React, { useState } from "react";
import { X, Sliders } from "lucide-react";
import FiltersPanel from "./FiltersPanel";

/**
 * Mobile bottom-sheet wrapper for FiltersPanel.
 *
 * Props: same as FiltersPanel plus:
 * - triggerClassName (optional) to style the trigger button
 */
export default function MobileFiltersDrawer({
    triggerClassName = "inline-flex items-center gap-2 rounded-md border px-3 py-1 mb-2 text-sm bg-white",
    onClear = () => { },
    onApply = null,
    ...panelProps
}) {
    const [open, setOpen] = useState(false);

    const handleApply = () => {
        if (onApply) onApply();
        if (panelProps.onApply) panelProps.onApply();
        setOpen(false);
    };

    return (
        <>
            <div className="mt-3 flex items-center justify-start md:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={triggerClassName}
                    aria-label="Open filters"
                >
                    <Sliders className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Drawer */}
            <div
                aria-hidden={!open}
                className={`fixed inset-0 z-[100] transition-opacity ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            >
                <div
                    className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setOpen(false)}
                />

                <div
                    role="dialog"
                    aria-modal="true"
                    className={`fixed left-0 right-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-2xl bg-white shadow-xl transform transition-transform ${open ? "translate-y-0" : "translate-y-[110%]"}`}
                >
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-lg font-medium">Filters</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    onClear();
                                }}
                                className="text-sm text-sky-600"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-md p-1 hover:bg-gray-100"
                                aria-label="Close filters"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 max-h-[65vh] overflow-y-auto">
                        <FiltersPanel
                            {...panelProps}
                            showApplyButton={true}
                            onApply={handleApply}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
