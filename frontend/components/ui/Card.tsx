import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isHoverable?: boolean;
}

export function Card({
  children,
  className = "",
  isHoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ${
        isHoverable
          ? "transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 ${className}`} {...props}>
      {children}
    </div>
  );
}
