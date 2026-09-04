import { fetchApi } from "./api";
import { Address, CreateAddressDto, UpdateAddressDto } from "@/types/address";

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    return fetchApi<Address[]>("/addresses");
  },

  async getAddressById(id: number): Promise<Address> {
    return fetchApi<Address>(`/addresses/${id}`);
  },

  async createAddress(data: CreateAddressDto): Promise<Address> {
    const payload = {
      label: data.label || data.title || "Home",
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      is_default: data.is_default ?? false,
    };
    return fetchApi<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAddress(id: number, data: UpdateAddressDto): Promise<Address> {
    const payload = {
      ...(data.label || data.title ? { label: data.label || data.title } : {}),
      ...(data.address_line ? { address_line: data.address_line } : {}),
      ...(data.city ? { city: data.city } : {}),
      ...(data.state ? { state: data.state } : {}),
      ...(data.pincode ? { pincode: data.pincode } : {}),
      ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
      ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
      ...(data.is_default !== undefined ? { is_default: data.is_default } : {}),
    };
    return fetchApi<Address>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async setDefaultAddress(id: number): Promise<Address> {
    return fetchApi<Address>(`/addresses/${id}/default`, {
      method: "PATCH",
    });
  },

  async deleteAddress(id: number): Promise<void> {
    return fetchApi<void>(`/addresses/${id}`, {
      method: "DELETE",
    });
  },
};
