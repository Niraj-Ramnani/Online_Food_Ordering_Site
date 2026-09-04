"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";

export function ReplaceCartModal() {
  const { conflictModal, confirmReplaceCart, cancelReplaceCart, isLoading } = useCart();

  if (!conflictModal.isOpen || !conflictModal.pendingItem) {
    return null;
  }

  const { pendingItem, currentRestaurantName } = conflictModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={cancelReplaceCart}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Replace cart items?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orders can only be placed from one restaurant at a time.
            </p>
          </div>
        </div>

        {/* Conflict Details Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p>
            Your cart already contains dishes from{" "}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {currentRestaurantName || "another restaurant"}
            </span>
            .
          </p>
          <p>
            Would you like to discard the previous items and add{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              &ldquo;{pendingItem.name}&rdquo;
            </span>{" "}
            from{" "}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {pendingItem.restaurantName || "the new restaurant"}
            </span>
            ?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={cancelReplaceCart}
            disabled={isLoading}
            className="font-bold text-slate-600 dark:text-slate-300"
          >
            Keep Cart
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={confirmReplaceCart}
            isLoading={isLoading}
            className="font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Discard & Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
