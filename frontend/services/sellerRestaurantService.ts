import { fetchApi } from "./api";
import {
  CreateRestaurantRequest,
  Restaurant,
  UpdateRestaurantRequest,
} from "@/types";

export const sellerRestaurantService = {
  /**
   * Fetch authenticated seller's restaurant.
   */
  async getMyRestaurant(): Promise<Restaurant> {
    return fetchApi<Restaurant>("/restaurants/me", {
      method: "GET",
    });
  },

  /**
   * Create a new restaurant for the authenticated seller.
   */
  async createRestaurant(data: CreateRestaurantRequest): Promise<Restaurant> {
    return fetchApi<Restaurant>("/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update details of the authenticated seller's restaurant.
   */
  async updateRestaurant(data: UpdateRestaurantRequest): Promise<Restaurant> {
    return fetchApi<Restaurant>("/restaurants/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle restaurant open/close status for order acceptance.
   */
  async updateStatus(isOpen: boolean): Promise<Restaurant> {
    return fetchApi<Restaurant>("/restaurants/me/status", {
      method: "PATCH",
      body: JSON.stringify({ is_open: isOpen }),
    });
  },
};
