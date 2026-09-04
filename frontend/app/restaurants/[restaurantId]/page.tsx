"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { restaurantService } from "@/services/restaurantService";
import { Restaurant } from "@/types/restaurant";
import { FoodItem } from "@/types/food";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { FoodCard } from "@/components/food/FoodCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Store,
  Clock,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface RestaurantDetailsPageProps {
  params: Promise<{ restaurantId: string }>;
}

export default function RestaurantDetailsPage({
  params,
}: RestaurantDetailsPageProps) {
  const resolvedParams = use(params);
  const restaurantId = Number(resolvedParams.restaurantId);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(
    null
  );
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [rData, fData] = await Promise.all([
          restaurantService.getPublicRestaurant(restaurantId),
          restaurantService.getRestaurantFoodItems(restaurantId),
        ]);
        setRestaurant(rData);
        setFoodItems(fData);
      } catch (err: any) {
        setError(err.message || "Failed to load restaurant menu.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [restaurantId]);

  const handleAddToCart = async (item: FoodItem) => {
    setCartSuccessMessage(null);
    setCartErrorMessage(null);
    try {
      await addToCart(item.id, 1, {
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        restaurantName: restaurant?.name,
      });
    } catch (err: any) {
      if (err?.status !== 409) {
        setCartErrorMessage(err.message || "Failed to add item to cart.");
        setTimeout(() => setCartErrorMessage(null), 4000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-medium">Loading restaurant menu...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Restaurant Not Found
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          {error || "The requested restaurant is unavailable or unverified."}
        </p>
        <Link href="/">
          <Button variant="primary">Browse Other Restaurants</Button>
        </Link>
      </div>
    );
  }

  const categories = [
    "All",
    ...Array.from(new Set(foodItems.map((f) => f.category))).filter(Boolean),
  ];

  const filteredFoods =
    selectedCategory === "All"
      ? foodItems
      : foodItems.filter((f) => f.category === selectedCategory);

  const displayImage =
    restaurant.image_url ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-slate-900 overflow-hidden">
        <Image
          src={displayImage}
          alt={restaurant.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Restaurants</span>
          </Link>
        </div>

        {/* Restaurant Header Info Overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-10 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {restaurant.is_open ? (
                <Badge
                  variant="success"
                  size="sm"
                  className="bg-emerald-500 text-white font-bold border-0 shadow-sm"
                >
                  Open Now
                </Badge>
              ) : (
                <Badge
                  variant="danger"
                  size="sm"
                  className="bg-red-500 text-white font-bold border-0 shadow-sm"
                >
                  Closed for Orders
                </Badge>
              )}

              {restaurant.is_verified && (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-sky-700 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 fill-sky-600 text-white" />
                  <span>Verified Partner</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {restaurant.name}
            </h1>

            {restaurant.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{restaurant.address}</span>
            </div>
          </div>

          <Link href="/cart">
            <Button
              variant="primary"
              size="md"
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shrink-0"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              <span>View Cart</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Cart Feedback Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {cartSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{cartSuccessMessage}</span>
          </div>
        )}

        {cartErrorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{cartErrorMessage}</span>
          </div>
        )}
      </div>

      {/* Main Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items Grid */}
        {filteredFoods.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No food items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                foodItem={{
                  ...food,
                  restaurant_name: restaurant.name,
                }}
                onAddToCart={() => handleAddToCart(food)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
