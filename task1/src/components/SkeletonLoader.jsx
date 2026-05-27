import React from 'react';

export default function SkeletonLoader({ type = 'weather' }) {
  if (type === 'news') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden h-[400px] flex flex-col p-4 animate-pulse">
            <div className="w-full h-48 bg-slate-300 dark:bg-white/10 rounded-xl mb-4" />
            <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-1/3 mb-3" />
            <div className="h-6 bg-slate-300 dark:bg-white/10 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-full mb-2" />
            <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-5/6 mb-4" />
            <div className="h-10 bg-slate-300 dark:bg-white/10 rounded-xl w-1/3 mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Default Weather Loader
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Weather Card Skeleton */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 h-[320px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2.5">
              <div className="h-8 bg-slate-300 dark:bg-white/10 rounded w-48" />
              <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-32" />
            </div>
            <div className="h-14 w-14 bg-slate-300 dark:bg-white/10 rounded-2xl" />
          </div>
          <div className="flex gap-4 items-end">
            <div className="h-20 bg-slate-300 dark:bg-white/10 rounded w-28" />
            <div className="h-6 bg-slate-300 dark:bg-white/10 rounded w-36 mb-3" />
          </div>
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-12 bg-slate-300 dark:bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Forecast Card Skeleton */}
        <div className="glass-card rounded-3xl p-6 h-[320px] flex flex-col justify-between">
          <div className="h-6 bg-slate-300 dark:bg-white/10 rounded w-36 mb-4" />
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex justify-between items-center py-1">
              <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-16" />
              <div className="h-6 w-6 bg-slate-300 dark:bg-white/10 rounded-md" />
              <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="glass-card rounded-3xl p-6 h-[260px]">
        <div className="h-6 bg-slate-300 dark:bg-white/10 rounded w-48 mb-6" />
        <div className="w-full h-36 bg-slate-300 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
