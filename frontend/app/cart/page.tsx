"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Store, Utensils } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartConflictModal } from "@/components/cart/CartConflictModal";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const {
    cart,
    isLoading,
    isUpdating,
    updateQuantity,
    removeItem,
    clearCart,
    totalItemsCount,
  } = useCart();

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-orange-500" />
              Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {!isEmpty
                ? `${totalItemsCount} ${totalItemsCount === 1 ? "dish" : "dishes"} from ${cart.restaurant?.name || "Restaurant"}`
                : "Your bag is currently empty"}
            </p>
          </div>

          <Link href="/restaurants">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Add More Items
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading your delicious cart..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <div className="max-w-md mx-auto py-16 text-center space-y-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Good food is always cooking! Discover top restaurants and add your favorite dishes to start an order.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/restaurants">
                <Button variant="primary" size="lg" className="w-full font-bold">
                  Explore Restaurants
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Cart Contents */}
        {!isLoading && !isEmpty && cart && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Restaurant Header */}
              {cart.restaurant && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 block">
                        Ordering From
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cart.restaurant.name}
                      </h3>
                    </div>
                  </div>

                  <Link href={`/restaurants/${cart.restaurant.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-orange-600 font-bold">
                      View Menu
                    </Button>
                  </Link>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    isUpdating={isUpdating}
                    onUpdateQuantity={(newQty) => updateQuantity(item.id, newQty)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-5 sticky top-24">
              <CartSummary
                cart={cart}
                onClearCart={clearCart}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        )}

        {/* Conflict Modal */}
        <CartConflictModal />
      </div>
    </ProtectedRoute>
  );
}
