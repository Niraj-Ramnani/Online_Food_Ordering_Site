"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Store,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Shield,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { stats, isLoading, error, fetchDashboard } = useAdmin();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quick overview of platform users, restaurants, and order activities
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboard()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      {isLoading && !stats ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm">Loading platform statistics...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-3">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => fetchDashboard()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatsCard
              title="Total Users"
              value={stats?.total_users ?? 0}
              icon={Users}
              subtitle={`${stats?.total_sellers ?? 0} sellers registered`}
            />
            <AdminStatsCard
              title="Restaurants"
              value={stats?.total_restaurants ?? 0}
              icon={Store}
              subtitle={`${stats?.verified_restaurants ?? 0} verified`}
            />
            <AdminStatsCard
              title="Total Orders"
              value={stats?.total_orders ?? 0}
              icon={ShoppingBag}
              subtitle={`${stats?.completed_orders ?? 0} completed`}
            />
            <AdminStatsCard
              title="Pending Orders"
              value={stats?.pending_orders ?? 0}
              icon={Clock}
              subtitle="Active or awaiting confirmation"
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Quick Management Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/admin/users">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Manage Users
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    View registered customers and sellers, activate or deactivate accounts.
                  </p>
                </div>
              </Link>

              <Link href="/admin/restaurants">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Store className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Manage Restaurants
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Review and verify partner restaurants, open or close listings.
                  </p>
                </div>
              </Link>

              <Link href="/admin/orders">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Platform Orders
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Browse all food orders across restaurants and monitor live statuses.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
