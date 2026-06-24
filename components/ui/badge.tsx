import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "neutral" | "success" | "info" | "warning" | "error";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-primary-50 text-primary-700 border border-primary-200",
    neutral: "bg-neutral-50 text-neutral-800 border border-neutral-200",
    success: "bg-success-50 text-success-700 border border-success-200",
    info: "bg-info-50 text-info-750 border border-info-200",
    warning: "bg-warning-50 text-warning-700 border border-warning-200",
    error: "bg-error-50 text-error-700 border border-error-200"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-xs font-bold uppercase tracking-wider ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
