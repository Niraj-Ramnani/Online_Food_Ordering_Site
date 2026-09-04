import { fetchApi } from "./api";
import { Order, OrderStatus } from "@/types/order";

export const sellerOrderService = {
  async getSellerOrders(): Promise<Order[]> {
    return fetchApi<Order[]>("/seller/orders");
  },

  async getSellerOrderById(orderId: number): Promise<Order> {
    return fetchApi<Order>(`/seller/orders/${orderId}`);
  },

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<Order> {
    return fetchApi<Order>(`/seller/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async acceptOrder(orderId: number): Promise<Order> {
    return this.updateOrderStatus(orderId, "ACCEPTED");
  },

  async rejectOrder(orderId: number): Promise<Order> {
    return this.updateOrderStatus(orderId, "REJECTED");
  },
};
