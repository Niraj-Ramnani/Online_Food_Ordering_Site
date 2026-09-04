"use client";

import React, { useState } from "react";
import { OrderStatus } from "@/types/order";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  Bike,
  Home,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
  isInteractive?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => Promise<void> | void;
}

interface Step {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  actionText?: string;
}

const ORDER_STEPS: Step[] = [
  {
    key: "PLACED",
    label: "Order Placed",
    description: "Waiting for restaurant confirmation",
    icon: Clock,
    actionText: "Accept Order",
  },
  {
    key: "ACCEPTED",
    label: "Accepted",
    description: "Restaurant has accepted the order",
    icon: CheckCircle2,
    actionText: "Mark Preparing",
  },
  {
    key: "PREPARING",
    label: "Preparing in Kitchen",
    description: "Chef is cooking fresh food",
    icon: ChefHat,
    actionText: "Mark Ready",
  },
  {
    key: "READY",
    label: "Ready for Pickup",
    description: "Food is packed and ready",
    icon: Package,
    actionText: "Dispatch",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Delivery partner is on the way",
    icon: Bike,
    actionText: "Mark Delivered",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Order completed successfully",
    icon: Home,
  },
];

export function OrderStatusTimeline({
  status,
  className = "",
  isInteractive = false,
  onStatusChange,
}: OrderStatusTimelineProps) {
  const [loadingStatus, setLoadingStatus] = useState<OrderStatus | null>(null);

  const isCancelled = status === "CANCELLED";
  const isRejected = status === "REJECTED";

  // If order was cancelled or rejected, show appropriate alert card
  if (isCancelled || isRejected) {
    return (
      <div
        className={`p-6 rounded-3xl border ${
          isCancelled
            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
        } ${className}`}
      >
        <div className="flex items-center gap-3.5">
          {isCancelled ? (
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          )}
          <div>
            <h4 className="text-lg font-black tracking-tight">
              {isCancelled ? "Order Cancelled" : "Order Rejected"}
            </h4>
            <p className="text-xs sm:text-sm mt-0.5 opacity-90 leading-relaxed">
              {isCancelled
                ? "This order was cancelled. If amount was deducted, it will be refunded."
                : "The restaurant was unable to accept this order."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine current active step index
  const stepIndexMap: Record<OrderStatus, number> = {
    PLACED: 0,
    ACCEPTED: 1,
    PREPARING: 2,
    READY: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
    CANCELLED: -1,
    REJECTED: -1,
  };

  const currentStepIndex = stepIndexMap[status] ?? 0;

  const handleStepClick = async (targetStatus: OrderStatus) => {
    if (!isInteractive || !onStatusChange) return;
    setLoadingStatus(targetStatus);
    try {
      await onStatusChange(targetStatus);
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className={`w-full py-2 ${className}`}>
      {isInteractive && (
        <div className="mb-4 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs text-orange-900 dark:text-orange-200 flex items-center justify-between gap-2 font-semibold">
          <span>⚡ Click any milestone step below to update order progress</span>
        </div>
      )}

      <div className="relative">
        {/* Step Items */}
        <div className="space-y-6 md:space-y-7 relative">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;
            const isNextStep = index === currentStepIndex + 1;
            const Icon = step.icon;
            const isLoadingThis = loadingStatus === step.key;

            return (
              <div
                key={step.key}
                className={`flex items-start gap-4 relative group transition-all rounded-2xl p-2 -mx-2 ${
                  isInteractive && (isUpcoming || isCurrent)
                    ? "hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                    : ""
                }`}
                onClick={() => {
                  if (isInteractive && !isCompleted) {
                    handleStepClick(step.key);
                  }
                }}
              >
                {/* Vertical connecting line */}
                {index < ORDER_STEPS.length - 1 && (
                  <div
                    className={`absolute left-7 top-10 -bottom-6 w-0.5 transition-colors ${
                      index < currentStepIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}

                {/* Step Circle / Icon */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all shadow-sm ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : isCurrent
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-100 dark:ring-orange-950/60 scale-105"
                      : isInteractive && isNextStep
                      ? "bg-orange-100 dark:bg-orange-950/60 text-orange-600 border border-orange-300 dark:border-orange-800 group-hover:scale-110"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isLoadingThis ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-black ${
                        isCurrent
                          ? "text-orange-600 dark:text-orange-400"
                          : isCompleted
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step.label}
                    </h4>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 animate-pulse">
                          In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </span>
                      )}
                      {isInteractive && isNextStep && (
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-md flex items-center gap-1 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <span>Next Step</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs mt-0.5 ${
                      isUpcoming
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
