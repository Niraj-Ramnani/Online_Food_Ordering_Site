import { fetchApi } from "./api";
import { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from "@/types";

export const addressService = {
  /**
   * Fetch all saved addresses for the authenticated user.
   */
  async getAddresses(): Promise<AddressResponse[]> {
    return fetchApi<AddressResponse[]>("/addresses", {
      method: "GET",
    });
  },

  /**
   * Fetch a single address by ID.
   */
  async getAddressById(addressId: number): Promise<AddressResponse> {
    return fetchApi<AddressResponse>(`/addresses/${addressId}`, {
      method: "GET",
    });
  },

  /**
   * Create a new delivery address.
   */
  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    return fetchApi<AddressResponse>("/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing delivery address.
   */
  async updateAddress(
    addressId: number,
    data: UpdateAddressRequest
  ): Promise<AddressResponse> {
    return fetchApi<AddressResponse>(`/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark an address as the sole default delivery address.
   */
  async setDefaultAddress(addressId: number): Promise<AddressResponse> {
    return fetchApi<AddressResponse>(`/addresses/${addressId}/default`, {
      method: "PATCH",
    });
  },

  /**
   * Delete an address by ID.
   */
  async deleteAddress(addressId: number): Promise<void> {
    return fetchApi<void>(`/addresses/${addressId}`, {
      method: "DELETE",
    });
  },
};
