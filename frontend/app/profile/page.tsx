"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AddressModal } from "@/components/address/AddressModal";
import { Address, CreateAddressDto, UpdateAddressDto } from "@/types/address";
import {
  User,
  Mail,
  Shield,
  MapPin,
  Home,
  Building,
  Navigation,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    addresses,
    isLoading: isAddressLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Sign In to Access Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
          Please log in to manage your profile and saved delivery addresses.
        </p>
        <Link href="/login">
          <Button variant="primary" size="lg" className="font-bold">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateAddressDto | UpdateAddressDto) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
      showFeedback("Address updated successfully!");
    } else {
      await createAddress(data as CreateAddressDto);
      showFeedback("New address added successfully!");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this saved address?")) {
      try {
        await deleteAddress(id);
        showFeedback("Address deleted successfully.");
      } catch (err: any) {
        showFeedback(err.message || "Failed to delete address.");
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      showFeedback("Default address updated!");
    } catch (err: any) {
      showFeedback(err.message || "Failed to set default address.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Profile & Addresses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your personal info and quick delivery locations
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          className="font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Grid: Profile Info & Addresses Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: User Profile Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-orange-500/20">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Account Type</span>
                <Badge
                  variant={
                    user?.role === "ADMIN"
                      ? "danger"
                      : user?.role === "SELLER"
                      ? "orange"
                      : "info"
                  }
                  size="sm"
                >
                  {user?.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Saved Addresses</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {addresses.length} locations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Saved Delivery Addresses Hub */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Saved Delivery Addresses
              </h2>
            </div>
          </div>

          {isAddressLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
              <p className="text-sm">Loading your saved addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Saved Addresses Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Add your home, office, or favorite delivery location using 1-click GPS detection.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenCreateModal}
                className="font-bold"
              >
                Add My First Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const labelText = addr.label || addr.title || "Home";
                const Icon =
                  labelText === "Office"
                    ? Building
                    : labelText === "Home"
                    ? Home
                    : Navigation;

                return (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-3.5 relative flex flex-col justify-between ${
                      addr.is_default
                        ? "border-orange-500 shadow-md shadow-orange-500/5 ring-1 ring-orange-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Top Row: Label Badge & Default Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {labelText}
                          </span>
                        </div>

                        {addr.is_default && (
                          <Badge variant="success" size="sm" className="font-bold text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>

                      {/* Address Text */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        {addr.address_line}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {!addr.is_default ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Primary Address</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(addr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit address"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Address Create / Edit Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingAddress}
      />
    </div>
  );
}
