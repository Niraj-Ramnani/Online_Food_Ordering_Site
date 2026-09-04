"use client";

import { useCartContext } from "@/context/CartContext";

export function useCart() {
  const context = useCartContext();

  return {
    cart: context.cart,
    items: context.items,
    itemCount: context.itemCount,
    totalAmount: context.subtotal,
    subtotal: context.subtotal,
    restaurant: context.restaurant,
    isLoading: context.isLoading,
    error: context.error,
    isBouncing: context.isBouncing,
    lastAddedNotification: context.lastAddedNotification,
    conflictModal: context.conflictModal,
    refreshCart: context.refreshCart,
    addToCart: context.addToCart,
    confirmReplaceCart: context.confirmReplaceCart,
    cancelReplaceCart: context.cancelReplaceCart,
    updateQuantity: context.updateQuantity,
    removeItem: context.removeItem,
    clearCart: context.clearCart,
    dismissAddedNotification: context.dismissAddedNotification,
  };
}
