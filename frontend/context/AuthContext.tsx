"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/utils/auth";
import { LoginRequest, RegisterRequest, User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize Auth state from localStorage tokens
  useEffect(() => {
    async function initAuth() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        if (accessToken) {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } else if (refreshToken) {
          // Attempt refresh
          const tokenRes = await authService.refreshToken({
            refresh_token: refreshToken,
          });
          setTokens(tokenRes.access_token, tokenRes.refresh_token);
          const profile = await authService.getCurrentUser();
          setUser(profile);
        }
      } catch {
        // Tokens expired or invalid
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<User> => {
    const tokenRes = await authService.login(data);
    setTokens(tokenRes.access_token, tokenRes.refresh_token);
    const profile = await authService.getCurrentUser();
    setUser(profile);
    return profile;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    // 1. Create account
    await authService.register(data);
    // 2. Automatically log in to obtain tokens
    const profile = await login({
      email: data.email,
      password: data.password,
    });
    return profile;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
