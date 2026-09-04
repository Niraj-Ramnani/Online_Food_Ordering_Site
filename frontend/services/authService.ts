import { fetchApi } from "./api";
import {
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types";

export const authService = {
  /**
   * Authenticate with email & password.
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    return fetchApi<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Register a new user with USER or SELLER role.
   */
  async register(data: RegisterRequest): Promise<User> {
    return fetchApi<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Exchange refresh token for new access and refresh tokens.
   */
  async refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
    return fetchApi<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current authenticated user profile from JWT access token.
   */
  async getCurrentUser(): Promise<User> {
    return fetchApi<User>("/auth/me", {
      method: "GET",
    });
  },
};
