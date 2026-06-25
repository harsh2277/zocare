"use client";

import React, { useState } from "react";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-neutral-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-neutral-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-neutral-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-neutral-900 border-y-transparent border-l-transparent"
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-semibold font-sans text-white bg-neutral-900 backdrop-blur-sm rounded-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-zoom-in
            ${positionClasses[position]}
          `}
        >
          {content}
          <div className={`absolute border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
