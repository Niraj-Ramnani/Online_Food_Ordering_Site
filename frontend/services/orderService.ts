import { fetchApi } from "./api";
import { CheckoutDto, Order } from "@/types/order";

export const orderService = {
  async checkout(data: CheckoutDto): Promise<Order> {
    return fetchApi<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return fetchApi<Order[]>("/orders");
  },

  async getOrderById(orderId: number): Promise<Order> {
    return fetchApi<Order>(`/orders/${orderId}`);
  },

  async cancelOrder(orderId: number): Promise<Order> {
    return fetchApi<Order>(`/orders/${orderId}/cancel`, {
      method: "PATCH",
    });
  },
};
