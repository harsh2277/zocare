"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import {
  Clock01Icon,
  PlayIcon
} from "@hugeicons/core-free-icons";

type QueueEntry = {
  id: string;
  token: number;
  name: string;
  age: number;
  gender: string;
  checkedIn: string;
  complaint: string;
  waitMins: number;
  status: "waiting" | "in_progress" | "completed" | "skipped";
  type: string;
};

import { createClient } from "@/lib/supabase/client";

export default function DoctorQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

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
    const docId = getDoctorId();

    const { data, error } = await (supabase
      .from("queue_entries")
      .select(`
        id,
        token_number,
        status,
        checked_in_at,
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

  const callPatient = async (id: string) => {
    const supabase = createClient();

    // 1. Mark any currently "in_progress" consultation as completed first
    const currentActive = queue.find((e) => e.status === "in_progress");
    if (currentActive && currentActive.id !== id) {
      await (supabase
        .from("queue_entries") as any)
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", currentActive.id);
    }

    // 2. Set this consultation to "in_progress"
    await (supabase
      .from("queue_entries") as any)
      .update({ status: "in_progress" })
      .eq("id", id);

    localStorage.setItem("active_consultation_id", id);
    window.dispatchEvent(new Event("active_consultation_changed"));
    router.push("/doctor/prescription");
  };

  const skipPatient = async (id: string) => {
    const supabase = createClient();
    await (supabase
      .from("queue_entries") as any)
      .update({ status: "skipped" })
      .eq("id", id);

    window.dispatchEvent(new Event("active_consultation_changed"));
  };

  const current = queue.find((e) => e.status === "in_progress");
  const completed = queue.filter((e) => e.status === "completed");
  const totalDone = completed.length;
  const totalCount = queue.length;

  const filteredQueue = queue.filter((row) => {
    if (!statusFilter) return true;
    return row.status === statusFilter;
  });

  const getStatusBadge = (status: QueueEntry["status"]) => {
    const maps = {
      completed: { label: "Done", cls: "bg-[#d1fae5] text-[#10b981]" },
      in_progress: { label: "In Consultation", cls: "bg-[#ccf2f2] text-[#0b6e6e]" },
      waiting: { label: "Waiting", cls: "bg-[#fef3c7] text-[#f59e0b]" },
      skipped: { label: "Skipped", cls: "bg-[#f1f5f9] text-[#647589]" }
    };
    const c = maps[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.cls}`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-6 bg-neutral-100 rounded w-1/4" />
          <div className="h-4 bg-neutral-100 rounded w-1/6" />
        </div>
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading live queue...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Patient Queue</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Serving {totalDone + (current ? 1 : 0)} of {totalCount} patients
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-neutral-400" />
          <span>Avg. consultation: 12 min</span>
        </div>
      </div>
      <Card padding="none" className="w-full overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-800">Today's Live Queue</h2>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Status" },
                { value: "waiting", label: "Waiting" },
                { value: "in_progress", label: "In Consultation" },
                { value: "completed", label: "Completed" },
                { value: "skipped", label: "Skipped" },
              ]}
              className="text-sm py-1.5 min-w-[120px]"
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["Token", "Patient", "Age/Gender", "Checked In", "Wait Time", "Complaint", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-neutral-400">
                    No patients in the queue matching this filter.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((row) => (
                  <tr
                    key={row.id}
                    className={`text-sm ${row.status === "in_progress" ? "bg-[#f4fbfb]" : ""}`}
                  >
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-neutral-500">
                      TK-{String(row.token).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-800 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {row.age}{row.gender}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                      {row.checkedIn}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {row.status === "completed" ? "—" : `${row.waitMins} min`}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={row.complaint}>
                      {row.complaint}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.status === "waiting" && (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={PlayIcon}
                            onClick={() => callPatient(row.id)}
                          >
                            Start Consultation
                          </Button>
                        )}
                        {row.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => router.push("/doctor/prescription")}
                          >
                            Resume Consultation
                          </Button>
                        )}
                        {row.status === "skipped" && (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={PlayIcon}
                            onClick={() => callPatient(row.id)}
                          >
                            Start Consultation
                          </Button>
                        )}
                        {row.status === "completed" && (
                          <span className="text-xs text-neutral-400 font-medium">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
