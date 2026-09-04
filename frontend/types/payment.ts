export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface CreatePaymentOrderResponse {
  order_id: number;
  razorpay_order_id: string;
  amount: number | string;
  amount_in_paise: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResponse {
  id: number;
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  amount: number | string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}
