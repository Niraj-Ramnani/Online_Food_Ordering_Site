"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { AdminDashboardStats, AdminUser } from "@/types/admin";
import { Restaurant } from "@/types/restaurant";
import { Order } from "@/types/order";
import { useAuth } from "./useAuth";
import { useOrderWebSocket } from "./useOrderWebSocket";
import { WebSocketEvent } from "@/types/notification";

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "ADMIN") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "ADMIN") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const fetchRestaurants = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "ADMIN") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getRestaurants();
      setRestaurants(data);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurants");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "ADMIN") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getOrders();
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load platform orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // Real-time synchronization for admin oversight
  const handleWebSocketEvent = useCallback(
    (event: WebSocketEvent) => {
      if (
        event.type === "new_order_received" ||
        event.type === "order_status_updated" ||
        event.type === "restaurant_verified" ||
        event.type === "restaurant_status_updated" ||
        event.notification_type?.startsWith("ORDER_") ||
        event.notification_type === "NEW_ORDER" ||
        event.notification_type === "RESTAURANT_VERIFIED"
      ) {
        fetchDashboard();
        fetchOrders();
        fetchRestaurants();
      }
    },
    [fetchDashboard, fetchOrders, fetchRestaurants]
  );

  useOrderWebSocket(handleWebSocketEvent);

  const updateUserStatus = async (userId: number, isActive: boolean) => {
    setError(null);
    try {
      const updated = await adminService.updateUserStatus(userId, isActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
      throw err;
    }
  };

  const verifyRestaurant = async (restaurantId: number, isVerified: boolean) => {
    setError(null);
    try {
      const updated = await adminService.verifyRestaurant(restaurantId, isVerified);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? updated : r))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update restaurant verification");
      throw err;
    }
  };

  const updateRestaurantStatus = async (
    restaurantId: number,
    isOpen: boolean
  ) => {
    setError(null);
    try {
      const updated = await adminService.updateRestaurantStatus(
        restaurantId,
        isOpen
      );
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? updated : r))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update restaurant status");
      throw err;
    }
  };

  return {
    stats,
    users,
    restaurants,
    orders,
    isLoading,
    error,
    fetchDashboard,
    fetchUsers,
    fetchRestaurants,
    fetchOrders,
    updateUserStatus,
    verifyRestaurant,
    updateRestaurantStatus,
  };
}
