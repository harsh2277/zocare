"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  BellIcon,
  Calendar01Icon,
  Clock01Icon
} from "@hugeicons/core-free-icons";

const pathMap: Record<string, string> = {
  "/doctor/dashboard": "Dashboard",
  "/doctor/patients": "My Patients",
  "/doctor/queue": "Queue",
  "/doctor/prescription": "Prescriptions",
  "/doctor/staff": "Users & Staff",
  "/doctor/billing": "Billing",
  "/doctor/reports": "Reports",
  "/doctor/settings": "Settings",
  "/doctor/help": "Help",
  "/doctor/profile": "Profile",
};

export const DoctorTopBar = () => {
  const pathname = usePathname();
  
  // Find matching title
  const currentTitle = Object.entries(pathMap).find(([key]) => 
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] || "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-[#e5e9f0] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      {/* Left side: Breadcrumb & Status */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base font-bold text-[#1e293b] whitespace-nowrap">{currentTitle}</span>
          <span className="text-[#cbd5e1] font-medium">/</span>
          <span className="text-xs font-semibold text-[#64748b] whitespace-nowrap">Doctor Portal · Morning Clinic</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#086f6c] bg-[#e6f2f2] border border-[#b2d8d6] rounded-full px-2.5 py-0.5 whitespace-nowrap select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#086f6c] inline-block" />
          Available
        </span>
      </div>

      {/* Center-Right: Search Input */}
      <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
        <div className="relative w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center">
            <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-[#94a3b8]" />
          </div>
          <input
            type="text"
            placeholder="Search patients, records..."
            className="w-full bg-[#f8fafc] text-sm text-[#1e293b] border border-[#e2e8f0] hover:border-[#cbd5e1] focus:border-[#086f6c] focus:ring-1 focus:ring-[#086f6c]/25 rounded-lg py-1.5 pl-9 pr-12 transition-all outline-none placeholder-[#94a3b8]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <kbd className="text-[10px] bg-white text-[#64748b] border border-[#e2e8f0] px-1.5 py-0.5 rounded font-sans font-semibold shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Calendar Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f5f9] border border-[#e2e8f0] text-[#475569] text-xs font-bold rounded-lg select-none whitespace-nowrap">
          <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
          <span>Mon, 23 Jun 2025</span>
        </div>

        {/* Time Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f5f9] border border-[#e2e8f0] text-[#475569] text-xs font-bold rounded-lg select-none whitespace-nowrap">
          <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
          <span>09:00 - 17:00</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 bg-white hover:bg-neutral-50 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:text-[#1e293b] transition-all cursor-pointer">
          <HugeiconsIcon icon={BellIcon} className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full border border-white" />
        </button>
      </div>
    </header>
  );
};
