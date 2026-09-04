import { FoodItem } from "./food";

export interface CartRestaurant {
  id: number;
  name: string;
  image_url?: string | null;
}

export interface CartItemFood {
  id: number;
  name: string;
  price: number | string;
  image_url?: string | null;
  category?: string;
  is_available?: boolean;
}

export interface CartItem {
  id: number;
  food_item_id: number;
  quantity: number;
  unit_price?: number | string;
  item_total: number | string;
  food_item?: CartItemFood;
}

export interface Cart {
  id: number | null;
  restaurant?: CartRestaurant | null;
  restaurant_id?: number | null;
  restaurant_name?: string | null;
  items: CartItem[];
  cart_items?: CartItem[];
  subtotal: number | string;
  total_items: number;
  total_amount?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface AddToCartDto {
  food_item_id: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
