"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate landing based on role
        if (user.role === "SELLER") {
          router.replace("/seller/dashboard");
        } else if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Verifying your account..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
