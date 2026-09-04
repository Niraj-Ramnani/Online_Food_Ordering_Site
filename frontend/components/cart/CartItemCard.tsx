import React from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemCardProps) {
  const { food_item, quantity, item_total } = item;

  const displayImage =
    food_item.image_url ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80";

  const formattedUnitPrice =
    typeof food_item.price === "number"
      ? food_item.price.toFixed(2)
      : parseFloat(food_item.price || "0").toFixed(2);

  const formattedItemTotal =
    typeof item_total === "number"
      ? item_total.toFixed(2)
      : parseFloat(item_total || "0").toFixed(2);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm gap-4 transition-all">
      {/* Left: Food Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <Image
            src={displayImage}
            alt={food_item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
            {food_item.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ₹{formattedUnitPrice} each • {food_item.category}
          </p>
        </div>
      </div>

      {/* Right: Quantity Controls & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Quantity Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateQuantity(quantity - 1)}
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Decrease quantity"
          >
            {quantity === 1 ? (
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
            {quantity}
          </span>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateQuantity(quantity + 1)}
            className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[70px]">
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            ₹{formattedItemTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
