export interface Address {
  id: number;
  user_id?: number;
  label: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressRequest {
  label: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export type AddressResponse = Address;
