"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { FoodCard } from "@/components/food/FoodCard";
import { Restaurant, FoodItem } from "@/types";

// Curated Showcase Data for Initial Frontend Milestone
const SAMPLE_RESTAURANTS: Restaurant[] = [
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
    review_count: 340,
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
    review_count: 512,
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
    review_count: 820,
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
    review_count: 290,
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
    review_count: 180,
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
    review_count: 450,
    delivery_time: "20-30 min",
    price_range: "$$",
  },
];

const SAMPLE_FOODS: FoodItem[] = [
  {
    id: 1,
    restaurant_id: 1,
    restaurant_name: "Mario's Pizzeria",
    name: "Classic Margherita Pizza",
    category: "Bestseller",
    description:
      "Fresh buffalo mozzarella, san marzano tomato sauce, basil leaves, extra virgin olive oil.",
    price: "299.00",
    image_url:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.9,
    is_veg: true,
  },
  {
    id: 2,
    restaurant_id: 2,
    restaurant_name: "Gourmet Burger Lab",
    name: "Double Truffle Smash Burger",
    category: "Chef Special",
    description:
      "Two crispy smashed beef patties, aged cheddar, caramelized onions, black truffle aioli in brioche bun.",
    price: "349.00",
    image_url:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.8,
    is_veg: false,
  },
  {
    id: 3,
    restaurant_id: 3,
    restaurant_name: "Royal Biryani",
    name: "Hyderabadi Dum Biryani",
    category: "Signature",
    description:
      "Fragrant long-grain basmati rice cooked on slow dum with aromatic spices and saffron.",
    price: "399.00",
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 5.0,
    is_veg: false,
  },
  {
    id: 4,
    restaurant_id: 4,
    restaurant_name: "Tokyo Ramen",
    name: "Tonkotsu Chashu Ramen",
    category: "Trending",
    description:
      "Rich 16-hour pork bone broth with springy noodles, braised chashu, ajitsuke tamago, and nori.",
    price: "420.00",
    image_url:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.9,
    is_veg: false,
  },
  {
    id: 5,
    restaurant_id: 5,
    restaurant_name: "Green Garden",
    name: "Avocado & Quinoa Power Bowl",
    category: "Healthy",
    description:
      "Fresh hass avocado, organic quinoa, roasted chickpeas, kale, cherry tomatoes, and tahini dressing.",
    price: "280.00",
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.7,
    is_veg: true,
  },
  {
    id: 6,
    restaurant_id: 6,
    restaurant_name: "Sweet Tooth Bakery",
    name: "Belgian Chocolate Lava Cake",
    category: "Dessert",
    description:
      "Decadent molten dark chocolate lava cake served warm with powdered sugar dusting.",
    price: "180.00",
    image_url:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.9,
    is_veg: true,
  },
];

const CUISINES = [
  { name: "All Cuisines", emoji: "🍽️", count: "50+ spots" },
  { name: "Pizza", emoji: "🍕", count: "18 spots" },
  { name: "Burgers", emoji: "🍔", count: "24 spots" },
  { name: "Biryani", emoji: "🍚", count: "15 spots" },
  { name: "Asian", emoji: "🍜", count: "20 spots" },
  { name: "Healthy", emoji: "🥗", count: "12 spots" },
  { name: "Desserts", emoji: "🍰", count: "16 spots" },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All Cuisines");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-transparent dark:from-slate-900/60 dark:via-slate-950 dark:to-transparent pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle Decorative Background Circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-orange-300/15 via-amber-200/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Highlight Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/80 text-xs font-bold text-orange-700 dark:text-orange-400 shadow-sm animate-pulse">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Zero Delivery Fee on your first 3 orders</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Delicious food, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  delivered fast
                </span>{" "}
                to your door.
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover the best local restaurants and trending culinary favorites around you. Track every order from kitchen to doorstep in real-time.
              </p>

              {/* Search Box */}
              <div className="max-w-xl mx-auto lg:mx-0 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl shadow-slate-200/70 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter your favorite dish or restaurant..."
                    className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
                <Button variant="primary" size="lg" className="shrink-0 shadow-none">
                  Find Food
                </Button>
              </div>

              {/* Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-slate-800 dark:text-slate-200">
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    500+
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Verified Restaurants
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    25 min
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Average Delivery
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center lg:justify-start gap-1">
                    4.9 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    From 50k+ Reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-4 border-white dark:border-slate-800">
                <Image
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80"
                  alt="Delicious food delivery platter"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                {/* Floating Live Badge 1: Top Rated */}
                <div className="absolute top-5 left-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Top Rated 2026
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      500+ local partners
                    </span>
                  </div>
                </div>

                {/* Floating Live Badge 2: Delivery */}
                <div className="absolute bottom-5 right-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Lightning Speed
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Live GPS Tracking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* CUISINE CATEGORIES SELECTOR */}
      {/* ------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              Explore by Cuisine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select what your tastebuds are craving today
            </p>
          </div>
        </div>

        {/* Scrollable / Responsive Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {CUISINES.map((item) => {
            const isSelected = activeCategory === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveCategory(item.name)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-[1.02]"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-800"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* FEATURED RESTAURANTS */}
      {/* ------------------------------------------------------------------- */}
      <section id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Trending Places</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Top Rated Restaurants Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated verified restaurants with hygienic preparation and rapid delivery
            </p>
          </div>

          <Link
            href="#all-restaurants"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <span>View all 500+ restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_RESTAURANTS.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* PROMOTIONAL OFFER BANNER */}
      {/* ------------------------------------------------------------------- */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white p-8 sm:p-12 shadow-xl shadow-orange-500/20">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-extrabold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Promo Code</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Hungry? Get 50% Off <br />
                On Your First Order Today!
              </h3>
              <p className="text-sm sm:text-base text-orange-100 max-w-lg">
                Use code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">TASTY50</span> at checkout to enjoy up to ₹150 off.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-white text-orange-600 hover:bg-orange-50 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>COPIED CODE!</span>
                  </>
                ) : (
                  <>
                    <span>USE CODE: TASTY50</span>
                  </>
                )}
              </button>
              <span className="text-xs text-orange-100/90 font-medium">
                *Valid on orders above ₹299
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* POPULAR & BESTSELLING DISHES */}
      {/* ------------------------------------------------------------------- */}
      <section id="popular" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Most Ordered Dishes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Popular Dishes In Your Area
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked bestsellers prepared fresh to order
            </p>
          </div>

          <Button variant="outline" size="sm">
            View Full Menu
          </Button>
        </div>

        {/* Food Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_FOODS.map((food) => (
            <FoodCard
              key={food.id}
              foodItem={food}
              onAddToCart={() => {}}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* HOW IT WORKS / VALUE PROPOSITIONS */}
      {/* ------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How QuickBite Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Getting your favorite food is as easy as 1, 2, 3
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto text-2xl font-black">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Choose Your Meal
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Browse hundreds of verified menus, customize toppings, and add your favorite dishes to cart.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-black">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Real-Time Tracking
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Track your food with WebSocket real-time updates as the chef cooks and the rider picks it up.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl font-black">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Fast Hot Delivery
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Receive your piping-hot meal at your doorstep with safe, contactless delivery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
