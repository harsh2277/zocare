"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  BarChartIcon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/client";

function statusBadge(status: string): { label: string; variant: "primary" | "neutral" | "success" | "info" | "warning" | "error" } {
  const map: Record<string, { label: string; variant: "primary" | "neutral" | "success" | "info" | "warning" | "error" }> = {
    completed: { label: "Done", variant: "success" },
    in_progress: { label: "In Consultation", variant: "primary" },
    called: { label: "Called", variant: "info" },
    waiting: { label: "Waiting", variant: "warning" },
    skipped: { label: "Skipped", variant: "neutral" },
  };
  return map[status] ?? { label: status, variant: "neutral" };
}

type QueueEntry = {
  id: string;
  token: number;
  name: string;
  age: number;
  gender: string;
  checkedIn: string;
  checkedInAt: string | null;
  completedAt: string | null;
  complaint: string;
  waitMins: number;
  status: "waiting" | "in_progress" | "completed" | "skipped";
  type: string;
};

function avgConsultMinutes(rows: { checkedInAt: string | null; completedAt: string | null }[]): number | null {
  const durations = rows
    .filter((r) => r.checkedInAt && r.completedAt)
    .map((r) => (new Date(r.completedAt as string).getTime() - new Date(r.checkedInAt as string).getTime()) / 60000)
    .filter((m) => m >= 0);
  if (durations.length === 0) return null;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}

