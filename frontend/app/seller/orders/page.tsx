"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { Order, OrderStatus } from "@/types/order";
import { formatStatusLabel, getStatusBadgeVariant } from "@/components/orders/OrderCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Package,
  Bike,
  Loader2,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

type FilterTab = "ALL" | "NEW" | "IN_PROGRESS" | "COMPLETED";

export default function SellerOrdersPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    orders,
    isLoading,
    error,
    refreshOrders,
    updateStatus,
    acceptOrder,
    rejectOrder,
  } = useSellerOrders();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Role check
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "SELLER")) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Seller Access Required
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          This portal is reserved for registered restaurant sellers.
        </p>
        <Link href="/login">
          <Button variant="primary">Log In as Seller</Button>
        </Link>
      </div>
    );
  }

  const handleAction = async (
    orderId: number,
    actionFn: () => Promise<Order>
  ) => {
    setActionLoadingId(orderId);
    setActionError(null);
    try {
      await actionFn();
    } catch (err: any) {
      setActionError(err.message || "Failed to update order status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "NEW") return order.status === "PLACED";
    if (activeTab === "IN_PROGRESS")
      return [
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
      ].includes(order.status);
    if (activeTab === "COMPLETED")
      return ["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status);
    return true;
  });

  const newOrdersCount = orders.filter((o) => o.status === "PLACED").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Restaurant Orders
            </h1>
            {newOrdersCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white animate-pulse">
                {newOrdersCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage incoming live orders and update fulfillment status in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/dashboard">
            <Button variant="outline" size="sm">
              <Store className="w-4 h-4 mr-1.5" />
              Seller Dashboard
            </Button>
          </Link>
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
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {actionError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto">
        {[
          { key: "ALL", label: "All Orders", count: orders.length },
          {
            key: "NEW",
            label: "New Orders",
            count: newOrdersCount,
            highlight: newOrdersCount > 0,
          },
          {
            key: "IN_PROGRESS",
            label: "In Progress",
            count: orders.filter((o) =>
              ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(
                o.status
              )
            ).length,
          },
          {
            key: "COMPLETED",
            label: "Completed & Past",
            count: orders.filter((o) =>
              ["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status)
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as FilterTab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : tab.highlight
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm font-medium">Loading restaurant orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No orders found in this tab
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Incoming customer orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isActing = actionLoadingId === order.id;
            const formattedDate = new Date(order.created_at).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                {/* Top bar: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-xl">
                      Order #{order.id}
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Items & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
                  {/* Items list */}
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ordered Items
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.food_name} × {item.quantity}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            ₹{Number(item.item_total).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Note */}
                  <div className="md:col-span-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        Delivery Location
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {order.delivery_address}
                      </p>
                    </div>

                    {order.description && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-orange-500" />
                          Instructions
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">
                          &ldquo;{order.description}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Amount & Action Transition Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Total Order Amount</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Live Milestone
                      </Button>
                    </Link>

                    {order.status === "PLACED" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleAction(order.id, () => acceptOrder(order.id))
                          }
                          disabled={isActing}
                        >
                          {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                          )}
                          Accept Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAction(order.id, () => rejectOrder(order.id))
                          }
                          disabled={isActing}
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {order.status === "ACCEPTED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleAction(order.id, () =>
                            updateStatus(order.id, "PREPARING")
                          )
                        }
                        disabled={isActing}
                      >
                        {isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <ChefHat className="w-4 h-4 mr-1" />
                        )}
                        Mark Preparing
                      </Button>
                    )}

                    {order.status === "PREPARING" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleAction(order.id, () =>
                            updateStatus(order.id, "READY")
                          )
                        }
                        disabled={isActing}
                      >
                        {isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Package className="w-4 h-4 mr-1" />
                        )}
                        Mark Ready for Delivery
                      </Button>
                    )}

                    {order.status === "READY" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleAction(order.id, () =>
                            updateStatus(order.id, "OUT_FOR_DELIVERY")
                          )
                        }
                        disabled={isActing}
                      >
                        {isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Bike className="w-4 h-4 mr-1" />
                        )}
                        Mark Out for Delivery
                      </Button>
                    )}

                    {order.status === "OUT_FOR_DELIVERY" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleAction(order.id, () =>
                            updateStatus(order.id, "DELIVERED")
                          )
                        }
                        disabled={isActing}
                      >
                        {isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                        )}
                        Mark Delivered
                      </Button>
                    )}

                    {["DELIVERED", "CANCELLED", "REJECTED"].includes(
                      order.status
                    ) && (
                      <span className="text-xs font-semibold text-slate-400">
                        Order Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
