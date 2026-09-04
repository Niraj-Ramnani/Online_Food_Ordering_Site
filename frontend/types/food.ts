export interface FoodItem {
  id: number;
  restaurant_id: number;
  restaurant_name?: string;
  name: string;
  description?: string | null;
  category: string;
  price: string | number;
  image_url?: string | null;
  is_available: boolean;
  rating?: number;
  is_veg?: boolean;
}
