"use client";

import React from "react";

export interface StepItem {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number; // 0-indexed
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  className = ""
}) => {
  return (
    <div className={`w-full flex items-center justify-between font-sans ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            {/* Step Node */}
            <div className="flex items-center gap-3 relative">
              <div className={`
                h-9 w-9 rounded-full border flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 shrink-0
                ${isCompleted 
                  ? "bg-primary-600 border-primary-600 text-white" 
                  : isActive
                  ? "bg-white border-primary-600 text-primary-600 ring-2 ring-primary-500/10"
                  : "bg-white border-neutral-200 text-neutral-400"}
              `}>
                {isCompleted ? (
                  <svg
                    className="h-4.5 w-4.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="text-left">
                <p className={`
                  text-xs font-bold leading-tight tracking-tight
                  ${isActive ? "text-neutral-900" : isCompleted ? "text-neutral-800" : "text-neutral-400"}
                `}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-none">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connecting Bar */}
            {!isLast && (
              <div className="flex-1 mx-4 h-[2px] bg-neutral-100 rounded-full relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-500 ease-out"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
