"use client";

import React from "react";
import Link from "next/link";
import { PackageCheck, ShoppingBag, Store } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerOrdersPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome back, {user?.name}! Here are your recent food deliveries.
            </p>
          </div>
          <Badge variant="info">CUSTOMER</Badge>
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Orders Area (Connected in Milestone 5)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Your customer authentication is working properly. Real-time live order tracking and history will be connected in Milestone 5.
          </p>
          <div className="pt-2">
            <Link href="/#restaurants">
              <Button variant="primary" size="md">
                Browse Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
