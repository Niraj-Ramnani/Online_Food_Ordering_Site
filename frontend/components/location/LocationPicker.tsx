"use client";

import React, { useState } from "react";
import {
  MapPin,
  Crosshair,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DetectedLocation {
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  display_name?: string;
}

interface LocationPickerProps {
  onLocationDetected: (loc: DetectedLocation) => void;
  currentLat?: number | null;
  currentLng?: number | null;
  className?: string;
}

export function LocationPicker({
  onLocationDetected,
  currentLat,
  currentLng,
  className = "",
}: LocationPickerProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    currentLat && currentLng ? { lat: currentLat, lng: currentLng } : null
  );
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<DetectedLocation> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch address details");
      const data = await res.json();
      const addr = data.address || {};

      const street =
        addr.road ||
        addr.pedestrian ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.residential ||
        "";
      const suburb = addr.suburb || addr.neighbourhood || "";
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        "Jaipur";
      const state = addr.state || "Rajasthan";
      const pincode = addr.postcode || "";

      // Construct clean address line
      const addressParts = [street, suburb].filter(Boolean);
      const addressLine =
        addressParts.length > 0 ? addressParts.join(", ") : data.display_name?.split(",")[0] || "";

      return {
        address_line: addressLine,
        city,
        state,
        pincode,
        latitude: lat,
        longitude: lng,
        display_name: data.display_name,
      };
    } catch (err) {
      console.warn("Reverse geocode fallback:", err);
      return {
        address_line: "Detected Location",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "",
        latitude: lat,
        longitude: lng,
      };
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDetectedCoords({ lat, lng });

        try {
          const loc = await reverseGeocode(lat, lng);
          setLocationName(
            loc.address_line
              ? `${loc.address_line}, ${loc.city}`
              : `${loc.city}, ${loc.state}`
          );
          onLocationDetected(loc);
        } catch (err: any) {
          setError(err.message || "Failed to convert location coordinates.");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access or type manually."
          );
        } else {
          setError("Unable to retrieve location. Please try again or type manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-white dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-900 border border-orange-200/70 dark:border-slate-750 space-y-3.5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Instant GPS Auto-Detect
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fetch exact city, state, area & pin in 1-click
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="font-bold shrink-0 shadow-md shadow-orange-500/20 cursor-pointer text-xs flex items-center gap-1.5"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>Use Current Location</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Detected Location Status & Interactive Visual Map Pin */}
      {detectedCoords && (
        <div className="space-y-2 pt-1 border-t border-orange-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {locationName || "GPS Coordinates Pinpointed"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
              {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}
            </span>
          </div>

          {/* Interactive Map Embed */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800">
            <iframe
              title="Location Pin Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                detectedCoords.lng - 0.005
              }%2C${detectedCoords.lat - 0.005}%2C${
                detectedCoords.lng + 0.005
              }%2C${
                detectedCoords.lat + 0.005
              }&layer=mapnik&marker=${detectedCoords.lat}%2C${
                detectedCoords.lng
              }`}
              className="w-full h-full filter saturate-150 pointer-events-none"
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-black/5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span>Location Pinpointed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
