"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { CardSkeleton } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { restaurantService } from "@/services/restaurantService";
import { Restaurant } from "@/types";

// Curated fallback data if backend is empty during testing
const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: "Mario's Authentic Pizzeria",
    address: "742 Evergreen Terrace, Little Italy",
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "Italian • Wood-fired Pizza",
    rating: 4.9,
    delivery_time: "20-30 min",
    price_range: "$$",
  },
  {
    id: 2,
    name: "The Gourmet Burger Lab",
    address: "128 Downtown Boulevard, Metro Hub",
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "American • Smash Burgers",
    rating: 4.8,
    delivery_time: "15-25 min",
    price_range: "$$",
  },
  {
    id: 3,
    name: "Royal Biryani & Kebabs",
    address: "45 Old Fort Road, Heritage District",
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "Indian • Hyderabadi Biryani",
    rating: 4.9,
    delivery_time: "30-40 min",
    price_range: "$$$",
  },
  {
    id: 4,
    name: "Tokyo Ramen & Sushi Bar",
    address: "88 Sakura Lane, Chinatown",
    image_url:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "Japanese • Ramen & Sushi",
    rating: 4.7,
    delivery_time: "25-35 min",
    price_range: "$$$",
  },
  {
    id: 5,
    name: "Green Garden Bowls & Salads",
    address: "21 Wellness Way, North Park",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "Healthy • Vegan Bowls",
    rating: 4.6,
    delivery_time: "15-20 min",
    price_range: "$$",
  },
  {
    id: 6,
    name: "Sweet Tooth Artisan Bakery",
    address: "310 Sugar Street, Baker's Square",
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    is_verified: true,
    is_open: true,
    cuisine: "Bakery • Cakes & Pastries",
    rating: 4.9,
    delivery_time: "20-30 min",
    price_range: "$$",
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Spots" },
  { id: "open", label: "Open Now" },
  { id: "top_rated", label: "Top Rated (4.8+)" },
  { id: "fast", label: "Fast Delivery (<25 min)" },
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      setIsLoading(true);
      try {
        const data = await restaurantService.getRestaurants();
        if (data && data.length > 0) {
          setRestaurants(data);
        } else {
          setRestaurants(FALLBACK_RESTAURANTS);
        }
      } catch {
        setRestaurants(FALLBACK_RESTAURANTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  // Filter and Search logic
  const filteredRestaurants = restaurants.filter((r) => {
    // 1. Search query filter
    const matchesSearch =
      !searchQuery.trim() ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter tabs
    if (activeFilter === "open" && !r.is_open) return false;
    if (activeFilter === "top_rated" && (r.rating || 4.7) < 4.8) return false;
    if (
      activeFilter === "fast" &&
      r.delivery_time &&
      parseInt(r.delivery_time) > 25
    )
      return false;

    // 3. Selected cuisine
    if (
      selectedCuisine &&
      r.cuisine &&
      !r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Local Culinary Hotspots</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Explore All Restaurants
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Order from top verified kitchens and eateries delivering hot, fresh food directly to your doorstep.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by restaurant name, cuisine, dish or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-orange-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Filter Tags */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredRestaurants.length}</span> restaurants
        </span>

        {(searchQuery || activeFilter !== "all" || selectedCuisine) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("all");
              setSelectedCuisine(null);
            }}
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading && <CardSkeleton count={6} />}

      {/* Restaurant Grid */}
      {!isLoading && filteredRestaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRestaurants.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No restaurants match your search
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We couldn&apos;t find any restaurants matching &quot;{searchQuery}&quot;. Try adjusting your keywords or clearing your filters.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
                setSelectedCuisine(null);
              }}
            >
              Show All Restaurants
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
