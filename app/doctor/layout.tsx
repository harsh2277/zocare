"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { DoctorSidebar } from "@/components/app/doctor-sidebar";
import { DoctorTopBar } from "@/components/app/doctor-top-bar";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, PrescriptionIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const FULLSCREEN_ROUTES = ["/doctor/signin", "/doctor/signup", "/doctor/forgot-password", "/doctor/prescription"];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));
  
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(504);

  const checkActive = () => {
    const activeId = localStorage.getItem("active_consultation_id");
    if (activeId) {
      const storedQueue = localStorage.getItem("doctor_queue_v2");
      const queue = storedQueue ? JSON.parse(storedQueue) : [];
      const match = queue.find((p: any) => p.id === activeId && p.status === "in_progress");
      setActiveConsultation(match || null);
    } else {
      setActiveConsultation(null);
    }
  };

  useEffect(() => {
    if (isFullscreen) return;
    checkActive();

    const handleStorageChange = () => {
      checkActive();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("active_consultation_changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("active_consultation_changed", handleStorageChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!activeConsultation) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeConsultation]);

  const endActiveConsultation = () => {
    if (!activeConsultation) return;
    const activeId = activeConsultation.id;
    const storedQueue = localStorage.getItem("doctor_queue_v2");
    if (storedQueue) {
      const queue = JSON.parse(storedQueue);
      const updated = queue.map((p: any) => p.id === activeId ? { ...p, status: "completed" } : p);
      localStorage.setItem("doctor_queue_v2", JSON.stringify(updated));
    }
    localStorage.removeItem("active_consultation_id");
    setActiveConsultation(null);
    window.dispatchEvent(new Event("active_consultation_changed"));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="hidden lg:block shrink-0">
          <DoctorTopBar />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Mobile top bar spacer */}
          <div className="lg:hidden h-14" />
          
          {/* Edge-to-edge Active Consultation Banner styled exactly per Figma CSS */}
          {activeConsultation && (
            <div 
              style={{
                background: "linear-gradient(90deg, #0B4A5A 0%, #0B6E6E 100%), #0D9488"
              }}
              className="flex flex-row justify-between items-center px-8 py-6 h-[117px] w-full shrink-0 select-none border-b border-white/10"
            >
              {/* Frame: Auto layout gap 24px */}
              <div className="flex flex-row items-center gap-6">
                {/* Circle Frame: 56px x 56px */}
                <div className="flex justify-center items-center w-[56px] h-[56px] bg-white rounded-[28px] shrink-0">
                  <span className="font-extrabold text-[18px] text-[#0D9488] leading-[22px]">
                    #{activeConsultation.token}
                  </span>
                </div>
                {/* Info Text Column Frame: Gap 4px */}
                <div className="flex flex-col items-start gap-[4px]">
                  {/* Tagline Row Frame: Gap 8px */}
                  <div className="flex flex-row items-center gap-[8px]">
                    <span className="font-bold text-[12px] uppercase text-[#D6F5FA] leading-[15px] tracking-wider">
                      NOW IN CONSULTATION
                    </span>
                    <div className="w-[8px] h-[8px] bg-white rounded-full shrink-0" />
                    <span className="font-bold text-[12px] text-white leading-[15px]">
                      {formatTime(elapsedSeconds)} elapsed
                    </span>
                  </div>
                  {/* Patient Name Header */}
                  <h2 className="font-bold text-[24px] text-white leading-[29px]">
                    {activeConsultation.name} · {activeConsultation.type || "OPD"}
                  </h2>
                  {/* Chief Complaint Subtitle */}
                  <p className="font-normal text-[14px] text-[#D6F5FA] leading-[17px]">
                    Chief: {activeConsultation.complaint || "Headache & chest pain"}
                  </p>
                </div>
              </div>
              {/* Buttons Container Frame: Gap 16px */}
              <div className="flex flex-row items-center gap-[16px]">
                <button
                  type="button"
                  className="box-sizing-border flex flex-row justify-center items-center px-5 h-[37px] border border-white rounded-[8px] font-semibold text-[14px] text-white leading-[17px] bg-transparent hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                >
                  Write Prescription
                </button>
                <button
                  type="button"
                  onClick={endActiveConsultation}
                  className="flex flex-row justify-center items-center px-5 h-[37px] bg-white rounded-[8px] font-bold text-[14px] text-[#0D9488] leading-[17px] hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer"
                >
                  End Consultation
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
