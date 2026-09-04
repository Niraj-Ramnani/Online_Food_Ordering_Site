"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUser,
  setTokens,
  setUser as setStoredUser,
} from "@/utils/auth";
import { LoginRequest, RegisterRequest, User } from "@/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user profile on initial application load
  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Use cached user while fetching fresh profile
    const cachedUser = getUser();
    if (cachedUser) {
      setUserState(cachedUser);
    }

    try {
      const profile = await authService.getCurrentUser();
      setUserState(profile);
      setStoredUser(profile);
    } catch (err: any) {
      // If access token expired, try refreshing
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newTokens = await authService.refreshToken(refreshToken);
          setTokens(newTokens.access_token, newTokens.refresh_token);
          const profile = await authService.getCurrentUser();
          setUserState(profile);
          setStoredUser(profile);
        } catch {
          clearTokens();
          setUserState(null);
        }
      } else {
        clearTokens();
        setUserState(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const tokenResponse = await authService.login(credentials);
      setTokens(tokenResponse.access_token, tokenResponse.refresh_token);

      const userProfile = await authService.getCurrentUser();
      setUserState(userProfile);
      setStoredUser(userProfile);
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const registeredUser = await authService.register(data);
      // Auto-login after registration
      const tokenResponse = await authService.login({
        email: data.email,
        password: data.password,
      });
      setTokens(tokenResponse.access_token, tokenResponse.refresh_token);

      const userProfile = await authService.getCurrentUser();
      setUserState(userProfile);
      setStoredUser(userProfile);
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setUserState(null);
    router.push("/login");
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUserState(profile);
      setStoredUser(profile);
    } catch {
      // Ignore background refresh errors
    }
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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
