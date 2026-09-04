"use client";

import React from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Store, Calendar, ArrowRight, Package } from "lucide-react";

interface OrderCardProps {
  order: Order;
  viewDetailsHref?: string;
}

export function getStatusBadgeVariant(
  status: OrderStatus
): "orange" | "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "ACCEPTED":
    case "PREPARING":
    case "READY":
    case "OUT_FOR_DELIVERY":
      return "orange";
    case "PLACED":
      return "warning";
    case "CANCELLED":
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export function formatStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PLACED":
      return "Order Placed";
    case "ACCEPTED":
      return "Accepted";
    case "PREPARING":
      return "Preparing";
    case "READY":
      return "Ready for Pickup";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function OrderCard({ order, viewDetailsHref }: OrderCardProps) {
  const targetHref = viewDetailsHref || `/orders/${order.id}`;
  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalItemsCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full">
              Order #{order.id}
            </span>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {formatStatusLabel(order.status)}
            </Badge>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-slate-400" />
            {order.restaurant?.name || "Restaurant"}
          </h3>
        </div>

        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="py-3.5">
        <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {order.items.map((item, idx) => (
            <span key={item.id}>
              {item.food_name} × {item.quantity}
              {idx < order.items.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <Package className="w-3.5 h-3.5" />
          <span>{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Amount
          </span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            ₹{Number(order.total_amount).toFixed(2)}
          </p>
        </div>

        <Link href={targetHref}>
          <Button variant="outline" size="sm" className="group">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
