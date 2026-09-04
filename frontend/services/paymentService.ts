import { fetchApi } from "./api";
import {
  CreatePaymentOrderResponse,
  PaymentResponse,
  VerifyPaymentDto,
} from "@/types/payment";

export const paymentService = {
  async createPaymentOrder(orderId: number): Promise<CreatePaymentOrderResponse> {
    return fetchApi<CreatePaymentOrderResponse>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    });
  },

  async verifyPayment(data: VerifyPaymentDto): Promise<PaymentResponse> {
    return fetchApi<PaymentResponse>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getPaymentByOrder(orderId: number): Promise<PaymentResponse> {
    return fetchApi<PaymentResponse>(`/payments/order/${orderId}`);
  },
};
