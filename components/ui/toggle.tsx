"use client";

import React from "react";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled,
  ...props
}) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        {/* Toggle Bar */}
        <div className="w-11 h-6 bg-neutral-200 rounded-full transition-colors duration-200 peer-checked:bg-primary-600 flex items-center p-0.5">
          {/* Toggle Knob */}
          <div className={`h-5 w-5 bg-white rounded-full transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}></div>
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-neutral-800">{label}</span>}
    </label>
  );
};
