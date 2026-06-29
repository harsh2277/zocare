"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any> | any;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      {variant === "underline" ? (
        <div className="flex border-b border-neutral-200 gap-6 font-sans">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  pb-3 pt-1 text-sm font-semibold tracking-tight transition-all duration-200 relative cursor-pointer focus:outline-none select-none flex items-center gap-2 rounded-none
                  ${isActive
                    ? "text-[#0B6E6E] border-b-2 border-[#0B6E6E]"
                    : "text-neutral-500 hover:text-neutral-800 border-b-2 border-transparent"}
                `}
              >
                {tab.icon && (
                  <span className="shrink-0">{tab.icon}</span>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex bg-neutral-100 p-1 rounded-lg gap-1 font-sans max-w-max">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  px-4 py-1.5 text-xs font-bold rounded-md tracking-tight transition-all duration-200 cursor-pointer focus:outline-none select-none flex items-center gap-1.5
                  ${isActive
                    ? "bg-white text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-800"}
                `}
              >
                {tab.icon && (
                  <span className="shrink-0">{tab.icon}</span>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