type DiagnosisSummary = { name: string; count: number };

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [diagnosesList, setDiagnosesList] = useState<DiagnosisSummary[]>([]);
  const [yesterdayAvgConsult, setYesterdayAvgConsult] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getDoctorId = () => {
    const stored = localStorage.getItem("doctor_id");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (stored && uuidRegex.test(stored)) {
      return stored;
    }
    return "d1000000-0000-0000-0000-000000000001";
  };

  const loadQueue = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const docId = getDoctorId();

    const { data, error } = await (supabase
      .from("queue_entries")
      .select(`
        id,
        token_number,
        status,
        checked_in_at,
        completed_at,
        notes,
        patients (
          full_name,
          date_of_birth,
          gender
        ),
        appointments (
          type,
          chief_complaint
        )
      `)
      .eq("doctor_id", docId)
      .eq("queue_date", today)
      .order("token_number") as any);

    if (data && !error) {
      const mapped: QueueEntry[] = data.map((item: any) => {
        const birthDate = item.patients?.date_of_birth;
        let age = 0;
        if (birthDate) {
          age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31536000000);
        }

        let waitMins = 0;
        if (item.checked_in_at) {
          waitMins = Math.floor((Date.now() - new Date(item.checked_in_at).getTime()) / 60000);
        }

        const checkedInTime = item.checked_in_at
          ? new Date(item.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "09:00 AM";

        return {
          id: item.id,
          token: item.token_number,
          name: item.patients?.full_name ?? "Unknown",
          age: age,
          gender: item.patients?.gender === "male" ? "M" : item.patients?.gender === "female" ? "F" : "O",
          checkedIn: checkedInTime,
          checkedInAt: item.checked_in_at,
          completedAt: item.completed_at,
          complaint: item.appointments?.chief_complaint ?? item.notes ?? "No complaint",
          waitMins: waitMins < 0 ? 0 : waitMins,
          status: item.status,
          type: item.appointments?.type === "consultation" ? "OPD" :
                item.appointments?.type === "follow_up" ? "Follow-up" :
                item.appointments?.type === "emergency" ? "Emergency" : "Routine"
        };
      });
      setQueue(mapped);
    }

    const { data: yesterdayData } = await (supabase
      .from("queue_entries")
      .select("checked_in_at, completed_at")
      .eq("doctor_id", docId)
      .eq("queue_date", yesterday)
      .eq("status", "completed") as any);
    setYesterdayAvgConsult(
      avgConsultMinutes((yesterdayData ?? []).map((r: any) => ({ checkedInAt: r.checked_in_at, completedAt: r.completed_at })))
    );

    const { data: prescriptionData } = await (supabase
      .from("prescriptions")
      .select("diagnosis, created_at")
      .eq("doctor_id", docId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`) as any);
    const counts = new Map<string, number>();
    for (const rx of prescriptionData ?? []) {
      const name = (rx.diagnosis ?? "").trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    setDiagnosesList(
      Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );

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

  const handleStartResume = async (id: string) => {
    const supabase = createClient();

    const currentActive = queue.find((e) => e.status === "in_progress");
    if (currentActive && currentActive.id !== id) {
      await (supabase
        .from("queue_entries") as any)
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", currentActive.id);
    }

    await (supabase
      .from("queue_entries") as any)
      .update({ status: "in_progress" })
      .eq("id", id);

    localStorage.setItem("active_consultation_id", id);
    window.dispatchEvent(new Event("active_consultation_changed"));
    router.push("/doctor/prescription");
  };

  // Calculate dynamic stats
  const totalPatients = queue.length;
  const completedPatients = queue.filter((p) => p.status === "completed").length;
  const activePatients = queue.filter((p) => p.status === "in_progress").length;
  const waitingPatients = queue.filter((p) => p.status === "waiting").length;
  const followUpCount = queue.filter((p) => p.type === "Follow-up").length;
  const percentComplete = totalPatients > 0 ? Math.round((completedPatients / totalPatients) * 100) : 0;

  const waitingWithCheckIn = queue.filter((p) => p.status === "waiting" && p.checkedInAt);
  const avgWaitToday = waitingWithCheckIn.length > 0
    ? Math.round(waitingWithCheckIn.reduce((sum, p) => sum + p.waitMins, 0) / waitingWithCheckIn.length)
    : null;

  const todayAvgConsult = avgConsultMinutes(queue.filter((p) => p.status === "completed"));
  const consultTrend = todayAvgConsult !== null && yesterdayAvgConsult !== null
    ? todayAvgConsult - yesterdayAvgConsult
    : null;

  const statCards = [
    {
      title: "Today's Appointments",
      value: String(totalPatients),
      subtitle: followUpCount > 0 ? `${followUpCount} follow-up${followUpCount === 1 ? "" : "s"}` : "Scheduled today",
      subtitleColor: "text-success-600",
      icon: UserGroupIcon,
    },
    {
      title: "Patients Seen",
      value: String(completedPatients),
      subtitle: `${percentComplete}% complete`,
      subtitleColor: "text-primary-600",
      icon: CheckmarkCircle01Icon,
    },
    {
      title: "Pending",
      value: String(waitingPatients),
      subtitle: avgWaitToday !== null ? `Avg wait: ${avgWaitToday} min` : "No one waiting",
      subtitleColor: "text-warning-500",
      icon: Clock01Icon,
    },
    {
      title: "Avg Consultation",
      value: todayAvgConsult !== null ? `${todayAvgConsult}m` : "—",
      subtitle: consultTrend === null
        ? "No completed visits yet"
        : consultTrend === 0
          ? "Same as yesterday"
          : `${consultTrend < 0 ? "↓" : "↑"} ${Math.abs(consultTrend)}m from yesterday`,
      subtitleColor: consultTrend !== null && consultTrend > 0 ? "text-warning-500" : "text-success-600",
      icon: BarChartIcon,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-3 bg-neutral-100 rounded w-3/4 mb-4" />
              <div className="h-8 bg-neutral-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading dashboard...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-neutral-500 font-medium leading-tight">{s.title}</p>
              <HugeiconsIcon icon={s.icon} className="w-5 h-5 text-neutral-300 shrink-0" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{s.value}</p>
            <p className={`text-xs font-medium ${s.subtitleColor}`}>{s.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* ROW 2: Today's Patients & Today's Progress / Diagnoses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Today's Patients */}
        <Card padding="none" className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-100 shrink-0">
            <h2 className="text-sm font-bold text-neutral-800">Today's Patients</h2>
            <Link href="/doctor/queue" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Go to Queue
            </Link>
          </div>

          {queue.length === 0 ? (
            <EmptyState
              icon={TaskDaily01Icon}
              title="No patients today"
              description="Patients checked in by reception will show up here."
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {["Token", "Patient", "Age/Gender", "Visit Type", "Wait Time", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {queue.map((row) => {
                    const st = statusBadge(row.status);
                    return (
                      <tr key={row.id} className="text-sm">
                        <td className="px-4 py-3 text-xs font-mono font-semibold text-neutral-500">
                          TK-{String(row.token).padStart(3, "0")}
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{row.age}{row.gender}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            row.type === "OPD" ? "bg-[#dbeafe] text-[#1e40af]" :
                            row.type === "Routine" ? "bg-[#f3f4f6] text-[#374151]" :
                            row.type === "Follow-up" ? "bg-[#ede9fe] text-[#6b21a8]" : "bg-[#fee2e2] text-[#92400e]"
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-neutral-600">
                          {row.status === "completed" ? "—" : `${row.waitMins} min`}
                        </td>
                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="px-4 py-3">
                          {(row.status === "waiting" || row.status === "skipped") && (
                            <button
                              onClick={() => handleStartResume(row.id)}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              {row.status === "skipped" ? "Recall" : "Start"}
                            </button>
                          )}
                          {row.status === "in_progress" && (
                            <button
                              onClick={() => handleStartResume(row.id)}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              Resume
                            </button>
                          )}
                          {row.status === "completed" && (
                            <span className="text-xs text-neutral-400 font-medium">Seen</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right Column: Progress & Diagnoses */}
        <div className="flex flex-col gap-5">
        {/* Card: Today's Progress */}
        <Card className="flex flex-col justify-between h-[351px]">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-800">Today's Progress</h3>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
              Today
            </span>
          </div>

          <div className="flex justify-center items-center my-2">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Circular indicator */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#0b6e6e"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * completedPatients) / (totalPatients || 1)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-neutral-800">
                  {completedPatients}/{totalPatients}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5">Patients Seen</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
            <span className="bg-[#d1fae5] text-[#10b981] px-2 py-1 rounded-full">Done: {completedPatients}</span>
            <div className="w-[1px] h-6 bg-neutral-200" />
            <span className="bg-[#f0fafa] text-[#0b6e6e] px-2 py-1 rounded-full">Active: {activePatients}</span>
            <div className="w-[1px] h-6 bg-neutral-200" />
            <span className="bg-[#fef3c7] text-[#f59e0b] px-2 py-1 rounded-full">Pending: {waitingPatients}</span>
          </div>
        </Card>

        {/* Card: Today's Diagnoses */}
        <Card padding={diagnosesList.length === 0 ? "none" : undefined} className="flex flex-col justify-between h-[351px] overflow-hidden">
          {diagnosesList.length === 0 ? (
            <EmptyState
              icon={BarChartIcon}
              title="No diagnoses recorded yet"
              description="Diagnoses from today's completed prescriptions will summarize here."
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">Today's Diagnoses</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">From today's prescriptions</p>
                </div>
                <span className="text-[11px] font-bold text-[#0b6e6e] bg-[#ccf2f2] px-2.5 py-1 rounded-full">
                  {diagnosesList.length} recorded
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
                {diagnosesList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors px-1 rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block shrink-0" />
                      <span className="font-semibold text-neutral-800 truncate max-w-[220px]">{item.name}</span>
                    </div>
                    <span className="text-xs bg-neutral-100 text-neutral-500 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.count} {item.count === 1 ? "pt" : "pts"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}
