"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Store, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "./ImageUpload";
import { CreateRestaurantRequest, Restaurant, UpdateRestaurantRequest } from "@/types";
import { LocationPicker, DetectedLocation } from "@/components/location/LocationPicker";

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRestaurantRequest | UpdateRestaurantRequest) => Promise<any>;
  initialData?: Restaurant | null;
}

export function RestaurantForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RestaurantFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setAddress(initialData.address || "");
      setImageUrl(initialData.image_url || null);
    } else {
      setName("");
      setDescription("");
      setAddress("");
      setImageUrl(null);
    }
    setErrors({});
    setApiError(null);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string | undefined> = {};
    if (!name.trim()) {
      errs.name = "Restaurant name is required";
    }
    if (!address.trim()) {
      errs.address = "Restaurant address is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateRestaurantRequest = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        address: address.trim(),
        image_url: imageUrl,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err.message || "Failed to save restaurant details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {initialData ? "Edit Restaurant Profile" : "Register Your Restaurant"}
              </h3>
              <p className="text-xs text-slate-500">
                Provide public restaurant and location details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 pt-4">
          {/* Error */}
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* GPS Auto-Detect Picker */}
          <LocationPicker
            onLocationDetected={(loc: DetectedLocation) => {
              const parts = [loc.address_line, loc.city, loc.state, loc.pincode].filter(Boolean);
              const fullAddr = parts.join(", ");
              setAddress(fullAddr);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Restaurant Name */}
          <Input
            label="Restaurant Name"
            placeholder="e.g. Mario's Authentic Pizzeria"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />

          {/* Physical Address */}
          <Input
            label="Physical Address / Area"
            placeholder="e.g. 45 C-Scheme, Ashok Nagar, Jaipur"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            error={errors.address}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              About / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell food lovers about your culinary specialties, hygiene standards, and secret recipes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            label="Restaurant Cover Photo"
            value={imageUrl}
            onChange={setImageUrl}
            presetCategory="restaurant"
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {initialData ? "Save Changes" : "Create Restaurant"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
