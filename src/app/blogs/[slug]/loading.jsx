import React from "react";

export default function BlogDetailsLoading() {
  return (
    <div className="w-full bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative animate-pulse">
          
          {/* Left Side: Content Skeleton */}
          <article className="lg:col-span-8 bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Header Image Skeleton */}
            <div className="aspect-video w-full rounded-lg bg-gray-200"></div>

            {/* Date Skeleton */}
            <div className="h-4 bg-gray-200 rounded-md w-1/6"></div>

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
            </div>

            {/* Body Text Skeletons */}
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            </div>
          </article>

          {/* Right Side: Sidebar Skeleton */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 pb-2"></div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border border-slate-100 rounded-lg p-3 bg-white space-y-3">
                  <div className="aspect-square w-full bg-gray-200 rounded-md"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
