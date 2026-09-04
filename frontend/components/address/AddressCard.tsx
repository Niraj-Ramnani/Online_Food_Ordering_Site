import React from "react";
import {
  Briefcase,
  CheckCircle2,
  Edit2,
  Home,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isUpdating?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isUpdating = false,
}: AddressCardProps) {
  const getIcon = () => {
    const l = address.label.toLowerCase();
    if (l.includes("home")) return Home;
    if (l.includes("work") || l.includes("office")) return Briefcase;
    return MapPin;
  };

  const Icon = getIcon();

  return (
    <div
      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
        address.is_default
          ? "border-orange-500/80 ring-2 ring-orange-500/15 shadow-md shadow-orange-500/10"
          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Label & Icon */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              address.is_default
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>

          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white capitalize">
              {address.label}
            </h4>
          </div>
        </div>

        {/* Default Badge */}
        {address.is_default && (
          <Badge
            variant="success"
            size="sm"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Default Delivery Address
          </Badge>
        )}
      </div>

      {/* Address Details */}
      <div className="mt-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <p className="font-medium leading-relaxed">{address.address_line}</p>
        <p className="text-slate-500 dark:text-slate-400">
          {address.city}, {address.state} - <span className="font-semibold">{address.pincode}</span>
        </p>
        {address.latitude && address.longitude && (
          <p className="text-[11px] text-slate-400">
            GPS: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {!address.is_default ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onSetDefault(address.id)}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Make Default</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            className="text-xs py-1.5 h-8"
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            disabled={isUpdating}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            className="text-xs py-1.5 h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
