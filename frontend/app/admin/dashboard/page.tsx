"use client";

import React from "react";
import { ShieldCheck, Users, Store, Package } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-rose-500" />
              Admin Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Logged in as Administrator: {user?.email}
            </p>
          </div>
          <Badge variant="danger">ADMINISTRATOR</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Platform Users
            </h4>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              User Management
            </p>
            <p className="text-xs text-slate-400">Connected in Admin Milestone</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Restaurant Verifications
            </h4>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              Verification Queue
            </p>
            <p className="text-xs text-slate-400">Connected in Admin Milestone</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Platform Orders
            </h4>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              All Orders
            </p>
            <p className="text-xs text-slate-400">Connected in Admin Milestone</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
