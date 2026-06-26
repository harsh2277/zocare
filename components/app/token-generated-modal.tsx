"use client";
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface TokenGeneratedModalProps {
  patientName: string;
  doctorName: string;
  token: number | null;
  estWait?: string;
  onClose: () => void;
  onPrint?: () => void;
  onDone: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

export const TokenGeneratedModal = ({
  patientName,
  doctorName,
  token,
  estWait = "15 min",
  onClose,
  onPrint,
  onDone,
  onSecondary,
  secondaryLabel = "Back to Patients",
}: TokenGeneratedModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-800">Token Generated</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#e6f4f2] text-[#0d6e6b] flex items-center justify-center">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">Check In Successful!</h3>
            <p className="text-sm text-neutral-500 mt-1">
              {patientName} assigned to {doctorName}
            </p>
          </div>

          {/* Dashed token box */}
          <div className="w-full max-w-xs border border-dashed border-[#0d6e6b] bg-[#f4fcfb] rounded-2xl py-6 px-4 my-2">
            <span className="text-[10px] font-bold text-[#0d6e6b] uppercase tracking-widest block mb-1">TOKEN NUMBER</span>
            <span className="text-5xl font-black text-[#0d6e5c]">#{String(token ?? "").padStart(2, "0")}</span>
          </div>

          <p className="text-xs font-semibold text-neutral-500">Est. Wait: {estWait}</p>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="md" onClick={onPrint ?? (() => window.print())}>
              Print Token
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-[#0d6e6b] hover:bg-[#0b5c59] text-white border-0"
              onClick={onDone}
            >
              Done
            </Button>
          </div>
          {onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="text-xs font-semibold text-[#0d6e6b] hover:underline self-center"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
