import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export const PageHeader = ({ title, subtitle, action, breadcrumb }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-neutral-300 text-xs">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
};
