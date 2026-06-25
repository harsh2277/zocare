import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

export interface EmptyStateProps {
  icon: React.ComponentType<any> | any;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
        <HugeiconsIcon icon={icon} className="w-7 h-7 text-neutral-400" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 max-w-xs mb-4">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
