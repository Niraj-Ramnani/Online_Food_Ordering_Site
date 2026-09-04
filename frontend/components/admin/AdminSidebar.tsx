"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_NAV_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    exact: false,
  },
  {
    href: "/admin/restaurants",
    label: "Restaurants",
    icon: Store,
    exact: false,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400">QuickBite Operations</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        {ADMIN_NAV_LINKS.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
