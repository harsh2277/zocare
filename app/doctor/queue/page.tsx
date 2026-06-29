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

const initialQueue: QueueEntry[] = [
  { id: "1", token: 1, name: "Priya Sharma", age: 34, gender: "F", checkedIn: "09:05 AM", complaint: "Chest pain and breathlessness", waitMins: 0, status: "waiting", type: "OPD" },
  { id: "2", token: 2, name: "Rahul Mehta", age: 28, gender: "M", checkedIn: "09:30 AM", complaint: "Fever and cough for 5 days", waitMins: 0, status: "waiting", type: "Routine" },
  { id: "3", token: 3, name: "Meera Krishnan", age: 45, gender: "F", checkedIn: "10:15 AM", complaint: "Fever and headache for 3 days", waitMins: 0, status: "in_progress", type: "OPD" },
  { id: "4", token: 4, name: "Arjun Nair", age: 22, gender: "M", checkedIn: "10:30 AM", complaint: "Throat pain and difficulty swallowing", waitMins: 35, status: "waiting", type: "New Patient" },
  { id: "5", token: 5, name: "Sunita Gupta", age: 58, gender: "F", checkedIn: "10:45 AM", complaint: "Joint pain in both knees", waitMins: 48, status: "waiting", type: "Follow-up" },
  { id: "6", token: 6, name: "Kiran Desai", age: 41, gender: "M", checkedIn: "11:00 AM", complaint: "Acidity and bloating", waitMins: 60, status: "waiting", type: "Routine" },
  { id: "7", token: 7, name: "Asha Patel", age: 67, gender: "F", checkedIn: "11:15 AM", complaint: "Swelling in ankles", waitMins: 72, status: "waiting", type: "Follow-up" },
  { id: "8", token: 8, name: "Dev Joshi", age: 19, gender: "M", checkedIn: "11:30 AM", complaint: "Runny nose and sneezing", waitMins: 84, status: "waiting", type: "New Patient" },
  { id: "9", token: 9, name: "Pooja Iyer", age: 31, gender: "F", checkedIn: "11:45 AM", complaint: "Back pain for 2 weeks", waitMins: 96, status: "waiting", type: "Follow-up" },
];

export default function DoctorQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);

  const [statusFilter, setStatusFilter] = useState("");

  // Keep localStorage initialized and load it on client mount
  useEffect(() => {
    const stored = localStorage.getItem("doctor_queue_v2");
    if (stored) {
      setQueue(JSON.parse(stored));
    } else {
      localStorage.setItem("doctor_queue_v2", JSON.stringify(initialQueue));
    }
  }, []);

  // Listen to active consultation ended / changed in layout
  useEffect(() => {
    const handleActiveChange = () => {
      const stored = localStorage.getItem("doctor_queue_v2");
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    };
    window.addEventListener("active_consultation_changed", handleActiveChange);
    window.addEventListener("storage", handleActiveChange);
    return () => {
      window.removeEventListener("active_consultation_changed", handleActiveChange);
      window.removeEventListener("storage", handleActiveChange);
    };
  }, []);

  const syncQueue = (updatedQueue: QueueEntry[]) => {
    setQueue(updatedQueue);
    localStorage.setItem("doctor_queue_v2", JSON.stringify(updatedQueue));

    // Update active consultation ID
    const current = updatedQueue.find((e) => e.status === "in_progress");
    if (current) {
      localStorage.setItem("active_consultation_id", current.id);
    } else {
      localStorage.removeItem("active_consultation_id");
    }
    window.dispatchEvent(new Event("active_consultation_changed"));
  };
  const markDone = (id: string) => {
    const updated = queue.map((e): QueueEntry => (e.id === id ? { ...e, status: "completed" as const } : e));
    syncQueue(updated);
  };

  const callPatient = (id: string) => {
    const updated = queue.map((e): QueueEntry => {
      if (e.id === id) return { ...e, status: "in_progress" as const };
      if (e.status === "in_progress") return { ...e, status: "completed" as const };
      return e;
    });
    syncQueue(updated);
    router.push("/doctor/prescription");
  };

  const skipPatient = (id: string) => {
    const updated = queue.map((e): QueueEntry => (e.id === id ? { ...e, status: "skipped" as const } : e));
    syncQueue(updated);
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
