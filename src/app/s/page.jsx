//s/page.jsx
import React, { Suspense } from "react";
import SearchSection from "@/app/s/components/SearchSection";
export const dynamic = "force-dynamic";

export default function SearchProductsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <SearchSection />
      </Suspense>
    </div>
  );
}
