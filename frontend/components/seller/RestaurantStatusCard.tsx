"use client";

import React, { useState } from "react";
import { CheckCircle2, PauseCircle, PlayCircle, ShieldCheck, Store } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Restaurant } from "@/types";

interface RestaurantStatusCardProps {
  restaurant: Restaurant;
  onToggleStatus: (isOpen: boolean) => Promise<void>;
}

export function RestaurantStatusCard({
  restaurant,
  onToggleStatus,
}: RestaurantStatusCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleStatus(!restaurant.is_open);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            restaurant.is_open
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          }`}
        >
          <Store className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {restaurant.name}
            </h3>
            {restaurant.is_verified && (
              <Badge variant="info" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                Verified Partner
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Live Status:</span>
            {restaurant.is_open ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Open • Accepting Orders</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Closed • Ordering Paused</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate max-w-md">{restaurant.address}</p>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          type="button"
          variant={restaurant.is_open ? "danger" : "primary"}
          size="md"
          isLoading={isUpdating}
          onClick={handleToggle}
          leftIcon={
            restaurant.is_open ? (
              <PauseCircle className="w-4 h-4" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )
          }
          className="w-full sm:w-auto font-bold"
        >
          {restaurant.is_open ? "Close Restaurant" : "Open Restaurant"}
        </Button>
      </div>
    </div>
  );
}
