"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { DoctorSidebar } from "@/components/app/doctor-sidebar";
import { DoctorTopBar } from "@/components/app/doctor-top-bar";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, PrescriptionIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

const FULLSCREEN_ROUTES = ["/doctor/signin", "/doctor/signup", "/doctor/forgot-password", "/doctor/prescription"];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));
  
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const getDoctorId = () => {
    const stored = localStorage.getItem("doctor_id");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (stored && uuidRegex.test(stored)) {
      return stored;
    }
    return "d1000000-0000-0000-0000-000000000001";
  };

  useEffect(() => {
    if (!isFullscreen) {
      const docId = localStorage.getItem("doctor_id");
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!docId || !uuidRegex.test(docId)) {
        router.replace("/doctor/signin");
      }
    }
  }, [isFullscreen, pathname, router]);

  const checkActive = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const docId = getDoctorId();
    
    const { data, error } = await (supabase
      .from("queue_entries")
      .select(`id, token_number, status, checked_in_at, notes, appointment_id,
        patients(patient_id, full_name, date_of_birth, gender),
        appointments(type, chief_complaint)`)
      .eq("doctor_id", docId)
      .eq("queue_date", today)
      .eq("status", "in_progress")
      .maybeSingle() as any);

    if (data && !error) {
      setActiveConsultation({
        id: data.id,
        token: data.token_number,
        name: data.patients?.full_name ?? "Patient",
        type: data.appointments?.type ?? "OPD",
        complaint: data.appointments?.chief_complaint ?? data.notes ?? "",
        patient_id: data.patients?.patient_id ?? "",
        appointment_id: data.appointment_id
      });
      // Calculate elapsed time from checked_in_at or called_at
      const startTime = data.checked_in_at ? new Date(data.checked_in_at).getTime() : Date.now();
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
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

  const endActiveConsultation = async () => {
    if (!activeConsultation) return;
    const supabase = createClient();
    
    await (supabase
      .from("queue_entries") as any)
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", activeConsultation.id);

    if (activeConsultation.appointment_id) {
      await (supabase
        .from("appointments") as any)
        .update({ status: "completed" })
        .eq("id", activeConsultation.appointment_id);
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
                  onClick={() => router.push("/doctor/prescription")}
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
