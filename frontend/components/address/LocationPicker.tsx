"use client";

import React, { useState } from "react";
import { LocateFixed, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

const CITY_PRESETS = [
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
];

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(
          parseFloat(position.coords.latitude.toFixed(6)),
          parseFloat(position.coords.longitude.toFixed(6))
        );
        setIsLocating(false);
      },
      (error) => {
        setGpsError(error.message || "Unable to retrieve your location.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            GPS Coordinates (Optional)
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          isLoading={isLocating}
          onClick={handleGetCurrentLocation}
          leftIcon={<LocateFixed className="w-3.5 h-3.5 text-orange-500" />}
          className="text-xs py-1 h-7 bg-white dark:bg-slate-900"
        >
          Use My GPS
        </Button>
      </div>

      {gpsError && (
        <p className="text-xs text-rose-500 font-medium">{gpsError}</p>
      )}

      {/* Manual Lat / Lng Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Latitude (-90 to 90)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 26.9124"
            value={latitude !== undefined && latitude !== null ? latitude : ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : parseFloat(e.target.value);
              onChange(val, longitude ?? null);
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Longitude (-180 to 180)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 75.7873"
            value={longitude !== undefined && longitude !== null ? longitude : ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : parseFloat(e.target.value);
              onChange(latitude ?? null, val);
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Quick City Presets */}
      <div className="pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick Preset Locations
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CITY_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.lat, preset.lng)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
