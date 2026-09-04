"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Check, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationPicker } from "./LocationPicker";
import { Address, CreateAddressRequest, UpdateAddressRequest } from "@/types";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAddressRequest | UpdateAddressRequest) => Promise<void>;
  initialData?: Address | null;
}

const PRESET_LABELS = ["Home", "Work", "Other"];

export function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AddressFormModalProps) {
  const [label, setLabel] = useState("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (PRESET_LABELS.includes(initialData.label)) {
        setLabel(initialData.label);
        setCustomLabel("");
      } else {
        setLabel("Other");
        setCustomLabel(initialData.label);
      }
      setAddressLine(initialData.address_line);
      setCity(initialData.city);
      setState(initialData.state);
      setPincode(initialData.pincode);
      setLatitude(initialData.latitude ?? null);
      setLongitude(initialData.longitude ?? null);
      setIsDefault(initialData.is_default);
    } else {
      setLabel("Home");
      setCustomLabel("");
      setAddressLine("");
      setCity("");
      setState("");
      setPincode("");
      setLatitude(null);
      setLongitude(null);
      setIsDefault(false);
    }
    setErrors({});
    setApiError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const finalLabel = label === "Other" && customLabel.trim() ? customLabel.trim() : label;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!finalLabel.trim()) {
      errs.label = "Label is required";
    }
    if (!addressLine.trim()) {
      errs.addressLine = "Street address is required";
    }
    if (!city.trim()) {
      errs.city = "City is required";
    }
    if (!state.trim()) {
      errs.state = "State is required";
    }
    if (!pincode.trim()) {
      errs.pincode = "Pincode is required";
    }

    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      errs.coords = "Latitude must be between -90 and 90";
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      errs.coords = "Longitude must be between -180 and 180";
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
      const payload: CreateAddressRequest = {
        label: finalLabel,
        address_line: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude,
        longitude,
        is_default: isDefault,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err.message || "Failed to save address. Please check fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {initialData ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label Pill Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
              Address Label
            </label>
            <div className="flex gap-2">
              {PRESET_LABELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLabel(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    label === item
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {label === "Other" && (
              <div className="mt-2.5">
                <Input
                  placeholder="e.g. Grandma's House, Vacation Villa"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  error={errors.label}
                />
              </div>
            )}
          </div>

          {/* Address Line */}
          <Input
            label="Street Address / Flat / Floor"
            placeholder="e.g. Flat 402, Sunshine Apartments, 12th Main Road"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            error={errors.addressLine}
          />

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="e.g. Jaipur"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
            />
            <Input
              label="State"
              placeholder="e.g. Rajasthan"
              value={state}
              onChange={(e) => setState(e.target.value)}
              error={errors.state}
            />
          </div>

          {/* Pincode */}
          <Input
            label="Pincode / Postal Code"
            placeholder="e.g. 302001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            error={errors.pincode}
          />

          {/* Location Picker */}
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
          {errors.coords && (
            <p className="text-xs text-rose-500 font-medium">{errors.coords}</p>
          )}

          {/* Default Checkbox */}
          <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Set as default delivery address
            </span>
          </label>

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
              {initialData ? "Save Changes" : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
