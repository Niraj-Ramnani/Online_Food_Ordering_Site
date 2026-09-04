"use client";

import { useState, useEffect, useCallback } from "react";
import { sellerFoodService } from "@/services/sellerFoodService";
import { CreateFoodItemRequest, FoodItem, UpdateFoodItemRequest } from "@/types";

export function useSellerFood() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoodItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await sellerFoodService.getMyFoodItems();
      setFoodItems(items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load food menu");
      setFoodItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const createFood = async (data: CreateFoodItemRequest): Promise<FoodItem> => {
    const newItem = await sellerFoodService.createFoodItem(data);
    setFoodItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateFood = async (
    id: number,
    data: UpdateFoodItemRequest
  ): Promise<FoodItem> => {
    const updated = await sellerFoodService.updateFoodItem(id, data);
    setFoodItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const deleteFood = async (id: number): Promise<void> => {
    await sellerFoodService.deleteFoodItem(id);
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAvailability = async (
    id: number,
    isAvailable: boolean
  ): Promise<FoodItem> => {
    const updated = await sellerFoodService.updateAvailability(id, isAvailable);
    setFoodItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  return {
    foodItems,
    isLoading,
    error,
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability,
    refreshFood: fetchFoodItems,
  };
}
