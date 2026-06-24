"use client";

import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled,
  ...props
}) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        {/* Checkbox box with spring-back click animation */}
        <div className={`
          h-5 w-5 rounded-[4px] border transition-all duration-200 flex items-center justify-center active:scale-90
          ${checked 
            ? "bg-primary-600 border-primary-600 text-white" 
            : "bg-white border-neutral-200 hover:border-neutral-350"}
        `}>
          <div className={`transition-all duration-250 ${checked ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-12 opacity-0"}`}>
            <svg
              className="h-3 w-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-neutral-800">{label}</span>}
    </label>
  );
};
