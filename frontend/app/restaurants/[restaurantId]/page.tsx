"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Flame,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FoodCard } from "@/components/food/FoodCard";
import { CardSkeleton, LoadingSpinner } from "@/components/ui/Loading";
import { CartConflictModal } from "@/components/cart/CartConflictModal";
import { restaurantService } from "@/services/restaurantService";
import { useCart } from "@/hooks/useCart";
import { Restaurant, FoodItem } from "@/types";

const FALLBACK_RESTAURANT: Restaurant = {
  id: 1,
  name: "Mario's Authentic Pizzeria",
  description:
    "Wood-fired handcrafted Italian pizzas, authentic pasta, freshly baked garlic breads, and classic desserts made with imported Italian flour and San Marzano tomatoes.",
  address: "742 Evergreen Terrace, Little Italy",
  image_url:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80",
  is_verified: true,
  is_open: true,
  cuisine: "Italian • Pizza • Pasta",
  rating: 4.9,
  delivery_time: "20-30 min",
  price_range: "$$",
};

const FALLBACK_FOOD_ITEMS: FoodItem[] = [
  {
    id: 1,
    restaurant_id: 1,
    name: "Classic Margherita Pizza",
    category: "Pizzas",
    description:
      "Fresh buffalo mozzarella, san marzano tomato sauce, fresh basil leaves, and extra virgin olive oil.",
    price: "299.00",
    image_url:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.9,
    is_veg: true,
  },
  {
    id: 2,
    restaurant_id: 1,
    name: "Truffle Mushroom & Provolone Pizza",
    category: "Pizzas",
    description:
      "Wild forest mushrooms, black truffle oil drizzle, caramelized leeks, and aged provolone cheese.",
    price: "429.00",
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.8,
    is_veg: true,
  },
  {
    id: 3,
    restaurant_id: 1,
    name: "Spicy Pepperoni & Jalapeño",
    category: "Pizzas",
    description:
      "Loaded with artisan sliced beef pepperoni, pickled jalapeño slices, and hot honey drizzle.",
    price: "449.00",
    image_url:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.9,
    is_veg: false,
  },
  {
    id: 4,
    restaurant_id: 1,
    name: "Garlic Butter Parmesan Breadsticks",
    category: "Sides & Starters",
    description:
      "Warm oven-baked breadsticks brushed with roasted garlic herb butter, grated parmigiano reggiano.",
    price: "169.00",
    image_url:
      "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.7,
    is_veg: true,
  },
  {
    id: 5,
    restaurant_id: 1,
    name: "Creamy Fettuccine Alfredo",
    category: "Pasta",
    description:
      "Al dente fettuccine tossed in a rich butter, heavy cream, and parmesan sauce with fresh parsley.",
    price: "349.00",
    image_url:
      "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 4.6,
    is_veg: true,
  },
  {
    id: 6,
    restaurant_id: 1,
    name: "Classic Italian Tiramisu",
    category: "Desserts",
    description:
      "Espresso-dipped ladyfingers layered with creamy mascarpone mousse and dusted with cocoa powder.",
    price: "199.00",
    image_url:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    rating: 5.0,
    is_veg: true,
  },
];

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = Number(params.restaurantId);
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMenu, setSearchMenu] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { cart, totalItemsCount } = useCart();

  useEffect(() => {
    async function loadData() {
      if (isNaN(restaurantId)) return;
      setIsLoading(true);
      try {
        const [restData, itemsData] = await Promise.all([
          restaurantService.getRestaurantById(restaurantId).catch(() => null),
          restaurantService.getRestaurantFoodItems(restaurantId).catch(() => []),
        ]);

        if (restData) {
          setRestaurant(restData);
        } else {
          setRestaurant({ ...FALLBACK_RESTAURANT, id: restaurantId });
        }

        if (itemsData && itemsData.length > 0) {
          setFoodItems(itemsData);
        } else {
          setFoodItems(FALLBACK_FOOD_ITEMS);
        }
      } catch {
        setRestaurant({ ...FALLBACK_RESTAURANT, id: restaurantId });
        setFoodItems(FALLBACK_FOOD_ITEMS);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [restaurantId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="w-full h-64 sm:h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Restaurant not found</h2>
        <Link href="/restaurants">
          <Button variant="primary">Back to Restaurants</Button>
        </Link>
      </div>
    );
  }

  // Extract unique categories from food items
  const categories = [
    "All",
    ...Array.from(new Set(foodItems.map((f) => f.category || "Special"))),
  ];

  // Filter food items
  const filteredFoodItems = foodItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !searchMenu.trim() ||
      item.name.toLowerCase().includes(searchMenu.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchMenu.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const displayCover =
    restaurant.image_url ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-28">
      {/* Back Link */}
      <div>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Restaurants</span>
        </Link>
      </div>

      {/* Hero Cover Card */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="relative w-full h-64 sm:h-80 lg:h-96">
          <Image
            src={displayCover}
            alt={restaurant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {restaurant.is_open ? (
                <Badge variant="success" size="sm" className="bg-emerald-500 text-white font-bold">
                  Open Now
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm" className="bg-slate-900/90 text-slate-300 font-bold">
                  Currently Closed
                </Badge>
              )}
            </div>

            {restaurant.is_verified && (
              <div className="flex items-center gap-1 bg-white/95 text-sky-600 font-bold text-xs px-3 py-1 rounded-full shadow-md">
                <ShieldCheck className="w-4 h-4 fill-sky-600 text-white" />
                <span>Verified Partner</span>
              </div>
            )}
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-md">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{(restaurant.rating || 4.9).toFixed(1)}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{restaurant.address}</span>
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-300 pt-1">
              <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {restaurant.delivery_time || "25-35 min"}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
                {restaurant.cuisine || "Multi-Cuisine"}
              </span>
            </div>
          </div>
        </div>

        {restaurant.description && (
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {restaurant.description}
          </div>
        )}
      </div>

      {/* Closed Restaurant Alert */}
      {!restaurant.is_open && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <span className="font-bold block">Restaurant is Currently Closed</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 block mt-0.5">
              You can browse the menu, but food ordering is temporarily paused until the kitchen re-opens.
            </span>
          </div>
        </div>
      )}

      {/* Menu Header & Search */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              Restaurant Menu
            </h2>
            <p className="text-xs text-slate-500">
              {filteredFoodItems.length} dishes available to order
            </p>
          </div>

          {/* Menu Search */}
          <div className="relative w-full sm:w-72 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search this menu..."
              value={searchMenu}
              onChange={(e) => setSearchMenu(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      {filteredFoodItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoodItems.map((food) => (
            <FoodCard key={food.id} foodItem={food} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No items found matching &quot;{searchMenu}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchMenu("");
              setActiveCategory("All");
            }}
            className="text-xs text-orange-600 font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Floating Bottom Cart Bar on Mobile/Desktop */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
          <Link href="/cart">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-600 text-white shadow-2xl shadow-orange-600/40 hover:bg-orange-700 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-sm block">
                    {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in cart
                  </span>
                  <span className="text-xs text-orange-200">
                    Subtotal: ₹{cart?.subtotal || "0.00"}
                  </span>
                </div>
              </div>

              <span className="font-black text-xs uppercase tracking-wider bg-white text-orange-600 px-4 py-2 rounded-xl">
                View Cart →
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Cart Conflict Dialog */}
      <CartConflictModal />
    </div>
  );
}
