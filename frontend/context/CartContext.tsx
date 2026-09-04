"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { cartService } from "@/services/cartService";
import { Cart, FoodItem } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isUpdating: boolean;
  totalItemsCount: number;
  conflictPending: { foodItem: FoodItem; quantity: number } | null;
  addToCart: (foodItem: FoodItem, quantity?: number) => Promise<boolean>;
  confirmClearAndAdd: () => Promise<void>;
  cancelConflict: () => void;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [conflictPending, setConflictPending] = useState<{
    foodItem: FoodItem;
    quantity: number;
  } | null>(null);

  const fetchUserCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      // User might not have a cart yet or network error
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchUserCart]);

  const addToCart = async (
    foodItem: FoodItem,
    quantity: number = 1
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      // Redirect to login if unauthenticated
      window.location.href = "/login";
      return false;
    }

    setIsUpdating(true);
    try {
      const updatedCart = await cartService.addToCart(foodItem.id, quantity);
      setCart(updatedCart);
      return true;
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        // One restaurant per cart conflict!
        setConflictPending({ foodItem, quantity });
        return false;
      }
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmClearAndAdd = async () => {
    if (!conflictPending) return;
    setIsUpdating(true);
    try {
      await cartService.clearCart();
      const updatedCart = await cartService.addToCart(
        conflictPending.foodItem.id,
        conflictPending.quantity
      );
      setCart(updatedCart);
      setConflictPending(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelConflict = () => {
    setConflictPending(null);
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    setIsUpdating(true);
    try {
      if (quantity <= 0) {
        const updatedCart = await cartService.removeItem(cartItemId);
        setCart(updatedCart);
      } else {
        const updatedCart = await cartService.updateQuantity(cartItemId, quantity);
        setCart(updatedCart);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    setIsUpdating(true);
    try {
      const updatedCart = await cartService.removeItem(cartItemId);
      setCart(updatedCart);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    setIsUpdating(true);
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshCart = async () => {
    await fetchUserCart();
  };

  const totalItemsCount = cart?.total_items || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isUpdating,
        totalItemsCount,
        conflictPending,
        addToCart,
        confirmClearAndAdd,
        cancelConflict,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
