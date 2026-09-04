export interface CartItemFood {
  id: number;
  name: string;
  price: string | number;
  image_url?: string | null;
  category: string;
  is_available: boolean;
}

export interface CartItem {
  id: number;
  food_item: CartItemFood;
  quantity: number;
  item_total: string | number;
}

export interface CartRestaurant {
  id: number;
  name: string;
  image_url?: string | null;
}

export interface Cart {
  id: number | null;
  restaurant: CartRestaurant | null;
  items: CartItem[];
  subtotal: string | number;
  total_items: number;
}

export interface AddToCartRequest {
  food_item_id: number;
  quantity?: number;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

export type CartResponse = Cart;
export type CartItemResponse = CartItem;
