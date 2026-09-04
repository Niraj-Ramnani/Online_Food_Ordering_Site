"use client";

import React, { useState, useEffect } from "react";
import { CreatePaymentOrderResponse, VerifyPaymentDto } from "@/types/payment";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2 } from "lucide-react";

interface RazorpayCheckoutProps {
  paymentData: CreatePaymentOrderResponse | null;
  customerName?: string;
  customerEmail?: string;
  onSuccess: (response: VerifyPaymentDto) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
  disabled?: boolean;
  autoOpen?: boolean;
  buttonLabel?: string;
  className?: string;
}

export function RazorpayCheckout({
  paymentData,
  customerName,
  customerEmail,
  onSuccess,
  onError,
  onDismiss,
  disabled = false,
  autoOpen = false,
  buttonLabel = "Pay with Razorpay",
  className,
}: RazorpayCheckoutProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay SDK script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      onError("Failed to load Razorpay payment gateway. Please check your internet connection.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in document cache
    };
  }, [onError]);

  const openRazorpay = () => {
    if (!paymentData) {
      onError("Payment information is not available.");
      return;
    }

    if (!window.Razorpay) {
      onError("Payment gateway is not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);

    const options = {
      key: paymentData.key_id,
      amount: paymentData.amount_in_paise,
      currency: paymentData.currency || "INR",
      name: "QuickBite",
      description: `Order #${paymentData.order_id}`,
      order_id: paymentData.razorpay_order_id,
      handler: function (response: any) {
        setIsProcessing(false);
        if (
          response.razorpay_payment_id &&
          response.razorpay_order_id &&
          response.razorpay_signature
        ) {
          onSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          onError("Incomplete payment response received.");
        }
      },
      prefill: {
        name: customerName || "",
        email: customerEmail || "",
      },
      theme: {
        color: "#f97316", // Orange accent color matching QuickBite branding
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          if (onDismiss) {
            onDismiss();
          }
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        const errorDetail =
          response?.error?.description || "Payment failed or was cancelled.";
        onError(errorDetail);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      onError(err.message || "Failed to initiate payment modal.");
    }
  };

  // Trigger autoOpen if requested once script and data are ready
  useEffect(() => {
    if (autoOpen && isScriptLoaded && paymentData && !isProcessing) {
      openRazorpay();
    }
  }, [autoOpen, isScriptLoaded, paymentData]);

  return (
    <Button
      type="button"
      onClick={openRazorpay}
      disabled={disabled || !isScriptLoaded || isProcessing || !paymentData}
      className={className || "w-full py-3 text-base font-semibold"}
      variant="primary"
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing Payment...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          {buttonLabel}
        </span>
      )}
    </Button>
  );
}
