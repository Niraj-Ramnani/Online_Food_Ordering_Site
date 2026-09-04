import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}
    >
      <Loader2
        className={`${sizeMap[size]} text-orange-500 animate-spin`}
      />
      {text && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {text}
        </p>
      )}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 animate-pulse"
        >
          <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
