"use client";

import React from "react";
import { ShieldCheck, Users, Store, ShoppingBag, AlertCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Admin Control Center
              </h1>
              <Badge variant="danger" size="sm">
                ADMIN
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Platform administration logged in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Platform Settings
            </Button>
            <Button variant="primary" size="sm">
              Export Reports
            </Button>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-sky-500 mt-0.5" />
          <div>
            <span className="font-bold block">Admin Authorization Verified</span>
            <span className="text-xs text-sky-700 dark:text-sky-400 block mt-0.5">
              Admin access is restricted to verified administrators. Full analytics dashboards, restaurant verification lists, and user oversight will be connected in future milestones.
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Users
              </span>
              <Users className="w-4 h-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">1,240</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Customers & Sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Restaurants
              </span>
              <Store className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">85</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">72 verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Orders
              </span>
              <ShoppingBag className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">5,420</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Platform wide</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                System Health
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <Badge variant="success" size="sm">
                All Systems Operational
              </Badge>
              <p className="text-xs text-slate-500 font-medium mt-2">FastAPI + PostgreSQL</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
