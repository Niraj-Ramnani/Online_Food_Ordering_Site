import { fetchApi } from "./api";
import { LoginRequest, RegisterRequest, TokenResponse, User } from "@/types";

export const authService = {
  /**
   * Authenticate a user with email and password.
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return fetchApi<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new customer or seller account.
   */
  async register(data: RegisterRequest): Promise<User> {
    return fetchApi<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch authenticated user profile details from backend using Bearer token.
   */
  async getCurrentUser(): Promise<User> {
    return fetchApi<User>("/auth/me", {
      method: "GET",
    });
  },

  /**
   * Refresh expired access token using refresh token.
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return fetchApi<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
