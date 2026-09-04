export type UserRole = "USER" | "SELLER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
