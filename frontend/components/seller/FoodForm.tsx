"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "./ImageUpload";
import { CreateFoodItemRequest, FoodItem, UpdateFoodItemRequest } from "@/types";

interface FoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFoodItemRequest | UpdateFoodItemRequest) => Promise<any>;
  initialData?: FoodItem | null;
}

const CATEGORY_PRESETS = [
  "Pizza",
  "Burgers",
  "Biryani",
  "Pasta",
  "Sides & Starters",
  "Beverages",
  "Desserts",
];

export function FoodForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: FoodFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pizza");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      if (CATEGORY_PRESETS.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory("");
      } else {
        setCategory("Other");
        setCustomCategory(initialData.category || "");
      }
      setPrice(
        typeof initialData.price === "number"
          ? initialData.price.toString()
          : initialData.price || ""
      );
      setDescription(initialData.description || "");
      setImageUrl(initialData.image_url || null);
    } else {
      setName("");
      setCategory("Pizza");
      setCustomCategory("");
      setPrice("");
      setDescription("");
      setImageUrl(null);
    }
    setErrors({});
    setApiError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const finalCategory =
    category === "Other" && customCategory.trim()
      ? customCategory.trim()
      : category;

  const validate = () => {
    const errs: Record<string, string | undefined> = {};
    if (!name.trim()) {
      errs.name = "Food item name is required";
    }
    if (!finalCategory.trim()) {
      errs.category = "Category is required";
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice)) {
      errs.price = "Valid price is required";
    } else if (numPrice <= 0) {
      errs.price = "Price must be greater than 0";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateFoodItemRequest = {
        name: name.trim(),
        category: finalCategory,
        price: parseFloat(price).toFixed(2),
        description: description.trim() ? description.trim() : null,
        image_url: imageUrl,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err.message || "Failed to save food item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {initialData ? "Edit Food Item" : "Add New Food Item"}
              </h3>
              <p className="text-xs text-slate-500">
                Menu details and pricing for customer orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <Input
            label="Dish / Item Name"
            placeholder="e.g. Truffle Mushroom Pizza"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />

          {/* Category Pill Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setCustomCategory("");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    category === cat
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory("Other")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  category === "Other"
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                + Custom
              </button>
            </div>

            {category === "Other" && (
              <div className="mt-2">
                <Input
                  placeholder="e.g. Seafood, Mocktails, Combos"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  error={errors.category}
                />
              </div>
            )}
          </div>

          {/* Price */}
          <Input
            label="Price (₹ INR)"
            type="number"
            step="0.01"
            placeholder="e.g. 299.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
            }}
            error={errors.price}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Ingredients / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Fresh mozzarella, tomato sauce, basil, olive oil..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            label="Food Photo"
            value={imageUrl}
            onChange={setImageUrl}
            presetCategory="food"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {initialData ? "Save Dish Changes" : "Add Dish to Menu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
