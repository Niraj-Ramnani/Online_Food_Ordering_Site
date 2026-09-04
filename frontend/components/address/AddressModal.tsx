"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Home,
  Building,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationPicker, DetectedLocation } from "@/components/location/LocationPicker";
import { Address, CreateAddressDto, UpdateAddressDto } from "@/types/address";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAddressDto | UpdateAddressDto) => Promise<any>;
  initialData?: Address | null;
}

export function AddressModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AddressModalProps) {
  const [label, setLabel] = useState("Home");
  const [houseFlat, setHouseFlat] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [city, setCity] = useState("Jaipur");
  const [state, setState] = useState("Rajasthan");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || initialData.title || "Home");
      setAreaStreet(initialData.address_line || "");
      setHouseFlat("");
      setCity(initialData.city || "Jaipur");
      setState(initialData.state || "Rajasthan");
      setPincode(initialData.pincode || "");
      setLatitude(initialData.latitude ?? undefined);
      setLongitude(initialData.longitude ?? undefined);
      setIsDefault(initialData.is_default || false);
    } else {
      setLabel("Home");
      setHouseFlat("");
      setAreaStreet("");
      setCity("Jaipur");
      setState("Rajasthan");
      setPincode("");
      setLatitude(undefined);
      setLongitude(undefined);
      setIsDefault(false);
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

  // Handle GPS detection fill
  const handleLocationDetected = (loc: DetectedLocation) => {
    if (loc.address_line) {
      setAreaStreet(loc.address_line);
    }
    if (loc.city) {
      setCity(loc.city);
    }
    if (loc.state) {
      setState(loc.state);
    }
    if (loc.pincode) {
      setPincode(loc.pincode);
    }
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const validate = () => {
    const errs: Record<string, string | undefined> = {};
    if (!areaStreet.trim() && !houseFlat.trim()) {
      errs.address_line = "Address details or area are required";
    }
    if (!city.trim()) {
      errs.city = "City is required";
    }
    if (!pincode.trim()) {
      errs.pincode = "Pincode is required";
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
      const fullAddressLine = [houseFlat.trim(), areaStreet.trim()]
        .filter(Boolean)
        .join(", ");

      const payload: CreateAddressDto = {
        label,
        title: label,
        address_line: fullAddressLine,
        city: city.trim(),
        state: state.trim() || "Rajasthan",
        pincode: pincode.trim(),
        latitude,
        longitude,
        is_default: isDefault,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err.message || "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {initialData ? "Edit Saved Address" : "Add Delivery Address"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use 1-click GPS detection or enter details
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

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 pt-4">

        {/* API Error */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* 1. GPS Auto-Detect Picker */}
        <LocationPicker
          onLocationDetected={handleLocationDetected}
          currentLat={latitude}
          currentLng={longitude}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label selector: Home / Office / Other */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Save As
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: "Home", icon: Home, text: "Home" },
                { id: "Office", icon: Building, text: "Office" },
                { id: "Other", icon: Navigation, text: "Other" },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = label === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLabel(item.id)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* House / Flat / Block No. */}
          <Input
            label="House / Flat / Floor No. (Optional)"
            placeholder="e.g. Flat 304, Block B"
            value={houseFlat}
            onChange={(e) => setHouseFlat(e.target.value)}
          />

          {/* Street / Area / Landmark */}
          <Input
            label="Area / Street / Sector"
            placeholder="e.g. Sector 4, Malviya Nagar"
            value={areaStreet}
            onChange={(e) => {
              setAreaStreet(e.target.value);
              if (errors.address_line) {
                setErrors((prev) => ({ ...prev, address_line: undefined }));
              }
            }}
            error={errors.address_line}
          />

          {/* City, State & Pincode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              placeholder="e.g. Jaipur"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
              }}
              error={errors.city}
            />

            <Input
              label="State"
              placeholder="e.g. Rajasthan"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />

            <Input
              label="Pincode"
              placeholder="e.g. 302017"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
              }}
              error={errors.pincode}
            />
          </div>

          {/* Set as Default Checkbox */}
          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 border-slate-300"
            />
            <span>Set as my default delivery address</span>
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
              className="font-bold shadow-lg shadow-orange-500/20"
            >
              {initialData ? "Save Changes" : "Save Address"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
