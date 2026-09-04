"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { OrderStatus } from "@/types/order";
import { formatStatusLabel, getStatusBadgeVariant } from "@/components/orders/OrderCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  Search,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, isLoading, error, fetchOrders } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.restaurant?.name &&
        order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Platform Orders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor and review all orders placed across the platform
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, restaurant, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm">Loading platform orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No orders matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Restaurant</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Delivery Address</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => {
                  const formattedDate = new Date(
                    order.created_at
                  ).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-lg text-xs">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                        {order.restaurant?.name || "Restaurant"}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-slate-100">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {order.delivery_address}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {formattedDate}
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
