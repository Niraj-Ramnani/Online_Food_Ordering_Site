"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { sellerOrderService } from "@/services/sellerOrderService";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { formatStatusLabel, getStatusBadgeVariant } from "@/components/orders/OrderCard";
import { OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Store,
  MapPin,
  FileText,
  CreditCard,
  Package,
  Calendar,
  Loader2,
  XCircle,
  CheckCircle2,
  ChefHat,
  Bike,
} from "lucide-react";

interface OrderTrackingPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.orderId);
  const searchParams = useSearchParams();
  const paymentJustConfirmed = searchParams.get("payment") === "success";

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentOrder: order, isLoading, error, cancelOrder, refreshOrder } =
    useOrders(orderId);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isSellerOrAdmin = user?.role === "SELLER" || user?.role === "ADMIN";

  const handleSellerStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdatingStatus(true);
    setCancelError(null);
    try {
      if (newStatus === "ACCEPTED") {
        await sellerOrderService.acceptOrder(order.id);
      } else if (newStatus === "REJECTED") {
        await sellerOrderService.rejectOrder(order.id);
      } else {
        await sellerOrderService.updateOrderStatus(order.id, newStatus);
      }
      await refreshOrder();
    } catch (err: any) {
      setCancelError(err.message || "Failed to update order status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(order.id);
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isAuthLoading || (isLoading && !order)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Order Not Found
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          {error || "The requested order could not be found or you do not have permission to view it."}
        </p>
        <Link href="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = order.status === "PLACED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-xl text-slate-600 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Order #{order.id}
              </h1>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {formatStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200"
          >
            {isCancelling ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <XCircle className="w-4 h-4 mr-1 text-red-500" />
            )}
            Cancel Order
          </Button>
        )}
      </div>

      {/* Payment success banner if arrived from checkout */}
      {paymentJustConfirmed && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Payment Successful!</h4>
            <p className="text-xs mt-0.5">
              Your order has been confirmed and sent to {order.restaurant.name}.
            </p>
          </div>
        </div>
      )}

      {cancelError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {cancelError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Order Tracking Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Live Order Milestone
              </h2>
              {isSellerOrAdmin && (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
                  Seller / Admin Controls Active
                </span>
              )}
            </div>

            {/* Interactive Timeline */}
            <OrderStatusTimeline
              status={order.status}
              isInteractive={isSellerOrAdmin}
              onStatusChange={handleSellerStatusChange}
            />

            {/* Seller Action Controls */}
            {isSellerOrAdmin && !["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status) && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Quick Advance Order Milestone:
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {order.status === "PLACED" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleSellerStatusChange("ACCEPTED")}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleSellerStatusChange("REJECTED")}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <XCircle className="w-4 h-4 mr-1.5 text-red-500" />
                        Reject Order
                      </Button>
                    </>
                  )}
                  {order.status === "ACCEPTED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleSellerStatusChange("PREPARING")}
                    >
                      {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <ChefHat className="w-4 h-4 mr-1.5" />}
                      Start Preparing in Kitchen
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleSellerStatusChange("READY")}
                    >
                      {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Package className="w-4 h-4 mr-1.5" />}
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {order.status === "READY" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleSellerStatusChange("OUT_FOR_DELIVERY")}
                    >
                      {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Bike className="w-4 h-4 mr-1.5" />}
                      Dispatch (Out for Delivery)
                    </Button>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleSellerStatusChange("DELIVERED")}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                      Mark Order Delivered
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Restaurant Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {order.restaurant.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.restaurant.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Breakdown & Delivery Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Items Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Package className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Items Ordered
              </h3>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 mb-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm pt-2.5 first:pt-0"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.food_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{Number(item.unit_price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{Number(item.item_total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Total Paid
              </span>
              <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                ₹{Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address & Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                Delivery Address
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {order.delivery_address}
              </p>
            </div>

            {order.description && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Delivery Instructions
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  &ldquo;{order.description}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
