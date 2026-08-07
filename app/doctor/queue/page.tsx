"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, PrescriptionIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type QueueStatus = "waiting" | "in_progress" | "completed" | "skipped";

type QueueCard = {
  id: string;
  appointmentId: string | null;
  token_number: number;
  status: string;
  checked_in_at: string | null;
  visitType: string;
  patientName: string;
  patientId: string;
  ageSex: string;
  complaint: string;
};

const columns: { key: QueueStatus; label: string; badgeVariant: "warning" | "primary" | "success" | "neutral" }[] = [
  { key: "waiting", label: "Waiting Queue", badgeVariant: "warning" },
  { key: "in_progress", label: "In Consultation Queue", badgeVariant: "primary" },
  { key: "completed", label: "Completed Queue", badgeVariant: "success" },
  { key: "skipped", label: "Skipped Queue", badgeVariant: "neutral" },
];

function tokenLabel(n: number) {
  return `TK-${String(n).padStart(3, "0")}`;
}

function waitMin(checkedInAt: string | null): string {
  if (!checkedInAt) return "—";
  return `${Math.floor((Date.now() - new Date(checkedInAt).getTime()) / 60000)} min`;
}

function ageSex(dob: string | null, gender: string | null): string {
  if (!dob) return "?";
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / 31536000000);
  return `${age}${gender === "male" ? "M" : gender === "female" ? "F" : ""}`;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function visitBadgeVariant(type: string): "primary" | "neutral" | "info" | "warning" | "error" {
  const map: Record<string, "primary" | "neutral" | "info" | "warning" | "error"> = {
    follow_up: "info", consultation: "neutral", emergency: "error", procedure: "warning",
  };
  return map[type] ?? "neutral";
}

function visitLabel(type: string): string {
  const map: Record<string, string> = {
    follow_up: "Follow-up", consultation: "Consultation", emergency: "Emergency", procedure: "Procedure",
  };
  return map[type] ?? type;
}

function cardStatus(status: string): QueueStatus {
  if (status === "skipped") return "skipped";
  if (status === "in_progress" || status === "called") return "in_progress";
  if (status === "completed") return "completed";
  return "waiting";
}

export default function DoctorQueuePage() {
  const router = useRouter();
  const [cards, setCards] = useState<QueueCard[]>([]);
  const [loading, setLoading] = useState(true);

  const getDoctorId = () => {
    const stored = localStorage.getItem("doctor_id");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return stored && uuidRegex.test(stored) ? stored : null;
  };

  const loadQueue = async () => {
    const docId = getDoctorId();
    if (!docId) {
      router.push("/doctor/signin");
      return;
    }

    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("queue_entries")
      .select(`id, appointment_id, token_number, status, checked_in_at, notes,
        patients(patient_id, full_name, date_of_birth, gender),
        appointments(type, chief_complaint)`)
      .eq("doctor_id", docId)
      .eq("queue_date", today)
      .order("token_number");

    const rows = (data as unknown as {
      id: string; appointment_id: string | null; token_number: number; status: string; checked_in_at: string | null; notes: string | null;
      patients: { patient_id: string; full_name: string; date_of_birth: string | null; gender: string | null } | null;
      appointments: { type: string; chief_complaint: string | null } | null;
    }[]) ?? [];

    setCards(rows.map((r) => ({
      id: r.id,
      appointmentId: r.appointment_id,
      token_number: r.token_number,
      status: r.status,
      checked_in_at: r.checked_in_at,
      visitType: r.appointments?.type ?? "consultation",
      patientName: r.patients?.full_name ?? "—",
      patientId: r.patients?.patient_id ?? "—",
      ageSex: ageSex(r.patients?.date_of_birth ?? null, r.patients?.gender ?? null),
      complaint: r.appointments?.chief_complaint ?? r.notes ?? "No complaint noted",
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadQueue();
    window.addEventListener("active_consultation_changed", loadQueue);
    window.addEventListener("storage", loadQueue);
    return () => {
      window.removeEventListener("active_consultation_changed", loadQueue);
      window.removeEventListener("storage", loadQueue);
    };
  }, []);

  const startConsultation = async (card: QueueCard) => {
    const supabase = createClient();

    const currentActive = cards.find((c) => c.status === "in_progress");
    if (currentActive && currentActive.id !== card.id) {
      await (supabase.from("queue_entries") as any)
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", currentActive.id);
    }

    await (supabase.from("queue_entries") as any).update({ status: "in_progress" }).eq("id", card.id);

    localStorage.setItem("active_consultation_id", card.id);
    window.dispatchEvent(new Event("active_consultation_changed"));
    router.push("/doctor/prescription");
  };

  const resumeConsultation = () => {
    router.push("/doctor/prescription");
  };

  const getColumnCards = (col: QueueStatus) => cards.filter((c) => cardStatus(c.status) === col);

  const totalCount = cards.length;
  const totalDone = cards.filter((c) => cardStatus(c.status) === "completed").length;
  const current = cards.find((c) => cardStatus(c.status) === "in_progress");

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-7 w-56 bg-neutral-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Card key={i} className="h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Patient Queue</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Serving {totalDone + (current ? 1 : 0)} of {totalCount} patients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[calc(100vh-220px)]">
        {columns.map((col) => {
          const colCards = getColumnCards(col.key);
          return (
            <Card key={col.key} padding="none" className="flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-800">{col.label}</h3>
                  <Badge variant={col.badgeVariant}>{colCards.length}</Badge>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colCards.map((card) => (
                  <Card
                    key={card.id}
                    className={`hover:border-neutral-300 transition-colors ${
                      card.visitType === "emergency" ? "border-error-300 bg-error-50/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-2xl font-black ${card.visitType === "emergency" ? "text-error-600" : "text-neutral-800"}`}>
                        {tokenLabel(card.token_number)}
                      </span>
                      <Badge variant={visitBadgeVariant(card.visitType)}>{visitLabel(card.visitType)}</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${
                        card.visitType === "emergency" ? "bg-error-600" : "bg-primary-600"
                      }`}>
                        {getInitials(card.patientName)}
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 truncate">{card.patientName}</p>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3 ml-8">{card.patientId} · {card.ageSex}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500 truncate flex-1" title={card.complaint}>{card.complaint}</p>
                      <div className="flex items-center gap-1 text-xs text-warning-600 shrink-0 ml-2">
                        <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
                        <span>{waitMin(card.checked_in_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {(col.key === "waiting" || col.key === "skipped") && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <button
                          onClick={() => startConsultation(card)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-md py-2 transition-colors"
                        >
                          <HugeiconsIcon icon={PrescriptionIcon} className="w-3.5 h-3.5" />
                          {col.key === "skipped" ? "Recall & Start" : "Start Consultation"}
                        </button>
                      </div>
                    )}
                    {col.key === "in_progress" && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <button
                          onClick={resumeConsultation}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-md py-2 transition-colors"
                        >
                          <HugeiconsIcon icon={PrescriptionIcon} className="w-3.5 h-3.5" />
                          Resume Consultation
                        </button>
                      </div>
                    )}
                  </Card>
                ))}

                {colCards.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-neutral-400">
                    No patients
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
