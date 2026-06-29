"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Drawer } from "@/components/ui/drawer";
import { Tabs } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, Search01Icon, EyeIcon, PrescriptionIcon, Delete01Icon, Invoice03Icon, AlertCircleIcon, CheckmarkCircle01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

type Visit = { date: string; reason: string; diagnosis: string; doctor: string };
type RxRecord = { date: string; drugs: string[]; status: "active" | "completed" };
type Bill = { invoiceNo: string; date: string; service: string; amount: number; paid: number; status: "paid" | "partial" | "issued" };

type Patient = {
  id: string; pid: string; name: string; age: number; gender: string;
  phone: string; address: string; bloodType: string;
  diagnosis: string; lastVisit: string; nextAppt: string; status: string;
  allergies: string; medications: string[]; notes: string;
  visits: Visit[]; prescriptions: RxRecord[]; bills: Bill[];
};

const statusBadge: Record<string, "success" | "info" | "neutral"> = {
  active: "success", follow_up: "info", discharged: "neutral",
};
const statusLabel: Record<string, string> = {
  active: "Active", follow_up: "Follow-up", discharged: "Discharged",
};
const billStatusBadge: Record<string, "success" | "warning" | "info"> = {
  paid: "success", partial: "warning", issued: "info",
};

const filterTabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "follow_up", label: "Follow-up Due" },
];

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const supabase = createClient();
      const { data, error } = await (supabase
        .from("patients")
        .select(`
          id, patient_id, full_name, date_of_birth, gender, phone, address, blood_group, allergies, notes,
          appointments(id, type, appointment_date, status, chief_complaint, doctors(full_name)),
          prescriptions(id, prescription_no, created_at, status, prescription_items(medicine_name))
        `) as any);

      if (data && !error) {
        const mapped: Patient[] = data.map((p: any) => {
          const birthDate = p.date_of_birth;
          let age = 0;
          if (birthDate) {
            age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31536000000);
          }
          
          const visits = (p.appointments ?? []).map((appt: any) => ({
            date: appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—",
            reason: appt.chief_complaint ?? appt.type ?? "OPD Review",
            diagnosis: appt.chief_complaint ?? "OPD Review",
            doctor: appt.doctors?.full_name ?? "Dr. Sarah Ahmed"
          }));

          const prescriptions = (p.prescriptions ?? []).map((rx: any) => ({
            date: rx.created_at ? new Date(rx.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—",
            drugs: (rx.prescription_items ?? []).map((item: any) => item.medicine_name),
            status: rx.status === "active" ? "active" : "completed"
          }));

          const hasActiveAppt = (p.appointments ?? []).some((appt: any) => appt.status !== "completed");
          const status = hasActiveAppt ? "active" : "discharged";

          return {
            id: p.id,
            pid: p.patient_id,
            name: p.full_name,
            age: age,
            gender: p.gender === "male" ? "M" : p.gender === "female" ? "F" : "O",
            phone: p.phone ?? "—",
            address: p.address ?? "—",
            bloodType: p.blood_group ?? "—",
            diagnosis: p.notes ?? "Regular Checkup",
            lastVisit: visits[0]?.date ?? "—",
            nextAppt: "Not scheduled",
            status: status,
            allergies: p.allergies ?? "None",
            medications: prescriptions[0]?.drugs ?? [],
            notes: p.notes ?? "",
            visits: visits,
            prescriptions: prescriptions,
            bills: []
          };
        });
        setPatients(mapped);
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.pid.includes(search);
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const openDrawer = (p: Patient) => {
    setDrawerTab("overview");
    setSelectedPatient(p);
  };
  
  const confirmDelete = () => {
    if (!toDelete) return;
    setPatients((list) => list.filter((p) => p.id !== toDelete.id));
    if (selectedPatient?.id === toDelete.id) setSelectedPatient(null);
    setToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-5 w-full animate-pulse">
        <PageHeader title="My Patients" subtitle="All patients under your care" />
        <Card className="p-8 text-center text-sm text-neutral-400">Loading patient database...</Card>
      </div>
    );
  }

  const statCards = [
    { title: "Total Patients", value: String(patients.length), icon: UserGroupIcon, subtitle: "Registered patients", subtitleColor: "text-neutral-500" },
    { title: "Active Patients", value: String(patients.filter(p=>p.status==="active").length), icon: CheckmarkCircle01Icon, subtitle: "Under active care", subtitleColor: "text-emerald-600" },
    { title: "Follow-up Due", value: String(patients.filter(p=>p.status==="follow_up").length), icon: AlertCircleIcon, subtitle: "Require review", subtitleColor: "text-amber-600" },
    { title: "New This Month", value: "12", icon: PlusSignIcon, subtitle: "+15% from last month", subtitleColor: "text-blue-600" },
  ];

  return (
    <div className="space-y-5 w-full">
      <PageHeader
        title="My Patients"
        subtitle="All patients under your care"
        action={<Button variant="outline" size="sm">Export</Button>}
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:max-w-xs">
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            leftIcon={Search01Icon}
          />
        </div>
        <div className="flex gap-1.5 self-stretch sm:self-auto overflow-x-auto">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className={`px-4 py-2 rounded-t-lg rounded-b-none text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === t.id
                  ? "bg-[#0B6E6E] text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table Card */}
      <Card padding="none" className="overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-[#FBFCFD] select-none">
                {["Patient ID", "Patient Name", "Age / Gender", "Blood Type", "Diagnosis", "Mobile Number", "Address", "Last Visit", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-neutral-450 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center">
                    <EmptyState
                      icon={UserGroupIcon}
                      title="No patients found"
                      description="Try adjusting your search query or filters."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openDrawer(p)}
                    className="hover:bg-neutral-50/50 cursor-pointer transition-colors text-sm"
                  >
                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-neutral-500">
                      {p.pid}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0b6e6e] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {p.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <p className="font-semibold text-neutral-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {p.age}y • {p.gender === "M" ? "Male" : "Female"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-neutral-100 text-neutral-700 border border-neutral-200/50 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                        {p.bloodType || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-neutral-800">
                      {p.diagnosis}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-mono font-medium">
                      {p.phone || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 truncate max-w-[200px]" title={p.address || "-"}>
                      {p.address || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-medium">
                      {p.lastVisit}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openDrawer(p)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          title="View Overview"
                        >
                          <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setToDelete(p)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Patient"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient detail drawer */}
      {selectedPatient && (
        <Drawer
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={selectedPatient.name}
          subtitle={`${selectedPatient.age}y • ${selectedPatient.gender === "M" ? "Male" : "Female"} • ${selectedPatient.pid}`}
          showFooter={false}
        >
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "history", label: "Visit History" },
              { id: "rx", label: "Prescriptions" },
              { id: "billing", label: "Billing" },
            ]}
            activeTab={drawerTab}
            onChange={setDrawerTab}
            className="mb-5"
          />

          {drawerTab === "overview" && (
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Diagnosis</p>
                  <p className="text-sm text-neutral-800">{selectedPatient.diagnosis}</p>
                </div>
                <div className="bg-error-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-error-400 uppercase mb-1">Allergies</p>
                  <p className="text-sm text-error-700">{selectedPatient.allergies}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Current Medications</p>
                <div className="space-y-1.5">
                  {selectedPatient.medications.map((med, i) => (
                    <div key={i} className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      <span className="text-sm text-primary-800">{med}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Doctor&apos;s Notes</p>
                <p className="text-sm text-neutral-700">{selectedPatient.notes}</p>
              </div>
            </div>
          )}

          {drawerTab === "history" && (
            <div className="space-y-3 text-left">
              {selectedPatient.visits.map((v, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-neutral-800">{v.reason}</p>
                    <span className="text-xs text-neutral-400">{v.date}</span>
                  </div>
                  <p className="text-xs text-neutral-500">Diagnosis: <span className="text-neutral-700">{v.diagnosis}</span></p>
                  <p className="text-xs text-neutral-400 mt-0.5">{v.doctor}</p>
                </div>
              ))}
            </div>
          )}

          {drawerTab === "rx" && (
            <div className="space-y-3 text-left">
              {selectedPatient.prescriptions.map((rx, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-400">{rx.date}</span>
                    <Badge variant={rx.status === "active" ? "success" : "neutral"}>{rx.status === "active" ? "Active" : "Completed"}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.drugs.map((d, j) => (
                      <span key={j} className="text-xs bg-primary-50 text-primary-700 rounded-md px-2 py-1">{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {drawerTab === "billing" && (
            <div className="space-y-4 text-left">
              {/* Last billing highlight */}
              {selectedPatient.bills[0] && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HugeiconsIcon icon={Invoice03Icon} className="w-4 h-4 text-primary-600" />
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Last Billing</p>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-neutral-500">{selectedPatient.bills[0].invoiceNo}</span>
                    <Badge variant={billStatusBadge[selectedPatient.bills[0].status]}>{selectedPatient.bills[0].status.charAt(0).toUpperCase()+selectedPatient.bills[0].status.slice(1)}</Badge>
                  </div>
                  <p className="text-sm text-neutral-700">{selectedPatient.bills[0].service}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-200/60">
                    <span className="text-xs text-neutral-500">{selectedPatient.bills[0].date}</span>
                    <span className="text-sm font-bold text-neutral-900">
                      ₹{selectedPatient.bills[0].paid.toLocaleString()} <span className="text-xs font-normal text-neutral-400">/ ₹{selectedPatient.bills[0].amount.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Billing history */}
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Billing History</p>
                <div className="space-y-2">
                  {selectedPatient.bills.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 border border-neutral-200 rounded-lg px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{b.service}</p>
                        <p className="text-xs text-neutral-400 font-mono">{b.invoiceNo} • {b.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-neutral-800">₹{b.amount.toLocaleString()}</p>
                        <Badge variant={billStatusBadge[b.status]}>{b.status.charAt(0).toUpperCase()+b.status.slice(1)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Drawer>
      )}

      {/* Delete confirmation modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setToDelete(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl border border-neutral-300 p-6 text-center animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-12 w-12 rounded-xl bg-error-50 border border-error-200/60 flex items-center justify-center text-error-600 mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">Remove patient?</h3>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              This will remove <span className="font-semibold text-neutral-700">{toDelete.name}</span> ({toDelete.pid}) from your patient list. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-5">
              <Button variant="outline" className="w-full" onClick={() => setToDelete(null)}>Cancel</Button>
              <Button variant="primary" className="w-full bg-error-600 hover:bg-error-700" leftIcon={Delete01Icon} onClick={confirmDelete}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
