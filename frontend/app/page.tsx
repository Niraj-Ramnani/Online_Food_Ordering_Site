"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Flame,
  Search,
  Star,
  UtensilsCrossed,
  Store,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { FoodCard } from "@/components/food/FoodCard";
import { Restaurant, FoodItem } from "@/types";
import { restaurantService } from "@/services/restaurantService";
import { useCart } from "@/hooks/useCart";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const { addToCart } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync state if URL query changes
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery !== null) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await restaurantService.getPublicRestaurants();
        setRestaurants(data);

        // Fetch sample food items from top restaurants
        if (data.length > 0) {
          const foodPromises = data
            .slice(0, 4)
            .map((r) =>
              restaurantService
                .getRestaurantFoodItems(r.id)
                .then((items) =>
                  items.slice(0, 2).map((item) => ({
                    ...item,
                    restaurant_name: r.name,
                  }))
                )
                .catch(() => [])
            );

          const foodResults = await Promise.all(foodPromises);
          setPopularDishes(foodResults.flat());
        }
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = async (food: FoodItem) => {
    try {
      await addToCart(food.id, 1, {
        name: food.name,
        price: Number(food.price),
        image_url: food.image_url,
        restaurantName: food.restaurant_name,
      });
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pt-8 sm:pt-16 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Delicious food, <br />
                delivered <span className="text-orange-500">fresh & hot</span> to your door.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                Discover top verified restaurants, authentic kitchens, and popular food spots in Jaipur with instant ordering.
              </p>

              {/* Search Bar Input */}
              <div className="max-w-xl mx-auto lg:mx-0 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-orange-500/5 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, dishes, or areas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const el = document.getElementById("restaurants");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto font-bold shrink-0"
                >
                  Find Food
                </Button>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-80 sm:h-96 lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                <Image
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80"
                  alt="Delicious gourmet food spread"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Perk Pill */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-white/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      4.9★ Top Rated Eats
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Over 10,000+ happy foodies served in Jaipur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOP RESTAURANTS SECTION */}
      <section id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Verified Kitchens</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Featured Restaurants
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {filteredRestaurants.length} partner eateries in your area
            </p>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
            <p className="text-sm">Loading verified restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No restaurants found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => router.push(`/restaurants/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. POPULAR DISHES SECTION */}
      {popularDishes.length > 0 && (
        <section id="dishes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Popular Dishes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Freshly prepared cravings available right now
              </p>
            </div>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.map((food) => (
              <FoodCard
                key={food.id}
                foodItem={food}
                onAddToCart={() => handleAddToCart(food)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. PROMOTIONAL OFFER BANNER */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 sm:p-12 text-white shadow-2xl shadow-orange-500/20">
          <div className="relative z-10 max-w-xl space-y-4">
            <Badge variant="orange" size="sm" className="bg-white text-orange-600 font-bold border-0">
              SPECIAL WELCOME OFFER
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Get 50% Off On Your Very First Order!
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
              Use promo code <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">QUICK50</span> at checkout to enjoy half-price on top restaurants in Jaipur.
            </p>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById("restaurants");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg cursor-pointer"
              >
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
