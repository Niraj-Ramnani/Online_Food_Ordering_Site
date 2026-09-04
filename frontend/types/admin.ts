import { UserRole } from "./user";

export interface AdminDashboardStats {
  total_users: number;
  total_sellers: number;
  total_restaurants: number;
  verified_restaurants: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserStatusDto {
  is_active: boolean;
}

export interface AdminRestaurantVerifyDto {
  is_verified: boolean;
}

export interface AdminRestaurantStatusDto {
  is_open: boolean;
}

export interface AdminFoodStatusDto {
  is_available: boolean;
}
