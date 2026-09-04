"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImagePlus, Link as LinkIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  presetCategory?: "restaurant" | "food";
}

const FOOD_IMAGE_PRESETS = [
  { name: "Pizza", url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80" },
  { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80" },
  { name: "Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80" },
  { name: "Ramen", url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80" },
  { name: "Dessert", url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80" },
];

const RESTAURANT_IMAGE_PRESETS = [
  { name: "Italian Bistro", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80" },
  { name: "Modern Eatery", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80" },
  { name: "Cafe & Bar", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80" },
];

export function ImageUpload({
  value,
  onChange,
  label = "Image URL",
  presetCategory = "food",
}: ImageUploadProps) {
  const [customUrl, setCustomUrl] = useState(value || "");

  const presets =
    presetCategory === "restaurant"
      ? RESTAURANT_IMAGE_PRESETS
      : FOOD_IMAGE_PRESETS;

  const handleUrlChange = (val: string) => {
    setCustomUrl(val);
    onChange(val.trim() ? val.trim() : null);
  };

  return (
    <div className="space-y-3 text-left">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
        {label}
      </label>

      {/* Preview Box */}
      <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
        {value ? (
          <>
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => {
                  setCustomUrl("");
                  onChange(null);
                }}
                className="p-1.5 rounded-xl bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-1.5 p-4">
            <ImagePlus className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No image selected. Paste an image URL or choose a preset below.
            </p>
          </div>
        )}
      </div>

      {/* URL Input */}
      <Input
        placeholder="https://images.unsplash.com/..."
        value={customUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        leftIcon={<LinkIcon className="w-4 h-4" />}
      />

      {/* Preset Suggestions */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick High-Res Presets
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleUrlChange(preset.url)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
