"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit2,
  MapPin,
  Plus,
  ShieldCheck,
  Store,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SellerNavTabs } from "@/components/seller/SellerNavTabs";
import { RestaurantStatusCard } from "@/components/seller/RestaurantStatusCard";
import { RestaurantForm } from "@/components/seller/RestaurantForm";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useSellerRestaurant } from "@/hooks/useSellerRestaurant";
import { CreateRestaurantRequest, UpdateRestaurantRequest } from "@/types";

export default function SellerRestaurantPage() {
  const {
    restaurant,
    isLoading,
    createRestaurant,
    updateRestaurant,
    toggleStatus,
  } = useSellerRestaurant();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayCover =
    restaurant?.image_url ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80";

  return (
    <ProtectedRoute allowedRoles={["SELLER"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 text-left">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Store className="w-7 h-7 text-orange-500" />
              Restaurant Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your restaurant information, cover imagery, and live status
            </p>
          </div>

          {restaurant && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit Restaurant Info
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <SellerNavTabs />

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading restaurant information..." />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Empty State: No Restaurant */}
            {!restaurant ? (
              <div className="max-w-lg mx-auto py-16 text-center space-y-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Store className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    No restaurant registered yet
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Create your restaurant profile to showcase your menu, set your address, and start receiving customer orders online.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="w-full font-bold"
                  >
                    Register Your Restaurant
                  </Button>
                </div>
              </div>
            ) : (
              /* Restaurant Profile Details */
              <div className="space-y-6">
                {/* Live Status Toggle Card */}
                <RestaurantStatusCard
                  restaurant={restaurant}
                  onToggleStatus={async (isOpen) => {
                    await toggleStatus(isOpen);
                  }}
                />

                {/* Profile Card */}
                <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  {/* Cover Photo */}
                  <div className="relative w-full h-56 sm:h-72 bg-slate-900">
                    <Image
                      src={displayCover}
                      alt={restaurant.name}
                      fill
                      sizes="100vw"
                      className="object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    <div className="absolute top-4 right-4">
                      {restaurant.is_verified ? (
                        <div className="flex items-center gap-1.5 bg-white/95 text-sky-600 font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                          <ShieldCheck className="w-4 h-4 fill-sky-600 text-white" />
                          <span>Verified Partner</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                          <span>Pending Admin Verification</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h2 className="text-2xl sm:text-3xl font-black">
                        {restaurant.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>{restaurant.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Profile Body */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        About Restaurant
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {restaurant.description ||
                          "No description added yet. Click 'Edit Restaurant Info' to add details about your restaurant cuisine, specialty dishes, and kitchen standards."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Restaurant ID
                        </span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                          #{restaurant.id}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Operating Status
                        </span>
                        <span
                          className={`text-base font-black mt-1 block ${
                            restaurant.is_open
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {restaurant.is_open ? "Open Now" : "Closed"}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Public Menu Page
                        </span>
                        <Link
                          href={`/#restaurants`}
                          className="text-xs font-bold text-orange-600 hover:underline mt-2 inline-flex items-center gap-1"
                        >
                          <span>Preview Customer Page →</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <RestaurantForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            if (restaurant) {
              await updateRestaurant(data as UpdateRestaurantRequest);
            } else {
              await createRestaurant(data as CreateRestaurantRequest);
            }
          }}
          initialData={restaurant}
        />
      </div>
    </ProtectedRoute>
  );
}
