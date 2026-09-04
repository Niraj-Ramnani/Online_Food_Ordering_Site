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
import { Cart, CartItem, CartRestaurant } from "@/types/cart";
import { useAuth } from "@/hooks/useAuth";

export interface PendingCartItem {
  id: number;
  name: string;
  quantity: number;
  restaurantName?: string | null;
  image_url?: string | null;
}

export interface ConflictModalState {
  isOpen: boolean;
  pendingItem: PendingCartItem | null;
  currentRestaurantName: string;
}

export interface AddedItemNotification {
  name: string;
  quantity: number;
  price?: number | null;
  image_url?: string | null;
  restaurant_name?: string | null;
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  restaurant: CartRestaurant | null;
  isLoading: boolean;
  error: string | null;
  isBouncing: boolean;
  lastAddedNotification: AddedItemNotification | null;
  conflictModal: ConflictModalState;
  addToCart: (
    foodItemId: number,
    quantity?: number,
    meta?: { name?: string; restaurantName?: string | null; image_url?: string | null; price?: number | null }
  ) => Promise<Cart | null>;
  confirmReplaceCart: () => Promise<void>;
  cancelReplaceCart: () => void;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<Cart | null>;
  removeItem: (cartItemId: number) => Promise<Cart | null>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  dismissAddedNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const [lastAddedNotification, setLastAddedNotification] =
    useState<AddedItemNotification | null>(null);

  const [conflictModal, setConflictModal] = useState<ConflictModalState>({
    isOpen: false,
    pendingItem: null,
    currentRestaurantName: "",
  });

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err: any) {
      if (err?.status !== 404) {
        setError(err.message || "Failed to load cart");
      } else {
        setCart(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Trigger bouncy animation and notification toast
  const triggerCartAnimation = (notification?: AddedItemNotification) => {
    setIsBouncing(true);
    if (notification) {
      setLastAddedNotification(notification);
    }
    setTimeout(() => setIsBouncing(false), 800);
    if (notification) {
      setTimeout(() => setLastAddedNotification(null), 4000);
    }
  };

  const addToCart = async (
    foodItemId: number,
    quantity: number = 1,
    meta?: { name?: string; restaurantName?: string | null; image_url?: string | null; price?: number | null }
  ): Promise<Cart | null> => {
    setError(null);
    try {
      const updatedCart = await cartService.addToCart({
        food_item_id: foodItemId,
        quantity,
      });
      setCart(updatedCart);
      triggerCartAnimation({
        name: meta?.name || "Dish",
        quantity,
        price: meta?.price,
        image_url: meta?.image_url,
        restaurant_name: meta?.restaurantName,
      });
      return updatedCart;
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      // Check for 409 or restaurant conflict
      if (
        err?.status === 409 ||
        msg.includes("another restaurant") ||
        msg.includes("different restaurant") ||
        msg.includes("clear your cart")
      ) {
        setConflictModal({
          isOpen: true,
          pendingItem: {
            id: foodItemId,
            name: meta?.name || "Food Item",
            quantity,
            restaurantName: meta?.restaurantName,
            image_url: meta?.image_url,
          },
          currentRestaurantName:
            cart?.restaurant?.name || cart?.restaurant_name || "another restaurant",
        });
        return null;
      }
      setError(err.message || "Failed to add item to cart");
      throw err;
    }
  };

  const confirmReplaceCart = async () => {
    if (!conflictModal.pendingItem) {
      setConflictModal({ isOpen: false, pendingItem: null, currentRestaurantName: "" });
      return;
    }
    const pending = conflictModal.pendingItem;
    setIsLoading(true);
    try {
      await cartService.clearCart();
      const updated = await cartService.addToCart({
        food_item_id: pending.id,
        quantity: pending.quantity,
      });
      setCart(updated);
      triggerCartAnimation({
        name: pending.name,
        quantity: pending.quantity,
        image_url: pending.image_url,
        restaurant_name: pending.restaurantName,
      });
    } catch (err: any) {
      setError(err.message || "Failed to replace cart");
    } finally {
      setIsLoading(false);
      setConflictModal({ isOpen: false, pendingItem: null, currentRestaurantName: "" });
    }
  };

  const cancelReplaceCart = () => {
    setConflictModal({ isOpen: false, pendingItem: null, currentRestaurantName: "" });
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    setError(null);
    try {
      const updatedCart = await cartService.updateItemQuantity(cartItemId, {
        quantity,
      });
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
      throw err;
    }
  };

  const removeItem = async (cartItemId: number) => {
    setError(null);
    try {
      const updatedCart = await cartService.removeItem(cartItemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
      throw err;
    }
  };

  const clearCart = async () => {
    setError(null);
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (err: any) {
      setError(err.message || "Failed to clear cart");
      throw err;
    }
  };

  const items = cart?.items || cart?.cart_items || [];
  const itemCount =
    cart?.total_items !== undefined
      ? cart.total_items
      : items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal =
    cart?.subtotal !== undefined
      ? Number(cart.subtotal)
      : cart?.total_amount !== undefined
      ? Number(cart.total_amount)
      : items.reduce((sum, item) => {
          const rawPrice = item.food_item?.price ?? item.unit_price;
          const price = rawPrice !== undefined ? Number(rawPrice) : Number(item.item_total) / (item.quantity || 1);
          return sum + price * item.quantity;
        }, 0);

  const restaurant = cart?.restaurant || null;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        restaurant,
        isLoading,
        error,
        isBouncing,
        lastAddedNotification,
        conflictModal,
        addToCart,
        confirmReplaceCart,
        cancelReplaceCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        dismissAddedNotification: () => setLastAddedNotification(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
