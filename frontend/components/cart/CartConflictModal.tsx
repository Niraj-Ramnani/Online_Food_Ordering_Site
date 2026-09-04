"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";

export function CartConflictModal() {
  const { conflictPending, confirmClearAndAdd, cancelConflict, isUpdating } =
    useCart();

  if (!conflictPending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={cancelConflict}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Replace Cart Items?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your cart contains items from another restaurant. You can only order from one restaurant at a time.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            Would you like to clear your current cart and add{" "}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {conflictPending.foodItem.name}
            </span>
            ?
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="flex-1"
            onClick={cancelConflict}
            disabled={isUpdating}
          >
            Keep Cart
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            className="flex-1"
            isLoading={isUpdating}
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={confirmClearAndAdd}
          >
            Clear & Add
          </Button>
        </div>
      </div>
    </div>
  );
}
