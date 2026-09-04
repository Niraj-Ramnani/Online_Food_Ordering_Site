"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Heart } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide Footer on authentication pages (login, register)
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isAuthPage) return null;

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
            <Flame className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            Quick<span className="text-orange-500">Bite</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
          <Link href="#restaurants" className="hover:text-orange-500 transition-colors">
            Restaurants
          </Link>
          <Link href="#dishes" className="hover:text-orange-500 transition-colors">
            Popular Dishes
          </Link>
          <Link href="#offers" className="hover:text-orange-500 transition-colors">
            Special Offers
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span>© {new Date().getFullYear()} QuickBite.</span>
          <span>Made with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> for food lovers.</span>
        </div>
      </div>
    </footer>
  );
}
