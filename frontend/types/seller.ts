export interface CreateRestaurantRequest {
  name: string;
  description?: string | null;
  address: string;
  image_url?: string | null;
}

export interface UpdateRestaurantRequest {
  name?: string | null;
  description?: string | null;
  address?: string | null;
  image_url?: string | null;
}

export interface CreateFoodItemRequest {
  name: string;
  description?: string | null;
  category: string;
  price: number | string;
  image_url?: string | null;
}

export interface UpdateFoodItemRequest {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | string | null;
  image_url?: string | null;
}
