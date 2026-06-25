"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, Clock01Icon, StethoscopeIcon, CheckmarkCircle01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type QueueRow = {
  id: string;
  token_number: number;
  status: string;
  checked_in_at: string | null;
  patients: { patient_id: string; full_name: string; date_of_birth: string | null; gender: string | null } | null;
  doctors: { full_name: string } | null;
  appointments: { type: string } | null;
};

type Doctor = { id: string; full_name: string; specialization: string | null };

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function ageFromDob(dob: string | null): string {
  if (!dob) return "?";
  return String(Math.floor((Date.now() - new Date(dob).getTime()) / 31536000000));
}

function ageSex(dob: string | null, gender: string | null): string {
  return `${ageFromDob(dob)}${gender === "male" ? "M" : gender === "female" ? "F" : ""}`;
}

function waitMinutes(checkedInAt: string | null): string {
  if (!checkedInAt) return "—";
  return `${Math.floor((Date.now() - new Date(checkedInAt).getTime()) / 60000)} min`;
}

function tokenLabel(n: number) {
  return `TK-${String(n).padStart(3, "0")}`;
}

function visitTypeBadge(type: string): { label: string; variant: "primary" | "neutral" | "success" | "info" | "warning" | "error" } {
  const map: Record<string, { label: string; variant: "primary" | "neutral" | "success" | "info" | "warning" | "error" }> = {
    follow_up: { label: "Follow-up", variant: "info" },
    consultation: { label: "Consultation", variant: "neutral" },
    emergency: { label: "Emergency", variant: "error" },
    procedure: { label: "Procedure", variant: "warning" },
  };
  return map[type] ?? { label: type, variant: "neutral" };
}

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

const doctorAvailability: Record<string, { status: string; sc: string; dot: string }> = {
  "Dr. Sarah Ahmed": { status: "Available", sc: "text-success-600", dot: "bg-success-500" },
  "Dr. Faisal Qureshi": { status: "In Consultation", sc: "text-primary-600", dot: "bg-primary-500" },
  "Dr. Haris Ali": { status: "On Break", sc: "text-neutral-500", dot: "bg-neutral-400" },
  "Dr. Mehreen Shah": { status: "Available", sc: "text-success-600", dot: "bg-success-500" },
  "Dr. Aisha Lee": { status: "On Leave", sc: "text-neutral-500", dot: "bg-neutral-400" },
  "Dr. Kamran Baig": { status: "Available", sc: "text-success-600", dot: "bg-success-500" },
  "Dr. Maria Sanchez": { status: "Booked", sc: "text-primary-600", dot: "bg-primary-400" },
};

export default function ReceptionistDashboardPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];
      const [{ data: queueData }, { data: doctorData }] = await Promise.all([
        supabase
          .from("queue_entries")
          .select(`id, token_number, status, checked_in_at,
            patients(patient_id, full_name, date_of_birth, gender),
            doctors(full_name), appointments(type)`)
          .eq("queue_date", today)
          .order("token_number"),
        supabase
          .from("doctors")
          .select("id, full_name, specialization")
          .eq("is_active", true)
          .order("full_name"),
      ]);
      setQueue((queueData as unknown as QueueRow[]) ?? []);
      setDoctors(doctorData ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = queue.filter((r) => !statusFilter || r.status === statusFilter);
  const totalToday = queue.length;
  const waiting = queue.filter((r) => r.status === "waiting").length;
  const inProgress = queue.filter((r) => r.status === "in_progress" || r.status === "called").length;
  const completed = queue.filter((r) => r.status === "completed").length;

  const stats = [
    { label: "Total Patients Today", value: String(totalToday), sub: "+8 from yesterday", subColor: "text-primary-600", icon: UserGroupIcon },
    { label: "Currently Waiting", value: String(waiting), sub: "⬆ Avg. wait 18 min", subColor: "text-warning-500", icon: Clock01Icon },
    { label: "In Consultation", value: String(inProgress), sub: "3 rooms active", subColor: "text-neutral-500", icon: StethoscopeIcon },
    { label: "Completed", value: String(completed), sub: "67% completion rate", subColor: "text-success-600", icon: CheckmarkCircle01Icon },
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
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading queue data...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-neutral-500 font-medium leading-tight">{s.label}</p>
              <HugeiconsIcon icon={s.icon} className="w-5 h-5 text-neutral-300 shrink-0" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{s.value}</p>
            <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Queue table */}
        <Card padding="none" className="col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-800">Today&apos;s Queue</h2>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "", label: "All Status" },
                  { value: "waiting", label: "Waiting" },
                  { value: "in_progress", label: "In Consultation" },
                  { value: "completed", label: "Completed" },
                ]}
                className="text-sm py-1.5"
              />
              <Button variant="primary" size="md" leftIcon={PlusSignIcon} className="shrink-0" onClick={() => router.push("/receptionist/patients/new")}>Add Patient</Button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["TOKEN", "PATIENT", "AGE", "VISIT TYPE", "DOCTOR", "WAIT TIME", "STATUS"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-400">No queue entries for today</td></tr>
              ) : filtered.map((row) => {
                const vt = visitTypeBadge(row.appointments?.type ?? "consultation");
                const st = statusBadge(row.status);
                return (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-neutral-500">{tokenLabel(row.token_number)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {getInitials(row.patients?.full_name ?? "?")}
                        </div>
                        <span className="text-sm font-medium text-neutral-800 whitespace-nowrap">{row.patients?.full_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{ageSex(row.patients?.date_of_birth ?? null, row.patients?.gender ?? null)}</td>
                    <td className="px-4 py-3"><Badge variant={vt.variant}>{vt.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{row.doctors?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-600">{waitMinutes(row.checked_in_at)}</td>
                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
            Showing {filtered.length} of {queue.length} entries · Today
          </div>
        </Card>

        {/* Doctors on Duty */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-800">Doctors on Duty</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {doctors.map((doc) => {
              const avail = doctorAvailability[doc.full_name] ?? { status: "Available", sc: "text-success-600", dot: "bg-success-500" };
              return (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                      {getInitials(doc.full_name.replace("Dr. ", ""))}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${avail.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{doc.full_name}</p>
                    <p className="text-[10px] text-neutral-400">{doc.specialization ?? "—"}</p>
                  </div>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${avail.sc}`}>{avail.status}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
