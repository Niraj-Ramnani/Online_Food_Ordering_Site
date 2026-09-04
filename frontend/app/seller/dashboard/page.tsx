"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SellerNavTabs } from "@/components/seller/SellerNavTabs";
import { RestaurantStatusCard } from "@/components/seller/RestaurantStatusCard";
import { RestaurantForm } from "@/components/seller/RestaurantForm";
import { FoodForm } from "@/components/seller/FoodForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import { useSellerRestaurant } from "@/hooks/useSellerRestaurant";
import { useSellerFood } from "@/hooks/useSellerFood";
import { CreateFoodItemRequest, CreateRestaurantRequest } from "@/types";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const {
    restaurant,
    isLoading: isRestLoading,
    createRestaurant,
    toggleStatus,
  } = useSellerRestaurant();
  const { foodItems, isLoading: isFoodLoading, createFood } = useSellerFood();

  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);

  const isLoading = isRestLoading || isFoodLoading;

  const totalDishes = foodItems.length;
  const availableDishes = foodItems.filter((f) => f.is_available).length;
  const outOfStockDishes = totalDishes - availableDishes;

  return (
    <ProtectedRoute allowedRoles={["SELLER"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Seller Dashboard
              </h1>
              <Badge variant="orange" size="sm">
                SELLER
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {restaurant ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsFoodModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Food Item
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsRestaurantModalOpen(true)}
                leftIcon={<Store className="w-4 h-4" />}
              >
                Register Restaurant
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <SellerNavTabs />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading your restaurant business stats..." />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Restaurant Profile Notice / Status */}
            {restaurant ? (
              <RestaurantStatusCard
                restaurant={restaurant}
                onToggleStatus={async (isOpen) => {
                  await toggleStatus(isOpen);
                }}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Started</span>
                  </div>
                  <h3 className="text-2xl font-black">
                    You haven&apos;t registered your restaurant yet!
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                    Create your restaurant profile to showcase your menu, set your operating hours, and start receiving online customer orders.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsRestaurantModalOpen(true)}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold shrink-0 shadow-lg"
                >
                  Register Restaurant Now
                </Button>
              </div>
            )}

            {/* Business Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Menu Items
                  </span>
                  <Utensils className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalDishes}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Listed on public menu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Available for Order
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {availableDishes}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Ready in kitchen
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sold Out / Disabled
                  </span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {outOfStockDishes}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Temporarily unavailable
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Partner Status
                  </span>
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  {restaurant?.is_verified ? (
                    <Badge variant="success" size="sm">
                      Verified Partner
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Pending Verification
                    </Badge>
                  )}
                  <p className="text-xs text-slate-500 font-medium mt-2">
                    {restaurant ? "FastAPI Backend" : "Not registered"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Link href="/seller/restaurant" className="block group">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-orange-500/50 hover:shadow-lg transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                      Manage Restaurant Profile
                    </h3>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Update your restaurant name, address, cover photo, description, and order acceptance status.
                  </p>
                </div>
              </Link>

              <Link href="/seller/food" className="block group">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-orange-500/50 hover:shadow-lg transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      Manage Menu & Dishes
                    </h3>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Add new delicious dishes, adjust prices in ₹, toggle availability, and update dish photos.
                  </p>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* Modals */}
        <RestaurantForm
          isOpen={isRestaurantModalOpen}
          onClose={() => setIsRestaurantModalOpen(false)}
          onSubmit={async (data) => {
            await createRestaurant(data as CreateRestaurantRequest);
          }}
          initialData={restaurant}
        />

        <FoodForm
          isOpen={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          onSubmit={async (data) => {
            await createFood(data as CreateFoodItemRequest);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
