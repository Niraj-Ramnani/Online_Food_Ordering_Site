import React from "react";
import Link from "next/link";
import { Flame, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">


        {/* Essential Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
          <Link
            href="/restaurants"
            className="hover:text-orange-500 transition-colors"
          >
            Explore Restaurants
          </Link>
          <Link
            href="/cart"
            className="hover:text-orange-500 transition-colors"
          >
            Cart
          </Link>
          <Link
            href="/addresses"
            className="hover:text-orange-500 transition-colors"
          >
            Delivery Addresses
          </Link>
          <Link
            href="/seller/dashboard"
            className="hover:text-orange-500 transition-colors"
          >
            Seller Center
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
