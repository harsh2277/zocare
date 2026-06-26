"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, StethoscopeIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckInModal } from "@/components/app/check-in-modal";

type QueueStatus = "waiting" | "in_progress" | "completed" | "emergency" | "skipped";

type QueueCard = {
  id: string;
  appointmentId: string | null;
  token_number: number;
  status: string;
  checked_in_at: string | null;
  appointmentType: string;
  patientName: string;
  patientId: string;
  ageSex: string;
  doctorName: string;
};

const columns: { key: QueueStatus; label: string; badgeVariant: "warning" | "primary" | "success" | "neutral" }[] = [
  { key: "waiting", label: "Waiting Queue", badgeVariant: "warning" },
  { key: "in_progress", label: "In Consultation Queue", badgeVariant: "primary" },
  { key: "completed", label: "Completed Queue", badgeVariant: "success" },
  { key: "skipped", label: "Skipped Queue", badgeVariant: "neutral" },
];

function tokenLabel(n: number) {
  return `A-${String(n).padStart(3, "0")}`;
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

function cardStatus(status: string, appointmentType: string): QueueStatus {
  if (status === "skipped") return "skipped";
  if (status === "in_progress" || status === "called") return "in_progress";
  if (status === "completed") return "completed";
  return "waiting";
}

export default function ReceptionistQueuePage() {
  const [cards, setCards] = useState<QueueCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const loadQueue = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("queue_entries")
      .select(`id, appointment_id, token_number, status, checked_in_at,
        patients(patient_id, full_name, date_of_birth, gender),
        doctors(full_name), appointments(type)`)
      .eq("queue_date", today)
      .order("token_number");

    const rows = (data as unknown as {
      id: string; appointment_id: string | null; token_number: number; status: string; checked_in_at: string | null;
      patients: { patient_id: string; full_name: string; date_of_birth: string | null; gender: string | null } | null;
      doctors: { full_name: string } | null;
      appointments: { type: string } | null;
    }[]) ?? [];

    setCards(rows.map((r) => ({
      id: r.id, appointmentId: r.appointment_id, token_number: r.token_number, status: r.status, checked_in_at: r.checked_in_at,
      appointmentType: r.appointments?.type ?? "consultation",
      patientName: r.patients?.full_name ?? "—",
      patientId: r.patients?.patient_id ?? "—",
      ageSex: ageSex(r.patients?.date_of_birth ?? null, r.patients?.gender ?? null),
      doctorName: r.doctors?.full_name ?? "—",
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Mark a queue entry's visit as emergency (moves it to the Emergency column).
  const markEmergency = async (card: QueueCard) => {
    if (!card.appointmentId) return;
    const supabase = createClient();
    await (supabase.from("appointments") as any).update({ type: "emergency" }).eq("id", card.appointmentId);
    await (supabase.from("queue_entries") as any).update({ status: "waiting" }).eq("id", card.id);
    loadQueue();
  };

  // Skip: set status to skipped.
  const skipPatient = async (card: QueueCard) => {
    const supabase = createClient();
    await (supabase.from("queue_entries") as any)
      .update({ status: "skipped" })
      .eq("id", card.id);
    loadQueue();
  };

  // Re-queue: bring a patient back into the waiting queue.
  const reQueuePatient = async (card: QueueCard) => {
    const supabase = createClient();
    await (supabase.from("queue_entries") as any).update({ status: "waiting" }).eq("id", card.id);
    if (card.appointmentType === "emergency" && card.appointmentId) {
      await (supabase.from("appointments") as any).update({ type: "consultation" }).eq("id", card.appointmentId);
    }
    loadQueue();
  };

  // Re-queue all skipped patients.
  const reQueueAllSkipped = async () => {
    const supabase = createClient();
    const skippedCards = cards.filter((c) => cardStatus(c.status, c.appointmentType) === "skipped");
    if (skippedCards.length === 0) return;
    const ids = skippedCards.map((c) => c.id);
    await (supabase.from("queue_entries") as any).update({ status: "waiting" }).in("id", ids);
    const appIdsToReset = skippedCards.filter((c) => c.appointmentType === "emergency" && c.appointmentId).map((c) => c.appointmentId);
    if (appIdsToReset.length > 0) {
      await (supabase.from("appointments") as any).update({ type: "consultation" }).in("id", appIdsToReset);
    }
    loadQueue();
  };

  const getColumnCards = (col: QueueStatus) => {
    const filtered = cards.filter((c) => cardStatus(c.status, c.appointmentType) === col);
    if (col === "waiting") {
      return [...filtered].sort((a, b) => {
        const aEmerg = a.appointmentType === "emergency";
        const bEmerg = b.appointmentType === "emergency";
        if (aEmerg && !bEmerg) return -1;
        if (!aEmerg && bEmerg) return 1;
        return a.token_number - b.token_number;
      });
    }
    return filtered;
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-7 w-56 bg-neutral-100 rounded animate-pulse" />
          <div className="h-9 w-40 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Card key={i} className="h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Live Queue Management</h1>
        <div className="flex items-center gap-2">
          <Link href="/receptionist/patients/new">
            <Button variant="outline" size="md" leftIcon={PlusSignIcon}>Add Patient</Button>
          </Link>
          <Button variant="primary" size="md" leftIcon={PlusSignIcon} onClick={() => setShowCheckIn(true)}>
            Check In
          </Button>
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
                {col.key === "skipped" && colCards.length > 0 && (
                  <button
                    onClick={reQueueAllSkipped}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors px-2 py-1 rounded bg-primary-50 hover:bg-primary-100"
                  >
                    Re-queue All
                  </button>
                )}
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colCards.map((card) => (
                  <Card
                    key={card.id}
                    className={`hover:border-neutral-300 transition-colors ${
                      card.appointmentType === "emergency" ? "border-error-300 bg-error-50/20 animate-pulse-subtle" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-2xl font-black ${card.appointmentType === "emergency" ? "text-error-600" : "text-neutral-800"}`}>
                        {tokenLabel(card.token_number)}
                      </span>
                      <Badge variant={visitBadgeVariant(card.appointmentType)}>{visitLabel(card.appointmentType)}</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${
                        card.appointmentType === "emergency" ? "bg-error-600" : "bg-primary-600"
                      }`}>
                        {getInitials(card.patientName)}
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 truncate">{card.patientName}</p>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3 ml-8">{card.patientId} · {card.ageSex}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 min-w-0">
                        <HugeiconsIcon icon={StethoscopeIcon} className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                        <span className="truncate">{card.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-warning-600 shrink-0 ml-2">
                        <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
                        <span>{waitMin(card.checked_in_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-neutral-100">
                      <button
                        onClick={() => markEmergency(card)}
                        disabled={card.appointmentType === "emergency" || col.key === "completed"}
                        className="text-xs font-bold py-1.5 px-0.5 rounded-md border border-error-200 text-error-600 hover:bg-error-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Emergency
                      </button>
                      <button
                        onClick={() => skipPatient(card)}
                        disabled={col.key === "skipped" || col.key === "completed"}
                        className="text-xs font-bold py-1.5 px-0.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => reQueuePatient(card)}
                        disabled={col.key !== "skipped" && card.appointmentType !== "emergency"}
                        className="text-xs font-bold py-1.5 px-0.5 rounded-md border border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Re-queue
                      </button>
                    </div>
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

      <CheckInModal isOpen={showCheckIn} onClose={() => { setShowCheckIn(false); loadQueue(); }} />
    </div>
  );
}
