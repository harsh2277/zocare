"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, GridViewIcon, ListSettingIcon, EyeIcon, Delete01Icon, StethoscopeIcon, PlusSignIcon, Cancel01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckInModal } from "@/components/app/check-in-modal";

type Patient = {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  doctorName: string | null;
  lastVisit: string | null;
  appointments: { appointment_date: string; type: string | null; status: string | null; doctorName: string }[];
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function ageYears(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31536000000);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedDetailPatient, setSelectedDetailPatient] = useState<Patient | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "history">("info");
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", email: "", gender: "", blood_group: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (p: Patient) => {
    setSelectedDetailPatient(null);
    setEditForm({
      full_name: p.full_name,
      phone: p.phone ?? "",
      email: p.email ?? "",
      gender: p.gender ?? "",
      blood_group: p.blood_group ?? "",
    });
    setEditingPatient(p);
  };

  const saveEdit = async () => {
    if (!editingPatient) return;
    setSavingEdit(true);
    const supabase = createClient();
    const { error } = await (supabase
      .from("patients") as any)
      .update({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone || null,
        email: editForm.email || null,
        gender: editForm.gender || null,
        blood_group: editForm.blood_group || null,
      } as any)
      .eq("id", editingPatient.id);
    setSavingEdit(false);
    if (error) {
      alert("Error updating patient: " + error.message);
      return;
    }
    setEditingPatient(null);
    loadPatients();
  };

  const loadPatients = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("patients")
      .select(`id, patient_id, full_name, date_of_birth, gender, blood_group, phone, email, is_active,
        appointments(appointment_date, type, status, doctors(full_name))`)
      .order("full_name");

    const rows = (data as unknown as {
      id: string; patient_id: string; full_name: string; date_of_birth: string | null;
      gender: string | null; blood_group: string | null; phone: string | null;
      email: string | null; is_active: boolean;
      appointments: { appointment_date: string; type: string | null; status: string | null; doctors: { full_name: string } | null }[] | null;
    }[]) ?? [];

    setPatients(rows.map((r) => {
      const sortedApps = (r.appointments ?? []).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
      const latest = sortedApps[0];
      return {
        id: r.id, patient_id: r.patient_id, full_name: r.full_name,
        date_of_birth: r.date_of_birth, gender: r.gender, blood_group: r.blood_group,
        phone: r.phone, email: r.email, is_active: r.is_active,
        doctorName: latest?.doctors?.full_name ?? null,
        lastVisit: latest?.appointment_date ?? null,
        appointments: sortedApps.map((app) => ({
          appointment_date: app.appointment_date,
          type: app.type,
          status: app.status,
          doctorName: app.doctors?.full_name ?? "Unassigned"
        }))
      };
    }));
    setLoading(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.patient_id ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter ||
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active);
    return matchSearch && matchStatus;
  });

  const totalCount = patients.length;
  const activeCount = patients.filter((p) => p.is_active).length;
  const inactiveCount = patients.filter((p) => !p.is_active).length;

  const statCards = [
    { label: "Total Patients", value: String(totalCount), sub: "All time", subColor: "text-primary-600" },
    { label: "Active Patients", value: String(activeCount), sub: "Currently registered", subColor: "text-success-600" },
    { label: "Inactive", value: String(inactiveCount), sub: "Discharged or paused", subColor: "text-neutral-500" },
    { label: "In Today's Queue", value: "—", sub: "See queue page", subColor: "text-neutral-400" },
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
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading patients...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-neutral-500 font-medium mb-3">{s.label}</p>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{s.value}</p>
            <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="max-w-xs w-full">
            <Input
              placeholder="Search by name or ID..."
              leftIcon={Search01Icon}
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden shrink-0">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${view === "grid" ? "bg-primary-600 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
            >
              <HugeiconsIcon icon={GridViewIcon} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${view === "list" ? "bg-primary-600 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
            >
              <HugeiconsIcon icon={ListSettingIcon} className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="md" leftIcon={PlusSignIcon} onClick={() => setShowCheckIn(true)}>
              Check In
            </Button>
            <Link href="/receptionist/patients/new">
              <Button variant="primary" size="md" leftIcon={PlusSignIcon}>Add Patient</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((p) => {
            const age = ageYears(p.date_of_birth);
            return (
              <Card key={p.id} className="hover:border-primary-200 transition-colors cursor-pointer" onClick={() => { setDetailTab("info"); setSelectedDetailPatient(p); }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(p.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{p.full_name}</p>
                      <p className="text-[10px] text-neutral-400">{p.patient_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase">BLOOD</p>
                    <p className="text-sm font-bold text-neutral-700">{p.blood_group ?? "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase mb-0.5">ASSIGNED DOCTOR</p>
                    <p className="text-xs text-neutral-700 flex items-center gap-1">
                      <HugeiconsIcon icon={StethoscopeIcon} className="w-3 h-3 text-primary-500 shrink-0" />
                      <span className="truncate">{p.doctorName ?? "Unassigned"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase mb-0.5">AGE/GENDER</p>
                    <p className="text-xs text-neutral-700">{age ?? "?"}{p.gender === "male" ? "M" : p.gender === "female" ? "F" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <Badge variant={p.is_active ? "success" : "neutral"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                  <p className="text-[10px] text-neutral-400">{fmtDate(p.lastVisit)}</p>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-4 py-16 text-center text-sm text-neutral-400">No patients found</div>
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["PATIENT ID", "PATIENT NAME", "MOBILE NUMBER", "EMAIL", "AGE/GENDER", "BLOOD TYPE", "ASSIGNED DOCTOR", "LAST VISIT", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const age = ageYears(p.date_of_birth);
                return (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => { setDetailTab("info"); setSelectedDetailPatient(p); }}>
                    <td className="px-4 py-3 text-xs font-mono text-neutral-500">{p.patient_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{getInitials(p.full_name)}</div>
                        <span className="text-sm font-medium text-neutral-800 whitespace-nowrap">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{age ?? "?"} · {p.gender ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-700">{p.blood_group ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={StethoscopeIcon} className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        {p.doctorName ?? "Unassigned"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{fmtDate(p.lastVisit)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_active ? "success" : "neutral"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" leftIcon={EyeIcon} className="text-neutral-400 hover:text-primary-600" onClick={() => { setDetailTab("info"); setSelectedDetailPatient(p); }} />
                        <Button variant="ghost" size="sm" leftIcon={PencilEdit01Icon} className="text-neutral-400 hover:text-primary-600" onClick={() => openEdit(p)} />
                        <Button variant="ghost" size="sm" leftIcon={Delete01Icon} className="text-neutral-400 hover:text-error-600" onClick={() => setDeletingPatient(p)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-sm text-neutral-400">No patients found</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">
              Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{patients.length}</span> patients
            </p>
          </div>
        </Card>
      )}

      <CheckInModal isOpen={showCheckIn} onClose={() => { setShowCheckIn(false); loadPatients(); }} />

      {/* Patient Detail Modal Pop-up */}
      {selectedDetailPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-800">Patient Profile details</h2>
              <button onClick={() => setSelectedDetailPatient(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {getInitials(selectedDetailPatient.full_name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug">{selectedDetailPatient.full_name}</h3>
                  <p className="text-sm text-neutral-400 mt-0.5">{selectedDetailPatient.patient_id}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-100">
                <button
                  onClick={() => setDetailTab("info")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-0 ${detailTab === "info" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                >
                  Info
                </button>
                <button
                  onClick={() => setDetailTab("history")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-0 ${detailTab === "history" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                >
                  History ({selectedDetailPatient.appointments?.length ?? 0})
                </button>
              </div>

              {detailTab === "info" && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Mobile Number</p>
                    <p className="text-sm font-semibold text-neutral-855">{selectedDetailPatient.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="text-sm font-semibold text-neutral-855 truncate">{selectedDetailPatient.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Age &amp; Gender</p>
                    <p className="text-sm font-semibold text-neutral-855">
                      {ageYears(selectedDetailPatient.date_of_birth) ?? "?"} · {selectedDetailPatient.gender ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Blood Type</p>
                    <p className="text-sm font-semibold text-neutral-855">{selectedDetailPatient.blood_group ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Assigned Doctor</p>
                    <p className="text-sm font-semibold text-primary-700">{selectedDetailPatient.doctorName ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Last Visit</p>
                    <p className="text-sm font-semibold text-neutral-855">{fmtDate(selectedDetailPatient.lastVisit)}</p>
                  </div>
                </div>
              )}

              {detailTab === "history" && (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedDetailPatient.appointments && selectedDetailPatient.appointments.length > 0 ? (
                    selectedDetailPatient.appointments.map((app, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                        <div>
                          <p className="font-semibold text-neutral-800">{fmtDate(app.appointment_date)}</p>
                          <p className="text-neutral-500 mt-0.5">Doctor: {app.doctorName}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={app.status === "completed" ? "success" : "neutral"} className="capitalize">
                            {app.status?.replace("_", " ") ?? "Unknown"}
                          </Badge>
                          <p className="text-[10px] text-neutral-400 mt-1 capitalize">{app.type ?? "Consultation"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-6">No visit history found.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between rounded-b-2xl">
              <Button
                variant="ghost"
                leftIcon={Delete01Icon}
                className="text-error-600 hover:bg-error-50"
                onClick={() => {
                  setDeletingPatient(selectedDetailPatient);
                  setSelectedDetailPatient(null);
                }}
              >
                Delete Patient
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" leftIcon={PencilEdit01Icon} onClick={() => openEdit(selectedDetailPatient)}>
                  Edit
                </Button>
                <Button variant="primary" onClick={() => setSelectedDetailPatient(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-2xl text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-error-50 border border-error-100 flex items-center justify-center text-error-600">
              <HugeiconsIcon icon={Delete01Icon} className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">Delete Patient Profile</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Are you sure you want to delete <strong>{deletingPatient.full_name}</strong>? This action cannot be undone and will remove all their records.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setDeletingPatient(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-error-600 hover:bg-error-700 border-0"
                onClick={async () => {
                  const supabase = createClient();
                  const { error } = await supabase.from("patients").delete().eq("id", deletingPatient.id);
                  if (error) {
                    alert("Error deleting patient: " + error.message);
                  } else {
                    setPatients((prev) => prev.filter((p) => p.id !== deletingPatient.id));
                  }
                  setDeletingPatient(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-800">Edit Patient</h2>
              <button onClick={() => setEditingPatient(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Full Name"
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: (e.target as HTMLInputElement).value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: (e.target as HTMLInputElement).value }))}
                />
                <Input
                  label="Email Address"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: (e.target as HTMLInputElement).value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Gender"
                  value={editForm.gender}
                  onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                  options={[{ value: "", label: "Select Gender" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
                />
                <Select
                  label="Blood Type"
                  value={editForm.blood_group}
                  onChange={(e) => setEditForm((f) => ({ ...f, blood_group: e.target.value }))}
                  options={[{ value: "", label: "Select Group" }, ...["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => ({ value: b, label: b }))]}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingPatient(null)}>Cancel</Button>
              <Button variant="primary" loading={savingEdit} onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
