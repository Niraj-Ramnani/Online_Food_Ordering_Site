import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Cart } from "@/types";

interface CartSummaryProps {
  cart: Cart;
  onClearCart?: () => void;
  isUpdating?: boolean;
}

export function CartSummary({
  cart,
  onClearCart,
  isUpdating = false,
}: CartSummaryProps) {
  const numericSubtotal =
    typeof cart.subtotal === "number"
      ? cart.subtotal
      : parseFloat(cart.subtotal || "0");

  const formattedSubtotal = numericSubtotal.toFixed(2);
  const isFreeDelivery = numericSubtotal >= 500;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const total = (numericSubtotal + deliveryFee).toFixed(2);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Bill Summary
        </h3>
        {onClearCart && (
          <button
            type="button"
            onClick={onClearCart}
            disabled={isUpdating}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Free Delivery Incentive */}
      {isFreeDelivery ? (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>You unlocked FREE Delivery on this order! 🎉</span>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 text-orange-800 dark:text-orange-300 text-xs font-semibold flex items-center justify-between">
          <span>Add ₹{(500 - numericSubtotal).toFixed(0)} more for FREE delivery</span>
          <Badge variant="orange" size="sm">
            Save ₹40
          </Badge>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span>Item Total ({cart.total_items} items)</span>
          <span className="font-bold text-slate-900 dark:text-white">
            ₹{formattedSubtotal}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Delivery Partner Fee</span>
          {isFreeDelivery ? (
            <span className="font-bold text-emerald-600">FREE</span>
          ) : (
            <span className="font-bold text-slate-900 dark:text-white">
              ₹{deliveryFee.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Taxes & Restaurant Charges</span>
          <span className="font-medium text-slate-500">Calculated at checkout</span>
        </div>
      </div>

      {/* Final Total */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
            To Pay
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{total}
          </span>
        </div>

        <Badge variant="success" size="sm">
          Best Price Guaranteed
        </Badge>
      </div>

      {/* Checkout Action Button */}
      <Link href="/addresses">
        <Button
          variant="primary"
          size="lg"
          className="w-full text-base font-bold shadow-lg shadow-orange-500/25 mt-2"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Select Delivery Address
        </Button>
      </Link>

      <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Safe & Encrypted 256-bit Payment via Razorpay</span>
      </div>
    </div>
  );
}
