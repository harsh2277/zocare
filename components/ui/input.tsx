"use client";

import React, { useState, useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ComponentType<any> | any;
  rightIcon?: React.ComponentType<any> | any;
  multiline?: boolean;
  rows?: number;
}

export const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      className = "",
      type = "text",
      label,
      error,
      leftIcon,
      rightIcon,
      multiline = false,
      rows = 4,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const reactId = useId();
    const inputId = id || reactId;

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    // Enforce matching rounded-md style configuration
    const baseInputStyles = `
      w-full bg-white text-neutral-900 border font-sans text-sm transition-all duration-200 rounded-md
      placeholder-neutral-400 outline-none
      hover:border-neutral-350
      focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
      disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200 disabled:pointer-events-none
      read-only:bg-neutral-50/50 read-only:border-neutral-200/80
      ${error ? "border-error-500 hover:border-error-600 focus:border-error-600 focus:ring-error-500/20" : "border-neutral-200"}
    `;

    const paddingStyles = `
      ${leftIcon ? "pl-10" : "px-3.5"}
      ${rightIcon || isPassword ? "pr-10" : "px-3.5"}
      py-2.5
    `;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-neutral-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        
        <div className="relative w-full">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center justify-center pointer-events-none">
              <HugeiconsIcon icon={leftIcon} className="h-4.5 w-4.5" />
            </div>
          )}

          {/* Form Control */}
          {multiline ? (
            <textarea
              id={inputId}
              ref={ref as any}
              disabled={disabled}
              rows={rows}
              className={`${baseInputStyles} px-3.5 py-2.5 ${className}`}
              {...(props as any)}
            />
          ) : (
            <input
              id={inputId}
              type={resolvedType}
              ref={ref as any}
              disabled={disabled}
              className={`${baseInputStyles} ${paddingStyles} ${className}`}
              {...props}
            />
          )}

          {/* Right Icon / Password Toggle */}
          {isPassword && !multiline ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none flex items-center justify-center"
            >
              <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} className="h-4.5 w-4.5" />
            </button>
          ) : rightIcon && !multiline ? (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center justify-center pointer-events-none">
              <HugeiconsIcon icon={rightIcon} className="h-4.5 w-4.5" />
            </div>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-bold text-error-600 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
