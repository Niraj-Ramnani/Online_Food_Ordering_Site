"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Loader2, Plus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FoodItem } from "@/types";
import { useCart } from "@/hooks/useCart";

export interface FoodCardProps {
  foodItem: FoodItem;
  onAddToCart?: () => void;
}

export function FoodCard({ foodItem, onAddToCart }: FoodCardProps) {
  const {
    name,
    restaurant_name,
    category = "Special",
    description,
    price,
    image_url,
    is_available = true,
    rating = 4.8,
    is_veg = true,
  } = foodItem;

  const { addToCart, isUpdating } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const displayImage =
    image_url ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";

  const formattedPrice =
    typeof price === "number" ? price.toFixed(2) : parseFloat(price || "0").toFixed(2);

  const handleAddClick = async () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }

    try {
      const success = await addToCart(foodItem, 1);
      if (success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1200);
      }
    } catch {
      // Handled via CartContext / alerts
    }
  };

  return (
    <Card
      isHoverable
      className="group flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
    >
      {/* Food Photo Container */}
      <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator */}
          <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
            <div
              className={`w-3.5 h-3.5 border-2 ${
                is_veg ? "border-emerald-600" : "border-rose-600"
              } flex items-center justify-center`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  is_veg ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
            </div>
          </div>

          {category && (
            <Badge
              variant="orange"
              size="sm"
              className="bg-orange-500 text-white font-bold text-[10px] border-0 shadow-sm"
            >
              {category}
            </Badge>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Food Details */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-orange-500 transition-colors line-clamp-1">
            {name}
          </h4>

          {restaurant_name && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              by {restaurant_name}
            </p>
          )}

          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Price
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{formattedPrice}
            </span>
          </div>

          <button
            type="button"
            disabled={!is_available}
            onClick={handleAddClick}
            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
              is_available
                ? justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20 active:scale-95"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {is_available ? (
              justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )
            ) : (
              <span>Sold Out</span>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
