"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Search,
  ShoppingBag,
  Bell,
  Menu,
  X,
  MapPin,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Store,
  ShieldCheck,
  PackageCheck,
  LayoutDashboard,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
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
    <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Quick<span className="text-orange-500">Bite</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase -mt-1">
                Fast & Fresh
              </span>
            </div>
          </Link>

          {/* Delivery Location Selector (Desktop - Customer Only) */}
          {(!user || user.role === "USER") && (
            <Link
              href="/addresses"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-orange-400 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                Deliver to:
              </span>
              <span className="truncate max-w-[140px] text-slate-500 dark:text-slate-400">
                Manage Addresses
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Link>
          )}

          {/* Search Bar (Desktop - Customer Only) */}
          {(!user || user.role === "USER") && (
            <div className="hidden md:flex flex-1 max-w-md relative items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for restaurants, dishes, or cuisines..."
                className="w-full bg-slate-100/80 dark:bg-slate-900/80 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          )}

          {/* Navigation Links (Role Based) */}
          <div className="hidden md:flex items-center gap-3">
            {/* SELLER ROLE LINKS */}
            {user?.role === "SELLER" && (
              <>
                <Link
                  href="/seller/dashboard"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 px-2 py-1.5 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/seller/dashboard#restaurant"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5 flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>My Restaurant</span>
                </Link>
                <Link
                  href="/seller/dashboard#food-items"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5"
                >
                  Food Items
                </Link>
                <Link
                  href="/seller/dashboard#orders"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5"
                >
                  Orders
                </Link>
              </>
            )}

            {/* ADMIN ROLE LINKS */}
            {user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 px-2 py-1.5 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  href="/admin/dashboard#users"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5"
                >
                  Users
                </Link>
                <Link
                  href="/admin/dashboard#restaurants"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5"
                >
                  Restaurants
                </Link>
                <Link
                  href="/admin/dashboard#orders"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 px-2 py-1.5"
                >
                  Platform Orders
                </Link>
              </>
            )}

            {/* CUSTOMER / LOGGED OUT LINKS */}
            {(!user || user.role === "USER") && (
              <>
                <Link
                  href="/restaurants"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1.5 transition-colors"
                >
                  Restaurants
                </Link>
                <Link
                  href="/#offers"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1.5 transition-colors flex items-center gap-1"
                >
                  Offers
                  <Badge variant="orange" size="sm" className="text-[10px] px-1.5 py-0">
                    HOT
                  </Badge>
                </Link>

                {user && (
                  <Link
                    href="/customer/orders"
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 px-2 py-1.5 transition-colors"
                  >
                    My Orders
                  </Link>
                )}

                {/* Notifications Icon */}
                <button
                  type="button"
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                </button>

                {/* Cart Icon */}
                <Link href="/cart">
                  <button
                    type="button"
                    className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                    aria-label="Cart"
                  >
                    <div className="relative">
                      <ShoppingBag className="w-5 h-5" />
                      {totalItemsCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                          {totalItemsCount}
                        </span>
                      )}
                    </div>
                  </button>
                </Link>
              </>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

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
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400 transition-colors cursor-pointer"
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
                          <Badge variant="danger" size="sm">ADMINISTRATOR</Badge>
                        )}
                        {user?.role === "SELLER" && (
                          <Badge variant="orange" size="sm">RESTAURANT SELLER</Badge>
                        )}
                        {user?.role === "USER" && (
                          <Badge variant="info" size="sm">CUSTOMER</Badge>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {user?.role === "SELLER" && (
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-500" />
                          <span>Seller Dashboard</span>
                        </Link>
                      )}

                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-500" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      {user?.role === "USER" && (
                        <>
                          <Link
                            href="/customer/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <PackageCheck className="w-4 h-4 text-orange-500" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/addresses"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>Saved Addresses</span>
                          </Link>
                          <Link
                            href="/cart"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                            <span>Cart ({totalItemsCount})</span>
                          </Link>
                        </>
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

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart">
              <button
                type="button"
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
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
                variant={user.role === "ADMIN" ? "danger" : user.role === "SELLER" ? "orange" : "info"}
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
              className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Home
            </Link>

            {user?.role === "SELLER" && (
              <Link
                href="/seller/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Seller Dashboard
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Admin Control Center
              </Link>
            )}

            {(!user || user.role === "USER") && (
              <>
                <Link
                  href="/restaurants"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Restaurants
                </Link>
                <Link
                  href="/#offers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-between"
                >
                  <span>Offers & Deals</span>
                  <Badge variant="orange" size="sm">
                    50% OFF
                  </Badge>
                </Link>
                {user && (
                  <>
                    <Link
                      href="/customer/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/addresses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      Delivery Addresses
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-between"
                    >
                      <span>Your Cart</span>
                      <Badge variant="orange" size="sm">
                        {totalItemsCount}
                      </Badge>
                    </Link>
                  </>
                )}
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
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
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
