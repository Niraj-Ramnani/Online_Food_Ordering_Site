"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FoodItem } from "@/types";

interface FoodManagementCardProps {
  foodItem: FoodItem;
  onEdit: (foodItem: FoodItem) => void;
  onDelete: (id: number) => Promise<void>;
  onToggleAvailability: (id: number, isAvailable: boolean) => Promise<void>;
}

export function FoodManagementCard({
  foodItem,
  onEdit,
  onDelete,
  onToggleAvailability,
}: FoodManagementCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayImage =
    foodItem.image_url ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80";

  const formattedPrice =
    typeof foodItem.price === "number"
      ? foodItem.price.toFixed(2)
      : parseFloat(foodItem.price || "0").toFixed(2);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleAvailability(foodItem.id, !foodItem.is_available);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${foodItem.name}" from your menu?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(foodItem.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all text-left">
      {/* Left Column: Photo & Details */}
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <Image
            src={displayImage}
            alt={foodItem.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              {foodItem.name}
            </h4>
            <Badge variant="orange" size="sm">
              {foodItem.category}
            </Badge>
          </div>

          <p className="text-sm font-black text-slate-900 dark:text-white">
            ₹{formattedPrice}
          </p>

          {foodItem.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md">
              {foodItem.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Availability & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Availability Toggle Pill */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            foodItem.is_available
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
          }`}
          title="Click to toggle availability"
        >
          {foodItem.is_available ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Sold Out</span>
            </>
          )}
        </button>

        {/* Edit Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(foodItem)}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          className="text-xs h-8"
        >
          Edit
        </Button>

        {/* Delete Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          isLoading={isDeleting}
          onClick={handleDelete}
          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
          className="text-xs h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
