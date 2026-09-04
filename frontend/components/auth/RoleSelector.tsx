import React from "react";
import { CheckCircle2, Store, User as UserIcon } from "lucide-react";

export type SelectableRole = "USER" | "SELLER";

interface RoleSelectorProps {
  selectedRole: SelectableRole;
  onChange: (role: SelectableRole) => void;
}

export function RoleSelector({ selectedRole, onChange }: RoleSelectorProps) {
  const roles: {
    id: SelectableRole;
    title: string;
    subtitle: string;
    icon: typeof UserIcon;
  }[] = [
    {
      id: "USER",
      title: "Customer",
      subtitle: "Browse restaurants & order delicious food to your door",
      icon: UserIcon,
    },
    {
      id: "SELLER",
      title: "Restaurant Seller",
      subtitle: "List your restaurant, manage food menus & receive orders",
      icon: Store,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Account Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-orange-50/80 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {role.title}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {role.subtitle}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 text-orange-500">
                  <CheckCircle2 className="w-4 h-4 fill-orange-500 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
