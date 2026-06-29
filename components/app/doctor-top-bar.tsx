"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon, BellIcon, ChevronDownIcon, LogoutSquare01Icon,
  CheckmarkCircle01Icon, Clock01Icon, UserIcon, Cancel01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const pathMap: Record<string, { title: string; breadcrumb: string }> = {
  "/doctor/dashboard": { title: "Dashboard", breadcrumb: "Doctor Portal · Morning Clinic" },
  "/doctor/patients": { title: "My Patients", breadcrumb: "Doctor Portal · Morning Clinic" },
  "/doctor/queue": { title: "Queue", breadcrumb: "Doctor Portal · Live Queue" },
  "/doctor/prescription": { title: "Prescriptions", breadcrumb: "Doctor Portal · Morning Clinic" },
  "/doctor/staff": { title: "Users & Staff", breadcrumb: "Doctor Portal · Administration" },
  "/doctor/billing": { title: "Billing", breadcrumb: "Doctor Portal · Finance" },
  "/doctor/reports": { title: "Reports", breadcrumb: "Doctor Portal · Analytics" },
  "/doctor/settings": { title: "Settings", breadcrumb: "Doctor Portal · Configuration" },
  "/doctor/help": { title: "Help & Docs", breadcrumb: "Doctor Portal · Knowledgebase" },
  "/doctor/profile": { title: "Profile", breadcrumb: "Doctor Portal · Account" },
};

const notifications = [
  { icon: UserIcon, color: "text-primary-600 bg-primary-50", title: "New patient in queue", desc: "Zainab Bibi is waiting in room 3", time: "2 min ago", unread: true },
  { icon: CheckmarkCircle01Icon, color: "text-success-600 bg-success-50", title: "Prescription sent", desc: "Prescription sent to pharmacy for Ahmed Khan", time: "10 min ago", unread: false },
  { icon: Clock01Icon, color: "text-neutral-500 bg-neutral-100", title: "Schedule update", desc: "Morning shift is 58% complete", time: "1 hr ago", unread: false },
];

export const DoctorTopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Find matching title
  const meta = Object.entries(pathMap).find(([key]) => 
    pathname === key || pathname.startsWith(key + "/")
  );
  
  const displayTitle = meta?.[1].title || "Dashboard";
  const displaySub = meta?.[1].breadcrumb || "Doctor Portal · Morning Clinic";
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 w-full">
      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm font-semibold text-neutral-800 whitespace-nowrap">{displayTitle}</span>
        {displaySub && (
          <>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-500 whitespace-nowrap">{displaySub}</span>
          </>
        )}
        <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-success-700 bg-success-50 border border-success-200 rounded-full px-2 py-0.5 whitespace-nowrap select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
          Available
        </span>
      </div>

      {/* Search */}
      <div className="w-80 shrink-0 mx-auto hidden md:block">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 rounded-lg text-left text-neutral-400 text-xs font-medium cursor-pointer transition-colors"
        >
          <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Search patients, records, actions...</span>
        </button>
      </div>

      <div className="flex items-center justify-end gap-4 flex-1">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif((v) => !v); setShowUser(false); }}
            className="relative p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={BellIcon} className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-neutral-200 rounded-xl z-50 overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-bold text-neutral-800">Notifications</span>
                <Button variant="link" size="sm" className="text-xs">Mark all read</Button>
              </div>
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${n.unread ? "bg-primary-550/5" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                      <HugeiconsIcon icon={n.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800">{n.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5 whitespace-nowrap">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUser((v) => !v); setShowNotif(false); }}
            className="flex items-center gap-2.5 hover:bg-neutral-50 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">SA</div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-neutral-800 leading-tight">Dr. Sarah Ahmed</p>
              <p className="text-[10px] text-neutral-400 leading-tight">Cardiologist</p>
            </div>
            <HugeiconsIcon icon={ChevronDownIcon} className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 rounded-xl z-50 overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800">Dr. Sarah Ahmed</p>
                <p className="text-xs text-neutral-500 mt-0.5">Cardiology Specialist</p>
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  leftIcon={LogoutSquare01Icon}
                  className="w-full text-error-600 hover:bg-error-50 justify-start"
                  onClick={() => router.push("/doctor/signin")}
                >
                  Log Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
              <HugeiconsIcon icon={Search01Icon} className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search patient name, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-800 focus:outline-none placeholder-neutral-400 font-medium"
              />
              <button
                onClick={() => { setShowSearchModal(false); setSearchQuery(""); }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 bg-neutral-50 hover:bg-neutral-100 rounded"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body content */}
            <div className="h-[300px] p-6 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <HugeiconsIcon icon={Search01Icon} className="w-8 h-8 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-500">Search is ready for patient records</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
