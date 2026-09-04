"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  X,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, isBouncing } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Hide Navbar on authentication pages (login, register)
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isAuthPage) return null;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0 select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Quick<span className="text-orange-500">Bite</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links (Role Based) */}
          <div className="hidden md:flex items-center gap-4">
            {/* SELLER ROLE LINKS */}
            {user?.role === "SELLER" && (
              <>
                <Link
                  href="/seller/dashboard"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 px-2 py-1 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/seller/orders"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1 flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4 text-slate-400" />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/seller/food"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1 flex items-center gap-1.5"
                >
                  <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                  <span>Food Items</span>
                </Link>
                <Link
                  href="/seller/restaurant"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1 flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>Restaurant</span>
                </Link>
              </>
            )}

            {/* ADMIN ROLE LINKS */}
            {user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 px-2 py-1 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1"
                >
                  Users
                </Link>
                <Link
                  href="/admin/restaurants"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1"
                >
                  Restaurants
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1"
                >
                  Orders
                </Link>
              </>
            )}

            {/* CUSTOMER / LOGGED OUT LINKS */}
            {(!user || user.role === "USER") && (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/#restaurants"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1 transition-colors"
                >
                  Restaurants
                </Link>

                {user && (
                  <>
                    <Link
                      href="/orders"
                      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/profile"
                      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1 transition-colors"
                    >
                      Saved Addresses
                    </Link>
                  </>
                )}

                {/* Cart Icon Link with Bouncy Animation */}
                <Link
                  href="/cart"
                  className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isBouncing
                      ? "scale-125 bg-orange-100 dark:bg-orange-950/60 text-orange-600 ring-2 ring-orange-500 shadow-lg shadow-orange-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className={`w-5 h-5 ${isBouncing ? "animate-bounce text-orange-600" : ""}`} />
                  {itemCount > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 transition-transform ${isBouncing ? "scale-125 animate-pulse" : ""}`}>
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* AUTH STATE: LOGGED OUT VS LOGGED IN */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              /* User Profile Dropdown Menu */
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Profile Dropdown Content */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                      <div className="mt-2">
                        {user?.role === "ADMIN" && (
                          <Badge variant="danger" size="sm">
                            ADMINISTRATOR
                          </Badge>
                        )}
                        {user?.role === "SELLER" && (
                          <Badge variant="orange" size="sm">
                            RESTAURANT SELLER
                          </Badge>
                        )}
                        {user?.role === "USER" && (
                          <Badge variant="info" size="sm">
                            CUSTOMER
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Common: Profile & Addresses */}
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                      >
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>My Profile & Addresses</span>
                      </Link>

                      {user?.role === "SELLER" && (
                        <>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <LayoutDashboard className="w-4 h-4 text-orange-500" />
                            <span>Seller Dashboard</span>
                          </Link>
                          <Link
                            href="/seller/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <PackageCheck className="w-4 h-4 text-orange-500" />
                            <span>Restaurant Orders</span>
                          </Link>
                        </>
                      )}

                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {user?.role === "USER" && (
                        <Link
                          href="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <PackageCheck className="w-4 h-4 text-orange-500" />
                          <span>My Orders</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button & Quick Cart */}
          <div className="flex items-center gap-2 md:hidden">
            {(!user || user.role === "USER") && (
              <Link
                href="/cart"
                className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isBouncing
                    ? "scale-125 bg-orange-100 dark:bg-orange-950/60 text-orange-600 ring-2 ring-orange-500"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${isBouncing ? "animate-bounce text-orange-600" : ""}`} />
                {itemCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${isBouncing ? "scale-125 animate-pulse" : ""}`}>
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated && user && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-sm uppercase">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                  {user.email}
                </span>
              </div>
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "danger"
                    : user.role === "SELLER"
                    ? "orange"
                    : "info"
                }
                size="sm"
              >
                {user.role}
              </Badge>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Home
            </Link>

            {isAuthenticated && (
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>My Profile & Addresses</span>
              </Link>
            )}

            {user?.role === "SELLER" && (
              <>
                <Link
                  href="/seller/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Seller Dashboard
                </Link>
                <Link
                  href="/seller/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Restaurant Orders
                </Link>
                <Link
                  href="/seller/food"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Food Management
                </Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Users
                </Link>
                <Link
                  href="/admin/restaurants"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Restaurants
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Orders
                </Link>
              </>
            )}

            {(!user || user.role === "USER") && (
              <>
                <Link
                  href="/#restaurants"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Restaurants
                </Link>
                {user && (
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    My Orders
                  </Link>
                )}
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-between"
                >
                  <span>My Cart</span>
                  {itemCount > 0 && (
                    <Badge variant="orange" size="sm">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </Badge>
                  )}
                </Link>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="md" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
