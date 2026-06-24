import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ComponentType<any> | any;
  rightIcon?: React.ComponentType<any> | any;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Style configurations matching 4px border-radius explicitly via rounded-[4px]
    const baseStyles = "inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-md";

    const variantStyles = {
      primary: "bg-primary-600 hover:bg-primary-700 text-white border border-primary-750/15 focus:ring-2 focus:ring-primary-500/20",
      outline: "bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-neutral-350 focus:ring-2 focus:ring-neutral-500/10",
      ghost: "bg-transparent hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900",
      link: "bg-transparent text-primary-600 hover:text-primary-700 underline underline-offset-4 hover:underline-offset-2 !p-0"
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4.5 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5"
    };

    // If it's an icon-only button (no text children)
    const isIconOnly = !children;
    const iconSizeStyles = {
      sm: "p-1.5 text-xs",
      md: "p-2.5 text-sm",
      lg: "p-3.5 text-base"
    };

    const combinedStyles = `
      ${baseStyles} 
      ${variant === "link" ? "" : isIconOnly ? iconSizeStyles[size] : sizeStyles[size]} 
      ${variantStyles[variant]} 
      ${className}
    `.trim().replace(/\s+/g, " ");

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedStyles}
        {...props}
      >
        {loading && (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></div>
        )}
        {!loading && leftIcon && (
          <HugeiconsIcon icon={leftIcon} className="h-[1.25em] w-[1.25em] shrink-0" />
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <HugeiconsIcon icon={rightIcon} className="h-[1.25em] w-[1.25em] shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
