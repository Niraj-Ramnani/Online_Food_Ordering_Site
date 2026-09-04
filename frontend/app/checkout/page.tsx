"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { CreatePaymentOrderResponse, VerifyPaymentDto } from "@/types/payment";
import { RazorpayCheckout } from "@/components/payment/RazorpayCheckout";
import { AddressModal } from "@/components/address/AddressModal";
import { CreateAddressDto, UpdateAddressDto } from "@/types/address";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  MapPin,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShoppingBag,
  Loader2,
  Home,
  Building,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cart, items, totalAmount, refreshCart, isLoading: isCartLoading } = useCart();
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    createAddress,
    isLoading: isAddressLoading,
  } = useAddresses();

  // State for order flow
  const [description, setDescription] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState<CreatePaymentOrderResponse | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleCreateAddressFromModal = async (data: CreateAddressDto | UpdateAddressDto) => {
    try {
      const created = await createAddress(data as CreateAddressDto);
      setSelectedAddressId(created.id);
      setIsAddingAddress(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save address.");
    }
  };

  // Auth guard
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Sign In Required
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Please log in to complete your checkout and place your order.
        </p>
        <Link href="/login">
          <Button variant="primary" className="w-full">
            Log In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  // Cart empty guard
  if (!isCartLoading && items.length === 0 && !createdOrderId) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Add some delicious food from your favorite restaurants to proceed.
        </p>
        <Link href="/">
          <Button variant="primary" className="w-full">
            Browse Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  // 1. Customer initiates order creation and payment generation
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage("Please select or add a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage(null);

    try {
      // Step A: Create order in backend
      const order = await orderService.checkout({
        address_id: selectedAddressId,
        description: description.trim() || undefined,
      });

      setCreatedOrderId(order.id);

      // Step B: Generate Razorpay payment order
      const paymentOrder = await paymentService.createPaymentOrder(order.id);
      setPaymentData(paymentOrder);
      setIsPaymentReady(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  // 2. Razorpay payment success handler
  const handlePaymentSuccess = async (verifyData: VerifyPaymentDto) => {
    setErrorMessage(null);
    try {
      await paymentService.verifyPayment(verifyData);
      await refreshCart();
      if (createdOrderId) {
        router.push(`/orders/${createdOrderId}?payment=success`);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Payment verification failed. Please contact support if amount was debited."
      );
    }
  };

  const handlePaymentError = (errMsg: string) => {
    setErrorMessage(errMsg);
    setIsPlacingOrder(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/cart"
          className="p-2 rounded-xl text-slate-600 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Checkout
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Confirm your delivery address and payment details
          </p>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="text-sm">
            <p className="font-semibold">Checkout Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Address Selection Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delivery Address
                </h2>
              </div>

              {!isAddingAddress && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingAddress(true)}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add New
                </Button>
              )}
            </div>

            {isAddressLoading ? (
              <div className="py-6 flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              /* No Address State */
              <div className="py-6 text-center text-slate-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium">No delivery address found.</p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-3 font-bold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Delivery Address (Auto-Detect GPS)
                </Button>
              </div>
            ) : (
              /* Saved Address Cards */
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {(addr.label || addr.title || "").toLowerCase().includes("work") ||
                          (addr.label || addr.title || "").toLowerCase().includes("office") ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {addr.label || addr.title || "Address"}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {addr.address_line}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Order Notes / Delivery Instructions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delivery Instructions
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Add any special directions or requests for the rider/restaurant.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Please leave the order at the door / Ring the bell twice."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Payment Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm pt-2 first:pt-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.food_item?.name || `Item #${item.food_item_id}`}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{Number(item.item_total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Amount</span>
                <span className="text-orange-600 dark:text-orange-400">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action / Payment section */}
            <div className="mt-6">
              {!isPaymentReady ? (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full py-3 text-base font-semibold"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId || items.length === 0}
                >
                  {isPlacingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Order...
                    </span>
                  ) : (
                    `Proceed to Payment (₹${totalAmount.toFixed(2)})`
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs">
                    Order #{createdOrderId} created! Complete payment below.
                  </div>
                  <RazorpayCheckout
                    paymentData={paymentData}
                    customerName={user?.name}
                    customerEmail={user?.email}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    autoOpen={true}
                    buttonLabel={`Pay ₹${totalAmount.toFixed(2)} via Razorpay`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal with GPS Detection */}
      <AddressModal
        isOpen={isAddingAddress}
        onClose={() => setIsAddingAddress(false)}
        onSubmit={handleCreateAddressFromModal}
      />
    </div>
  );
}
