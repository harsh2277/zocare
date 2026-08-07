"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon, BellIcon, ChevronDownIcon, LogoutSquare01Icon,
  AlertCircleIcon, CheckmarkCircle01Icon, Clock01Icon, UserIcon,
  PlusSignIcon, StethoscopeIcon, EyeIcon, Cancel01Icon
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth";
import { CheckInModal } from "@/components/app/check-in-modal";

const routeMeta: Record<string, { title: string; breadcrumb?: string }> = {
  "/receptionist/dashboard": { title: "Dashboard", breadcrumb: "Reception · Morning Shift" },
  "/receptionist/patients": { title: "Patients", breadcrumb: "Reception · Morning Shift" },
  "/receptionist/queue": { title: "Queue Management", breadcrumb: "Reception · Morning Shift" },
};

const notifications = [
  { icon: UserIcon, color: "text-primary-600 bg-primary-50", title: "Ahmed Khan checked in", desc: "Token #42 assigned to Dr. Sarah Ahmed", time: "2 min ago", unread: true },
  { icon: AlertCircleIcon, color: "text-error-600 bg-error-50", title: "Emergency alert", desc: "Patient E-024 marked as Emergency", time: "5 min ago", unread: true },
  { icon: Clock01Icon, color: "text-neutral-500 bg-neutral-100", title: "Queue update", desc: "Dr. Faisal Qureshi is now available", time: "12 min ago", unread: false },
  { icon: BellIcon, color: "text-warning-600 bg-warning-50", title: "Appointment reminder", desc: "Zainab Bibi appointment in 15 min", time: "14 min ago", unread: false },
  { icon: CheckmarkCircle01Icon, color: "text-success-600 bg-success-50", title: "Shift started", desc: "Morning shift started at 09:00 AM", time: "1 hr ago", unread: false },
];

export const ReceptionistNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [search, setSearch] = useState("");

  // Spotlight Search Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInPatientDefault, setCheckInPatientDefault] = useState<any | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSearchModal || !globalSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchingGlobal(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("patients")
        .select("id, patient_id, full_name, phone, date_of_birth, blood_group")
        .or(`full_name.ilike.%${globalSearchQuery.trim()}%,phone.ilike.%${globalSearchQuery.trim()}%,patient_id.ilike.%${globalSearchQuery.trim()}%`)
        .limit(5);

      setSearchResults((data ?? []).map((p: any) => ({
        id: p.id,
        patient_id: p.patient_id,
        name: p.full_name,
        phone: p.phone ?? "",
        age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31536000000) : null,
        blood: p.blood_group
      })));
      setSearchingGlobal(false);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [globalSearchQuery, showSearchModal]);

  const meta = Object.entries(routeMeta).find(([key]) => pathname === key || pathname.startsWith(key + "/"));
  const isNewPatient = pathname === "/receptionist/patients/new";
  const displayTitle = isNewPatient ? "Patients" : (meta?.[1].title ?? "");
  const displaySub = isNewPatient ? "Add New Patient" : (meta?.[1].breadcrumb ?? "");
  const unreadCount = notifications.filter((n) => n.unread).length;

  const [recepName, setRecepName] = useState("Mary Joseph");

  useEffect(() => {
    const name = localStorage.getItem("receptionist_name");
    if (name) setRecepName(name);
  }, []);

  const initials = recepName
    ? recepName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "MJ";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm font-semibold text-neutral-800 whitespace-nowrap">{displayTitle}</span>
        {displaySub && (
          <>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-500 whitespace-nowrap">{displaySub}</span>
          </>
        )}
        {(pathname === "/receptionist/dashboard" || pathname === "/receptionist/queue" || pathname === "/receptionist/patients") && (
          <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-success-700 bg-success-50 border border-success-200 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
            Live
          </span>
        )}
      </div>

      {/* Search */}
      <div className="w-80 shrink-0 mx-auto">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 rounded-lg text-left text-neutral-400 text-xs font-medium cursor-pointer transition-colors"
        >
          <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Search patients, doctors, actions...</span>
        </button>
      </div>

      <div className="flex items-center justify-end gap-4 flex-1">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif((v) => !v); setShowUser(false); }}
            className="relative p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={BellIcon} className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-neutral-200 rounded-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-bold text-neutral-800">Notifications</span>
                <Button variant="link" size="sm" className="text-[14px]">Mark all read</Button>
              </div>
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${n.unread ? "bg-primary-50/30" : ""}`}>
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
            className="flex items-center gap-2.5 hover:bg-neutral-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-neutral-800 leading-tight">{recepName}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">Front Desk</p>
            </div>
            <HugeiconsIcon icon={ChevronDownIcon} className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 rounded-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800">{recepName}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Front Desk Receptionist</p>
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  leftIcon={LogoutSquare01Icon}
                  className="w-full text-error-600 hover:bg-error-50 justify-start"
                  onClick={async () => {
                    await signOut();
                    router.replace("/receptionist/login");
                  }}
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
                placeholder="Search patient name, ID, or phone number..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-800 focus:outline-none placeholder-neutral-400 font-medium"
              />
              <button
                onClick={() => { setShowSearchModal(false); setGlobalSearchQuery(""); }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 bg-neutral-50 hover:bg-neutral-100 rounded"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
              </button>
            </div>

            {/* Content list */}
            <div className="h-[350px] overflow-y-auto">
              {!globalSearchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-2">
                  <HugeiconsIcon icon={Search01Icon} className="w-8 h-8 text-neutral-300" />
                  <p className="text-sm font-medium text-neutral-500">Search for patients in the database</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchingGlobal && (
                    <p className="text-xs text-neutral-400 py-2">Searching records...</p>
                  )}

                  {!searchingGlobal && searchResults.length > 0 && (
                    <div className="divide-y divide-neutral-100 overflow-hidden">
                      {searchResults.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3.5 bg-white hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {p.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-800">{p.name}</p>
                              <p className="text-xs text-neutral-500">{p.phone} · {p.patient_id}</p>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={StethoscopeIcon}
                            className="bg-[#0d6e6b] hover:bg-[#0b5c59] border-0"
                            onClick={() => {
                              setShowSearchModal(false);
                              setCheckInPatientDefault(p);
                              setShowCheckIn(true);
                            }}
                          >
                            Check In
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searchingGlobal && searchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[320px] space-y-3 text-center">
                      <p className="text-sm text-neutral-400">No matching patients found.</p>
                      <Button
                        variant="primary"
                        leftIcon={PlusSignIcon}
                        onClick={() => {
                          setShowSearchModal(false);
                          router.push(`/receptionist/patients/new?phone=${encodeURIComponent(globalSearchQuery)}`);
                        }}
                      >
                        Create Patient
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render spotlight check-in modal */}
      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => {
          setShowCheckIn(false);
          setCheckInPatientDefault(null);
        }}
        initialPatient={checkInPatientDefault}
      />
    </header>
  );
};
