import { fetchApi } from "./api";
import {
  CreateFoodItemRequest,
  FoodItem,
  UpdateFoodItemRequest,
} from "@/types";

export const sellerFoodService = {
  /**
   * Fetch all food items belonging to the authenticated seller's restaurant.
   */
  async getMyFoodItems(): Promise<FoodItem[]> {
    return fetchApi<FoodItem[]>("/restaurants/me/food-items", {
      method: "GET",
    });
  },

  /**
   * Create a new food item in the seller's restaurant.
   */
  async createFoodItem(data: CreateFoodItemRequest): Promise<FoodItem> {
    return fetchApi<FoodItem>("/restaurants/me/food-items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update details of an existing food item.
   */
  async updateFoodItem(
    foodItemId: number,
    data: UpdateFoodItemRequest
  ): Promise<FoodItem> {
    return fetchApi<FoodItem>(`/food-items/${foodItemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle availability flag of a food item.
   */
  async updateAvailability(
    foodItemId: number,
    isAvailable: boolean
  ): Promise<FoodItem> {
    return fetchApi<FoodItem>(`/food-items/${foodItemId}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },

  /**
   * Delete a food item from the restaurant menu.
   */
  async deleteFoodItem(foodItemId: number): Promise<void> {
    return fetchApi<void>(`/food-items/${foodItemId}`, {
      method: "DELETE",
    });
  },
};
