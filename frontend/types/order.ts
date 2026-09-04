export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

export interface OrderItem {
  id: number;
  food_item_id: number;
  food_name: string;
  quantity: number;
  unit_price: number | string;
  item_total: number | string;
}

export interface OrderRestaurant {
  id: number;
  name: string;
  address: string;
  image_url?: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  restaurant: OrderRestaurant;
  address_id?: number | null;
  delivery_address: string;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  status: OrderStatus;
  total_amount: number | string;
  description?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutDto {
  address_id: number;
  description?: string | null;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
