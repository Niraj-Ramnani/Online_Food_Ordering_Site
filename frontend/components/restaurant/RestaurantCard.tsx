import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, ShieldCheck, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Restaurant } from "@/types";

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const {
    id,
    name,
    address,
    image_url,
    is_verified,
    is_open,
    cuisine = "Multi-Cuisine",
    rating = 4.8,
    delivery_time = "25-35 min",
    price_range = "$$",
  } = restaurant;

  const displayImage =
    image_url ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";

  const cardElement = (
    <Card
      isHoverable
      onClick={onClick}
      className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
    >
      {/* Image Container with Badges */}
      <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {is_open ? (
            <Badge variant="success" size="sm" className="bg-emerald-500 text-white border-0 shadow-sm font-bold">
              Open Now
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm" className="bg-slate-900/85 text-slate-300 border-0 shadow-sm">
              Closed
            </Badge>
          )}

          {is_verified && (
            <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm text-sky-600 dark:text-sky-400 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 fill-sky-600 dark:fill-sky-400 text-white" />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Bottom Image Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 font-semibold bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            {delivery_time}
          </span>
          <span className="font-medium bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
            {price_range}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-orange-500 transition-colors line-clamp-1">
              {name}
            </h4>
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs px-2 py-0.5 rounded-lg shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-1">
            {cuisine}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return cardElement;
  }

  return (
    <Link href={`/restaurants/${id}`} className="block h-full">
      {cardElement}
    </Link>
  );
}
