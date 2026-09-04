"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
}

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: AdminStatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
