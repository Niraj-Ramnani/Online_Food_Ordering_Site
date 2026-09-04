"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressFormModal } from "@/components/address/AddressFormModal";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { addressService } from "@/services/addressService";
import { Address, CreateAddressRequest, UpdateAddressRequest } from "@/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateAddressRequest | UpdateAddressRequest
  ) => {
    if (editingAddress) {
      await addressService.updateAddress(editingAddress.id, data as UpdateAddressRequest);
    } else {
      await addressService.createAddress(data as CreateAddressRequest);
    }
    await loadAddresses();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this delivery address?")) {
      return;
    }
    setIsUpdating(true);
    try {
      await addressService.deleteAddress(id);
      await loadAddresses();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    setIsUpdating(true);
    try {
      await addressService.setDefaultAddress(id);
      await loadAddresses();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-7 h-7 text-orange-500" />
                Delivery Addresses
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage where you want your food deliveries dispatched
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Address
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading your addresses..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && addresses.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No saved addresses yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Add your home, office, or frequently used delivery locations for 1-click checkout.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
                + Add Your First Address
              </Button>
            </div>
          </div>
        )}

        {/* Address Cards List */}
        {!isLoading && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                isUpdating={isUpdating}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}

        {/* Address Modal Form */}
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingAddress}
        />
      </div>
    </ProtectedRoute>
  );
}
