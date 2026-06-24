"use client";

import React, { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Button } from "./button";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = "Configure your preferences",
  confirmText = "Apply Changes",
  cancelText = "Close",
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = onConfirm || onClose;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border-l border-neutral-200/80 h-full flex flex-col justify-between transform transition-transform duration-300 ease-in-out animate-drawer-in rounded-l-[24px] shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
              <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[17px] text-neutral-900 tracking-tight leading-none">{title}</h3>
              <p className="text-[12px] text-neutral-450 mt-1 font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100/80 transition-all cursor-pointer border border-transparent hover:border-neutral-200/40"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 text-sm text-neutral-600 leading-relaxed overflow-y-auto font-sans bg-white">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50/60 flex items-center gap-3">
          <Button variant="outline" size="md" onClick={onClose} className="flex-1 font-bold">
            {cancelText}
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm} className="flex-1 font-bold shadow-sm shadow-primary-600/10">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

