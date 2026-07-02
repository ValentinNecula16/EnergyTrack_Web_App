import React from "react";

const Shimmer = ({ className }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-gray-800 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="mt-24 px-2 md:px-6 animate-pulse">
    {/* Header skeleton */}
    <Shimmer className="h-32 w-full mb-8" />

    {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <Shimmer key={i} className="h-40" />
      ))}
    </div>

    {/* Middle row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Shimmer className="h-52 lg:col-span-1" />
      <Shimmer className="h-52 lg:col-span-2" />
    </div>

    {/* Bottom row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Shimmer key={i} className="h-36" />
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
