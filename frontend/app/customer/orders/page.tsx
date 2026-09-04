"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CustomerOrdersPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as {user?.name} ({user?.email})
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="text-center py-12 px-4">
          <CardContent className="space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No orders placed yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our top-rated restaurants and order your first delicious meal.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md">
                  Explore Restaurants
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
