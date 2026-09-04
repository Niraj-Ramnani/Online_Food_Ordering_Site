"use client";

import { useState, useEffect, useCallback } from "react";
import { addressService } from "@/services/addressService";
import { Address, CreateAddressDto, UpdateAddressDto } from "@/types/address";
import { useAuth } from "./useAuth";

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      // Auto-select default address if available and not already selected
      if (data.length > 0) {
        const defaultAddr = data.find((a) => a.is_default);
        setSelectedAddressId((prev) =>
          prev && data.some((a) => a.id === prev)
            ? prev
            : defaultAddr ? defaultAddr.id : data[0].id
        );
      } else {
        setSelectedAddressId(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = async (data: CreateAddressDto) => {
    setError(null);
    try {
      const newAddress = await addressService.createAddress(data);
      await fetchAddresses();
      setSelectedAddressId(newAddress.id);
      return newAddress;
    } catch (err: any) {
      setError(err.message || "Failed to save address");
      throw err;
    }
  };

  const updateAddress = async (id: number, data: UpdateAddressDto) => {
    setError(null);
    try {
      const updated = await addressService.updateAddress(id, data);
      await fetchAddresses();
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update address");
      throw err;
    }
  };

  const setDefaultAddress = async (id: number) => {
    setError(null);
    try {
      const updated = await addressService.setDefaultAddress(id);
      await fetchAddresses();
      setSelectedAddressId(id);
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to set default address");
      throw err;
    }
  };

  const deleteAddress = async (id: number) => {
    setError(null);
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err: any) {
      setError(err.message || "Failed to delete address");
      throw err;
    }
  };

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || null;

  return {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    isLoading,
    error,
    refreshAddresses: fetchAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  };
}
