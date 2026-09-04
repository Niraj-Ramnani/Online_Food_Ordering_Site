"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Power,
} from "lucide-react";

export default function AdminRestaurantsPage() {
  const {
    restaurants,
    isLoading,
    error,
    fetchRestaurants,
    verifyRestaurant,
    updateRestaurantStatus,
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleToggleVerification = async (
    restaurantId: number,
    currentVerified: boolean
  ) => {
    setActionLoadingId(restaurantId);
    try {
      await verifyRestaurant(restaurantId, !currentVerified);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleOpenStatus = async (
    restaurantId: number,
    currentOpen: boolean
  ) => {
    setActionLoadingId(restaurantId);
    try {
      await updateRestaurantStatus(restaurantId, !currentOpen);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisine_type &&
        r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Restaurant Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review partner restaurants, verify listings, and oversee operational status
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRestaurants()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search restaurants by name, address, cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading && restaurants.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm">Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No restaurants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Restaurant</th>
                  <th className="px-5 py-3.5">Cuisine / Phone</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRestaurants.map((restaurant) => {
                  const isActing = actionLoadingId === restaurant.id;

                  return (
                    <tr
                      key={restaurant.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {restaurant.name}
                          </p>
                          <p className="text-xs text-slate-400 max-w-xs truncate">
                            {restaurant.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {restaurant.cuisine_type || "Multi-Cuisine"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {restaurant.phone_number || "No contact"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {restaurant.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <ShieldCheck className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <ShieldAlert className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {restaurant.is_open ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={restaurant.is_verified ? "outline" : "primary"}
                            size="sm"
                            onClick={() =>
                              handleToggleVerification(
                                restaurant.id,
                                !!restaurant.is_verified
                              )
                            }
                            disabled={isActing}
                            className="text-xs"
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : restaurant.is_verified ? (
                              "Unverify"
                            ) : (
                              "Verify"
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleOpenStatus(
                                restaurant.id,
                                !!restaurant.is_open
                              )
                            }
                            disabled={isActing}
                            className="text-xs"
                          >
                            <Power className="w-3.5 h-3.5 mr-1" />
                            {restaurant.is_open ? "Close" : "Open"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
