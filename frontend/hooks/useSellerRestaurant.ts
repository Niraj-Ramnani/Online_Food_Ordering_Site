"use client";

import { useState, useEffect, useCallback } from "react";
import { sellerRestaurantService } from "@/services/sellerRestaurantService";
import {
  CreateRestaurantRequest,
  Restaurant,
  UpdateRestaurantRequest,
} from "@/types";
import { ApiError } from "@/services/api";
import { useOrderWebSocket } from "./useOrderWebSocket";
import { WebSocketEvent } from "@/types/notification";

export function useSellerRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sellerRestaurantService.getMyRestaurant();
      setRestaurant(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        // Seller has not created a restaurant profile yet
        setRestaurant(null);
      } else {
        setError(err.message || "Failed to load restaurant profile");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  // Real-time synchronization when admin verifies or updates restaurant status
  const handleWebSocketEvent = useCallback(
    (event: WebSocketEvent) => {
      if (
        event.type === "restaurant_verified" ||
        event.type === "restaurant_status_updated" ||
        event.notification_type === "RESTAURANT_VERIFIED" ||
        event.notification_type === "RESTAURANT_UNVERIFIED"
      ) {
        fetchRestaurant();
      }
    },
    [fetchRestaurant]
  );

  useOrderWebSocket(handleWebSocketEvent);

  const createRestaurant = async (data: CreateRestaurantRequest): Promise<Restaurant> => {
    const newRestaurant = await sellerRestaurantService.createRestaurant(data);
    setRestaurant(newRestaurant);
    return newRestaurant;
  };

  const updateRestaurant = async (data: UpdateRestaurantRequest): Promise<Restaurant> => {
    const updated = await sellerRestaurantService.updateRestaurant(data);
    setRestaurant(updated);
    return updated;
  };

  const toggleStatus = async (isOpen: boolean): Promise<Restaurant> => {
    const updated = await sellerRestaurantService.updateStatus(isOpen);
    setRestaurant(updated);
    return updated;
  };

  return {
    restaurant,
    isLoading,
    error,
    createRestaurant,
    updateRestaurant,
    toggleStatus,
    refreshRestaurant: fetchRestaurant,
  };
}
