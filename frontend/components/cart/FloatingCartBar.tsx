"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function FloatingCartBar() {
  const pathname = usePathname();
  const {
    itemCount,
    subtotal,
    lastAddedNotification,
    dismissAddedNotification,
  } = useCart();

  // Do not show on /cart or /checkout or /login or /register
  const isExcludedPage =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin");

  if (isExcludedPage) {
    return null;
  }

  // 1. Toast Notification for recently added item
  if (lastAddedNotification) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {lastAddedNotification.image_url ? (
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15">
                <Image
                  src={lastAddedNotification.image_url}
                  alt={lastAddedNotification.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Added to Cart
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">
                {lastAddedNotification.quantity}x {lastAddedNotification.name}
              </h4>
              {lastAddedNotification.price && (
                <p className="text-[11px] text-slate-300 font-medium">
                  ₹{Number(lastAddedNotification.price).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cart"
              onClick={dismissAddedNotification}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-orange-500/30 transition-all"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={dismissAddedNotification}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Persistent subtle floating cart bar when items exist in cart
  if (itemCount > 0) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in duration-200">
        <Link
          href="/cart"
          className="group bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-4 py-3 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center gap-3 hover:scale-105 transition-all duration-200"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {itemCount}
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-orange-100 tracking-wider">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="text-xs font-black text-white">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
          <div className="pl-1 text-white/90 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    );
  }

  return null;
}
