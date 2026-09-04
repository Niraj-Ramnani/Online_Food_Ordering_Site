import { fetchApi } from "./api";
import { AddToCartDto, Cart, UpdateCartItemDto } from "@/types/cart";

export const cartService = {
  async getCart(): Promise<Cart> {
    return fetchApi<Cart>("/cart");
  },

  async addToCart(data: AddToCartDto): Promise<Cart> {
    return fetchApi<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateItemQuantity(
    cartItemId: number,
    data: UpdateCartItemDto
  ): Promise<Cart> {
    return fetchApi<Cart>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async removeItem(cartItemId: number): Promise<Cart> {
    return fetchApi<Cart>(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  },

  async clearCart(): Promise<Cart> {
    return fetchApi<Cart>("/cart", {
      method: "DELETE",
    });
  },
};
