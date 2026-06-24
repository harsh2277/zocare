import React, { useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, disabled, id, ...props }, ref) => {
    const reactId = useId();
    const selectId = id || reactId;

    const baseSelectStyles = `
      w-full bg-white text-neutral-900 border font-sans text-sm transition-all duration-200 rounded-md
      placeholder-neutral-400 outline-none appearance-none pr-10 pl-3.5 py-2.5
      hover:border-neutral-350
      focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
      disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200 disabled:pointer-events-none
      ${error ? "border-error-500 hover:border-error-600 focus:border-error-600 focus:ring-error-500/20" : "border-neutral-200"}
    `;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-neutral-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`${baseSelectStyles} ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom Chevron Arrow */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center justify-center pointer-events-none">
            <HugeiconsIcon icon={ChevronDownIcon} className="h-4.5 w-4.5" />
          </div>
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

Select.displayName = "Select";
