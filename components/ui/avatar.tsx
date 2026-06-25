"use client";

import React, { useState } from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "avatar",
  fallback,
  size = "md",
  status,
  className = ""
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  const statusColors = {
    online: "bg-success-500 ring-white",
    offline: "bg-neutral-350 ring-white",
    away: "bg-warning-500 ring-white"
  };

  const statusSizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5"
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {/* Avatar Box */}
      <div className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center font-sans font-bold text-neutral-600
      `}>
        {src && !hasError ? (
          <img 
            src={src} 
            alt={alt} 
            onError={() => setHasError(true)} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <span>{fallback.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      {/* Status Dot */}
      {status && (
        <span className={`
          absolute bottom-0 right-0 rounded-full ring-2 
          ${statusColors[status]} 
          ${statusSizes[size]}
        `} />
      )}
    </div>
  );
};
