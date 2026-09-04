"use client";

import React from "react";
import { Store, User as UserIcon } from "lucide-react";

interface RoleSelectorProps {
  value: "USER" | "SELLER";
  onChange: (role: "USER" | "SELLER") => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        I want to join as
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Customer Option */}
        <button
          type="button"
          onClick={() => onChange("USER")}
          className={`flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
            value === "USER"
              ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-slate-900 dark:text-white shadow-sm shadow-orange-500/10"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              value === "USER"
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <UserIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold block">Customer</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Order food easily</span>
        </button>

        {/* Restaurant Seller Option */}
        <button
          type="button"
          onClick={() => onChange("SELLER")}
          className={`flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
            value === "SELLER"
              ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-slate-900 dark:text-white shadow-sm shadow-orange-500/10"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              value === "SELLER"
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <Store className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold block">Restaurant Seller</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Manage your menu</span>
        </button>
      </div>
    </div>
  );
}
