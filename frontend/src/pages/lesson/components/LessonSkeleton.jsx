import React from "react";

export function LessonSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse text-left pt-2">
      <div className="lg:col-span-2 space-y-6">
        {/* Title area skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-32 bg-gray-250 rounded-full" />
          <div className="h-10 w-2/3 bg-gray-350 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
            <div className="h-5 w-24 bg-gray-200 rounded-full" />
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Video placeholder skeleton */}
        <div className="w-full aspect-video bg-gray-300 rounded-2xl" />

        {/* Text body skeleton */}
        <div className="bg-white rounded-2xl border border-gray-150 p-8 space-y-4">
          <div className="h-4 w-1/4 bg-gray-250 rounded mb-6" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/5 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden space-y-4 pb-4">
          <div className="bg-gray-300 p-5 space-y-3">
            <div className="h-5 w-1/2 bg-gray-200 rounded" />
            <div className="h-2 w-full bg-gray-200 rounded-full" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-10 w-full bg-gray-150 rounded" />
            <div className="h-10 w-full bg-gray-150 rounded" />
            <div className="h-10 w-full bg-gray-150 rounded" />
            <div className="h-10 w-full bg-gray-150 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
