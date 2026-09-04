import { fetchApi } from "./api";
import { Restaurant, FoodItem } from "@/types";

export const restaurantService = {
  /**
   * Fetch all verified restaurants for public browsing.
   */
  async getRestaurants(): Promise<Restaurant[]> {
    return fetchApi<Restaurant[]>("/restaurants", {
      method: "GET",
    });
  },

  /**
   * Fetch details for a specific verified restaurant.
   */
  async getRestaurantById(restaurantId: number): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/restaurants/${restaurantId}`, {
      method: "GET",
    });
  },

  /**
   * Fetch available menu food items for a specific restaurant.
   */
  async getRestaurantFoodItems(restaurantId: number): Promise<FoodItem[]> {
    return fetchApi<FoodItem[]>(`/restaurants/${restaurantId}/food-items`, {
      method: "GET",
    });
  },
};
