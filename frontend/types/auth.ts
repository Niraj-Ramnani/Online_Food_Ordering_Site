import { User, UserRole } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "USER" | "SELLER";
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
