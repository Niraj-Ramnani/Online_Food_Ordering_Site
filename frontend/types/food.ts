export interface FoodItem {
  id: number;
  restaurant_id: number;
  restaurant_name?: string;
  name: string;
  category: string;
  description?: string | null;
  price: string | number;
  image_url?: string | null;
  is_available: boolean;
  rating?: number;
  is_veg?: boolean;
  calories?: number;
  created_at?: string;
  updated_at?: string;
}

export type FoodItemResponse = FoodItem;
