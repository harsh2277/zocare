"use client";

import React from "react";

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  showValue?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  showValue = false,
  className = ""
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full font-sans ${className}`}>
      {showValue && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-neutral-600">Progress</span>
          <span className="text-xs font-extrabold text-primary-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40">
        <div 
          className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
