"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Store, Utensils } from "lucide-react";

export function SellerNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: "/seller/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/seller" || pathname === "/seller/dashboard",
    },
    {
      label: "Restaurant Profile",
      href: "/seller/restaurant",
      icon: Store,
      active: pathname === "/seller/restaurant",
    },
    {
      label: "Food Menu",
      href: "/seller/food",
      icon: Utensils,
      active: pathname === "/seller/food",
    },
    {
      label: "Live Orders",
      href: "#",
      icon: ShoppingBag,
      active: false,
      badge: "Milestone 5",
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        if (tab.href === "#") {
          return (
            <div
              key={tab.label}
              className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                  {tab.badge}
                </span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              tab.active
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
