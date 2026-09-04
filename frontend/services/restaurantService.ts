import { fetchApi } from "./api";
import { Restaurant } from "@/types/restaurant";
import { FoodItem } from "@/types/food";

export const restaurantService = {
  async getPublicRestaurants(): Promise<Restaurant[]> {
    return fetchApi<Restaurant[]>("/restaurants");
  },

  async getPublicRestaurant(restaurantId: number): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/restaurants/${restaurantId}`);
  },

  async getRestaurantFoodItems(restaurantId: number): Promise<FoodItem[]> {
    return fetchApi<FoodItem[]>(`/restaurants/${restaurantId}/food-items`);
  },
};
