"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

export default function AdminUsersPage() {
  const { users, isLoading, error, fetchUsers, updateUserStatus } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    setActionLoadingId(userId);
    try {
      await updateUserStatus(userId, !currentActive);
    } catch {
      // Error handled by hook
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer and seller accounts across the platform
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((userItem) => {
                  const isActing = actionLoadingId === userItem.id;
                  const formattedDate = new Date(
                    userItem.created_at
                  ).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={userItem.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {userItem.name}
                          </p>
                          <p className="text-xs text-slate-400">{userItem.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            userItem.role === "ADMIN"
                              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                              : userItem.role === "SELLER"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {userItem.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {userItem.role !== "ADMIN" && (
                          <Button
                            variant={userItem.is_active ? "outline" : "primary"}
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(userItem.id, userItem.is_active)
                            }
                            disabled={isActing}
                            className={
                              userItem.is_active
                                ? "text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                : "text-xs"
                            }
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : userItem.is_active ? (
                              <>
                                <UserX className="w-3.5 h-3.5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
