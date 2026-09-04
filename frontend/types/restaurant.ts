export interface Restaurant {
  id: number;
  seller_id?: number;
  name: string;
  description?: string | null;
  address: string;
  image_url?: string | null;
  is_verified: boolean;
  is_open: boolean;
  cuisine?: string;
  rating?: number;
  review_count?: number;
  delivery_time?: string;
  price_range?: string;
  created_at?: string;
  updated_at?: string;
}

export type PublicRestaurantResponse = Restaurant;
export type RestaurantResponse = Restaurant;
