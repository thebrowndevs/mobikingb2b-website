import React from "react";

export default function BlogsLoading() {
  return (
    <div className="w-full bg-gray-50 min-h-screen py-12">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">
        
        {/* Header Hero Section Skeleton */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="h-10 bg-gray-200 rounded-md w-3/4 mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-md w-full mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-md w-5/6 mx-auto animate-pulse"></div>
          <div className="mt-4 w-24 h-1 bg-indigo-200 mx-auto rounded-full animate-pulse"></div>
        </div>

        {/* Blog Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[340px] animate-pulse"
            >
              {/* Image Skeleton */}
              <div className="aspect-video w-full bg-gray-200"></div>

              {/* Content Skeleton */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  {/* Meta */}
                  <div className="h-3 bg-gray-200 rounded-md w-1/3"></div>
                  {/* Title */}
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                  {/* Excerpt */}
                  <div className="h-3 bg-gray-200 rounded-md w-full mt-2"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-4/5"></div>
                </div>

                {/* Footer Link Skeleton */}
                <div className="pt-3 border-t border-gray-50">
                  <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
