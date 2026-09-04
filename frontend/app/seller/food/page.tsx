"use client";

import React, { useState } from "react";
import {
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SellerNavTabs } from "@/components/seller/SellerNavTabs";
import { FoodManagementCard } from "@/components/seller/FoodManagementCard";
import { FoodForm } from "@/components/seller/FoodForm";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useSellerFood } from "@/hooks/useSellerFood";
import { useSellerRestaurant } from "@/hooks/useSellerRestaurant";
import {
  CreateFoodItemRequest,
  FoodItem,
  UpdateFoodItemRequest,
} from "@/types";

export default function SellerFoodPage() {
  const { restaurant } = useSellerRestaurant();
  const {
    foodItems,
    isLoading,
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability,
  } = useSellerFood();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(foodItems.map((f) => f.category || "Special"))),
  ];

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category &&
        item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: FoodItem) => {
    setEditingItem(food);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateFoodItemRequest | UpdateFoodItemRequest
  ) => {
    if (editingItem) {
      await updateFood(editingItem.id, data as UpdateFoodItemRequest);
    } else {
      await createFood(data as CreateFoodItemRequest);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["SELLER"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Utensils className="w-7 h-7 text-orange-500" />
              Food Menu Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add dishes, update prices in ₹, toggle availability, and organize your kitchen menu
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Add New Dish
          </Button>
        </div>

        {/* Navigation Tabs */}
        <SellerNavTabs />

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dishes by name, category, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-orange-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span> dishes in menu
          </span>

          {(searchQuery || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading restaurant menu items..." />
          </div>
        )}

        {/* Empty State: No Dishes */}
        {!isLoading && foodItems.length === 0 && (
          <div className="max-w-md mx-auto py-16 text-center space-y-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                No food items in your menu yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Add pizzas, burgers, biryanis, beverages, and desserts for customers to discover and order.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenAddModal}
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full font-bold"
              >
                + Add Your First Dish
              </Button>
            </div>
          </div>
        )}

        {/* Filter Empty State */}
        {!isLoading && foodItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No dishes found matching &quot;{searchQuery}&quot; in {selectedCategory}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Food Items List */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="space-y-3.5">
            {filteredItems.map((food) => (
              <FoodManagementCard
                key={food.id}
                foodItem={food}
                onEdit={handleOpenEditModal}
                onDelete={deleteFood}
                onToggleAvailability={async (id, isAvailable) => {
                  await toggleAvailability(id, isAvailable);
                }}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <FoodForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingItem}
        />
      </div>
    </ProtectedRoute>
  );
}
