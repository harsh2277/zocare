"use client";

import React from "react";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({
  checked,
  label,
  disabled,
  ...props
}) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        {/* Custom Outer Circle */}
        <div className={`
          h-5 w-5 rounded-full border transition-all flex items-center justify-center
          ${checked 
            ? "border-primary-600 bg-white" 
            : "bg-white border-neutral-200 hover:border-neutral-350"}
        `}>
          {/* Custom Inner dot */}
          {checked && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>
          )}
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-neutral-800">{label}</span>}
    </label>
  );
};
