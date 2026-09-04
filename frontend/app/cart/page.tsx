"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Store,
  Loader2,
  ShieldCheck,
  Bike,
  Sparkles,
  Receipt,
  Utensils,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    cart,
    items,
    subtotal,
    restaurant,
    isLoading: isCartLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Redirect or prompt to sign in
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Sign In to View Cart
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
          Please log in to manage your items and complete your food order.
        </p>
        <Link href="/login">
          <Button variant="primary" size="lg" className="font-bold shadow-lg shadow-orange-500/20">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (isCartLoading && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-9 h-9 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-semibold">Loading your delicious cart...</p>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          Good food is always just a few clicks away. Explore our top verified restaurants in Jaipur!
        </p>
        <Link href="/">
          <Button variant="primary" size="lg" className="font-bold shadow-lg shadow-orange-500/20">
            Explore Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  // Calculations
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 35;
  const gst = Number((subtotal * 0.05).toFixed(2));
  const platformFee = 5;
  const toPay = subtotal + deliveryFee + gst + platformFee;
  const amountNeededForFreeDelivery = Math.max(0, 300 - subtotal);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              My Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review your items before proceeding to checkout
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => clearCart()}
          className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1.5 font-bold self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Entire Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Restaurant Info + Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Restaurant Banner Card */}
          {restaurant && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0 overflow-hidden relative border border-orange-200 dark:border-orange-800">
                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      Ordering From
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {restaurant.name}
                  </h3>
                </div>
              </div>

              <Link
                href={`/restaurants/${restaurant.id}`}
                className="shrink-0 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline flex items-center gap-1"
              >
                <span>+ Add more items</span>
              </Link>
            </div>
          )}

          {/* Free Delivery Banner */}
          {amountNeededForFreeDelivery > 0 ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
              <Bike className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p>
                Add items worth{" "}
                <span className="font-extrabold text-amber-700 dark:text-amber-300">
                  ₹{amountNeededForFreeDelivery.toFixed(2)}
                </span>{" "}
                more to unlock <span className="font-extrabold">FREE delivery</span>!
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="font-bold">
                🎉 Congratulations! You unlocked <span className="underline">FREE delivery</span> on this order!
              </p>
            </div>
          )}

          {/* Cart Items List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => {
              const rawPrice = item.food_item?.price ?? item.unit_price;
              const unitPrice =
                rawPrice !== undefined
                  ? Number(rawPrice)
                  : Number(item.item_total) / (item.quantity || 1);
              const itemTotal = Number(item.item_total || unitPrice * item.quantity);
              const imageUrl =
                item.food_item?.image_url ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Left: Food Thumbnail & Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-800">
                      <Image
                        src={imageUrl}
                        alt={item.food_item?.name || "Dish"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                          {item.food_item?.name || `Dish #${item.food_item_id}`}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        ₹{unitPrice.toFixed(2)} each
                      </p>
                      {item.food_item?.category && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                          {item.food_item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer shadow-sm"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer shadow-sm"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[75px]">
                      <span className="text-base font-black text-slate-900 dark:text-slate-100">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bill Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Receipt className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                Bill Summary
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Item Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Partner Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">
                    FREE
                  </span>
                ) : (
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{deliveryFee.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Restaurant GST (5%)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{gst.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{platformFee.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 block">
                    To Pay
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Inclusive of all taxes & fees
                  </span>
                </div>
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                  ₹{toPay.toFixed(2)}
                </span>
              </div>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-xl shadow-orange-500/25 cursor-pointer py-3.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe and Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
