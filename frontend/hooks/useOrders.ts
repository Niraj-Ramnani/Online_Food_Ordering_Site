"use client";

import { useState, useEffect, useCallback } from "react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types/order";
import { useAuth } from "./useAuth";
import { useOrderWebSocket } from "./useOrderWebSocket";
import { WebSocketEvent } from "@/types/notification";

export function useOrders(orderId?: number) {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      // Sort newest first
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrderById = useCallback(
    async (id: number) => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await orderService.getOrderById(id);
        setCurrentOrder(data);
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    } else {
      fetchOrders();
    }
  }, [orderId, fetchOrderById, fetchOrders]);

  // Real-time update when an order notification/update occurs
  const handleWebSocketEvent = useCallback(
    (event: WebSocketEvent) => {
      if (
        event.order_id ||
        event.type === "order_status_updated" ||
        event.type === "new_order_received" ||
        event.notification_type?.startsWith("ORDER_") ||
        event.notification_type === "NEW_ORDER"
      ) {
        if (orderId) {
          fetchOrderById(orderId);
        } else {
          fetchOrders();
        }
      }
    },
    [orderId, fetchOrderById, fetchOrders]
  );

  useOrderWebSocket(handleWebSocketEvent);

  const cancelOrder = async (id: number) => {
    setError(null);
    try {
      const updated = await orderService.cancelOrder(id);
      setCurrentOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
      throw err;
    }
  };

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    refreshOrders: fetchOrders,
    refreshOrder: orderId ? () => fetchOrderById(orderId) : fetchOrders,
    cancelOrder,
  };
}
