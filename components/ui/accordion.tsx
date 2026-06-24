"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
  className = ""
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const isExpanded = onToggle ? isOpen : localOpen;
  const handleToggle = onToggle || (() => setLocalOpen(!localOpen));

  return (
    <div className={`border border-neutral-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-sans font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer select-none"
      >
        <span className="text-sm tracking-tight">{title}</span>
        <HugeiconsIcon 
          icon={ArrowDown01Icon} 
          className={`h-4.5 w-4.5 text-neutral-400 transition-transform duration-350 ${isExpanded ? "rotate-180 text-primary-600" : ""}`} 
        />
      </button>

      <div 
        className={`transition-all duration-350 ease-in-out overflow-hidden`}
        style={{
          maxHeight: isExpanded ? "300px" : "0px",
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div className="px-5 pb-5 pt-0 text-sm text-neutral-500 font-sans leading-relaxed border-t border-neutral-100 bg-neutral-50/20">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface AccordionProps {
  items: { title: string; content: React.ReactNode; id: string }[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className = "" }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};
