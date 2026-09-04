"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Loader2, ArrowLeft } from "lucide-react";

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { orders, isLoading, error, refreshOrders } = useOrders();

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Sign In Required
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Please log in to view your order history and live delivery tracking.
        </p>
        <Link href="/login">
          <Button variant="primary" className="w-full">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track active deliveries and view your past orders
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshOrders()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Content */}
      {isLoading && orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-3">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => refreshOrders()}>
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            No Orders Yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            You haven&apos;t placed any food orders yet. Explore top local restaurants and order now!
          </p>
          <Link href="/">
            <Button variant="primary">Explore Food</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
