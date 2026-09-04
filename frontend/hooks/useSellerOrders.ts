"use client";

import { useState, useEffect, useCallback } from "react";
import { sellerOrderService } from "@/services/sellerOrderService";
import { Order, OrderStatus } from "@/types/order";
import { useAuth } from "./useAuth";
import { useOrderWebSocket } from "./useOrderWebSocket";
import { WebSocketEvent } from "@/types/notification";

export function useSellerOrders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "SELLER") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sellerOrderService.getSellerOrders();
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load seller orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time update when new orders come in
  const handleWebSocketEvent = useCallback(
    (event: WebSocketEvent) => {
      if (
        event.type === "notification" ||
        event.notification_type === "ORDER_PLACED" ||
        event.order_id
      ) {
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  useOrderWebSocket(handleWebSocketEvent);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    setError(null);
    try {
      const updated = await sellerOrderService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    } catch (err: any) {
      setError(err.message || `Failed to update order to ${status}`);
      throw err;
    }
  };

  const acceptOrder = async (orderId: number) => {
    return updateStatus(orderId, "ACCEPTED");
  };

  const rejectOrder = async (orderId: number) => {
    return updateStatus(orderId, "REJECTED");
  };

  return {
    orders,
    isLoading,
    error,
    refreshOrders: fetchOrders,
    updateStatus,
    acceptOrder,
    rejectOrder,
  };
}
