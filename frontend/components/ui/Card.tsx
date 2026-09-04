import React, { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  isHoverable?: boolean;
  isGlass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", isHoverable = false, isGlass = false, children, ...props }, ref) => {
    const glassStyle = isGlass
      ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
      : "bg-white dark:bg-slate-900";

    const hoverStyle = isHoverable
      ? "transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 hover:-translate-y-1"
      : "";

    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden ${glassStyle} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pb-3 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-bold text-slate-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
