import { fetchApi } from "./api";
import { AdminDashboardStats, AdminUser } from "@/types/admin";
import { Restaurant } from "@/types/restaurant";
import { FoodItem } from "@/types/food";
import { Order } from "@/types/order";

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return fetchApi<AdminDashboardStats>("/admin/dashboard");
  },

  async getUsers(): Promise<AdminUser[]> {
    return fetchApi<AdminUser[]>("/admin/users");
  },

  async updateUserStatus(userId: number, isActive: boolean): Promise<AdminUser> {
    return fetchApi<AdminUser>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  async getRestaurants(): Promise<Restaurant[]> {
    return fetchApi<Restaurant[]>("/admin/restaurants");
  },

  async verifyRestaurant(
    restaurantId: number,
    isVerified: boolean
  ): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/admin/restaurants/${restaurantId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified: isVerified }),
    });
  },

  async updateRestaurantStatus(
    restaurantId: number,
    isOpen: boolean
  ): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/admin/restaurants/${restaurantId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_open: isOpen }),
    });
  },

  async getFoodItems(): Promise<FoodItem[]> {
    return fetchApi<FoodItem[]>("/admin/food-items");
  },

  async updateFoodStatus(
    foodItemId: number,
    isAvailable: boolean
  ): Promise<FoodItem> {
    return fetchApi<FoodItem>(`/admin/food-items/${foodItemId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },

  async getOrders(): Promise<Order[]> {
    return fetchApi<Order[]>("/admin/orders");
  },

  async getOrderById(orderId: number): Promise<Order> {
    return fetchApi<Order>(`/admin/orders/${orderId}`);
  },
};
