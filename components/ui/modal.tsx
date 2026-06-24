"use client";

import React, { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { Button } from "./button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  // Prevent background scroll when modal is open
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-xl border border-neutral-300 p-6 flex flex-col justify-between space-y-6 max-h-[90vh] overflow-y-auto animate-modal-in relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-neutral-400 hover:text-neutral-600 rounded-[4px] hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
        </button>

        {/* Centered Healthcare Icon */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary-50 border border-primary-200/60 flex items-center justify-center text-primary-600">
          <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6" />
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">{title}</h3>
          <div className="text-sm text-neutral-500 leading-relaxed font-sans px-2">
            {children}
          </div>
        </div>

        {/* Stacked/Equal action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={onClose} className="w-full">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
