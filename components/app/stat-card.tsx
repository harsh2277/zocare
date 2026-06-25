import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any> | any;
  iconColor?: "primary" | "success" | "warning" | "error" | "info";
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

const iconColorMap = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error:   "bg-error-50 text-error-600",
  info:    "bg-info-50 text-info-600",
};

export const StatCard = ({ title, value, subtitle, icon, iconColor = "primary", trend, className = "" }: StatCardProps) => {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${isPositiveTrend ? "text-success-600" : "text-error-600"}`}>
              <span>{isPositiveTrend ? "+" : ""}{trend.value}%</span>
              {trend.label && <span className="font-normal text-neutral-500">{trend.label}</span>}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-3 ${iconColorMap[iconColor]}`}>
          <HugeiconsIcon icon={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
