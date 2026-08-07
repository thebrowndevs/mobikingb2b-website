import React from "react";

export default function BlogDetailsLoading() {
  return (
    <div className="w-full min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        <div className="animate-pulse">
          {/* Main Card Skeleton */}
          <article className="bg-white border border-slate-150 rounded-2xl p-6 md:p-10 shadow-none space-y-6">
            {/* Header Image Skeleton */}
            <div className="aspect-video w-full rounded-xl bg-slate-100"></div>

            {/* Date Skeleton */}
            <div className="h-4 bg-slate-150 rounded-md w-24"></div>

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-8 bg-slate-150 rounded-md w-3/4"></div>
              <div className="h-8 bg-slate-150 rounded-md w-1/2"></div>
            </div>

            {/* Body Text Skeletons */}
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-slate-100 rounded-md w-full"></div>
              <div className="h-4 bg-slate-100 rounded-md w-full"></div>
              <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded-md w-full"></div>
              <div className="h-4 bg-slate-100 rounded-md w-4/5"></div>
              <div className="h-4 bg-slate-100 rounded-md w-full"></div>
              <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
