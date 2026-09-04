import { fetchApi } from "./api";
import { CartResponse } from "@/types";

export const cartService = {
  /**
   * Fetch authenticated user's active cart.
   */
  async getCart(): Promise<CartResponse> {
    return fetchApi<CartResponse>("/cart", {
      method: "GET",
    });
  },

  /**
   * Add a food item to the active cart.
   * Throws 409 ApiError if cart has items from another restaurant.
   */
  async addToCart(foodItemId: number, quantity: number = 1): Promise<CartResponse> {
    return fetchApi<CartResponse>("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        food_item_id: foodItemId,
        quantity,
      }),
    });
  },

  /**
   * Update the quantity of an existing item in the cart.
   */
  async updateQuantity(cartItemId: number, quantity: number): Promise<CartResponse> {
    return fetchApi<CartResponse>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Remove a single item from the cart.
   */
  async removeItem(cartItemId: number): Promise<CartResponse> {
    return fetchApi<CartResponse>(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  },

  /**
   * Clear all items from the active cart.
   */
  async clearCart(): Promise<CartResponse> {
    return fetchApi<CartResponse>("/cart", {
      method: "DELETE",
    });
  },
};
