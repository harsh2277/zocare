"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, Column } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Drawer } from "@/components/ui/drawer";
import { Tabs } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, Search01Icon, EyeIcon, PrescriptionIcon } from "@hugeicons/core-free-icons";

type Patient = {
  id: string; pid: string; name: string; age: number; gender: string;
  diagnosis: string; lastVisit: string; nextAppt: string; status: string;
  allergies: string; medications: string[]; notes: string;
};

const mockPatients: Patient[] = [
  { id:"1", pid:"ZC-0001", name:"Priya Sharma",   age:34, gender:"F", diagnosis:"Hypertension",        lastVisit:"20 Jun 2026", nextAppt:"25 Jul 2026", status:"active",   allergies:"None",       medications:["Amlodipine 5mg"],              notes:"BP controlled. Continue medication." },
  { id:"2", pid:"ZC-0002", name:"Rahul Mehta",    age:28, gender:"M", diagnosis:"Acute Bronchitis",    lastVisit:"18 Jun 2026", nextAppt:"Not scheduled", status:"follow_up",allergies:"Penicillin",  medications:["Azithromycin 500mg","Broncodil"],notes:"Follow up after 1 week." },
  { id:"3", pid:"ZC-0003", name:"Meera Krishnan", age:45, gender:"F", diagnosis:"Type 2 Diabetes",    lastVisit:"15 Jun 2026", nextAppt:"15 Jul 2026", status:"active",   allergies:"Sulfa drugs", medications:["Metformin 500mg","Glimepiride"], notes:"HbA1c improving. Diet compliance good." },
  { id:"4", pid:"ZC-0004", name:"Arjun Nair",     age:22, gender:"M", diagnosis:"Viral Fever",        lastVisit:"12 Jun 2026", nextAppt:"Not scheduled", status:"active",   allergies:"None",       medications:["Paracetamol 500mg"],           notes:"Recovered. No follow-up needed." },
  { id:"5", pid:"ZC-0005", name:"Sunita Gupta",   age:58, gender:"F", diagnosis:"Osteoarthritis",     lastVisit:"10 Jun 2026", nextAppt:"10 Jul 2026", status:"active",   allergies:"NSAIDs",     medications:["Calcium 500mg","Vitamin D3"],   notes:"Physiotherapy recommended." },
  { id:"6", pid:"ZC-0006", name:"Kiran Desai",    age:41, gender:"M", diagnosis:"GERD",               lastVisit:"8 Jun 2026",  nextAppt:"8 Jul 2026",  status:"active",   allergies:"None",       medications:["Pantoprazole 40mg"],           notes:"Lifestyle modifications advised." },
  { id:"7", pid:"ZC-0007", name:"Asha Patel",     age:67, gender:"F", diagnosis:"Heart Failure",      lastVisit:"5 Jun 2026",  nextAppt:"19 Jun 2026", status:"follow_up",allergies:"Aspirin",    medications:["Furosemide","Spironolactone"],  notes:"Monitor fluid retention." },
  { id:"8", pid:"ZC-0008", name:"Dev Joshi",      age:19, gender:"M", diagnosis:"Allergic Rhinitis",  lastVisit:"1 Jun 2026",  nextAppt:"Not scheduled", status:"active",   allergies:"Dust mites", medications:["Cetirizine 10mg","Nasal spray"],notes:"Avoid allergen exposure." },
];

const statusBadge: Record<string, "success" | "info" | "neutral"> = {
  active: "success", follow_up: "info", discharged: "neutral",
};
const statusLabel: Record<string, string> = {
  active: "Active", follow_up: "Follow-up", discharged: "Discharged",
};

const filterTabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "follow_up", label: "Follow-up Due" },
];

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");

  const filtered = mockPatients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.pid.includes(search);
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const columns: Column<Patient>[] = [
    {
      key: "name", header: "Patient",
      render: (v: string, row: Patient) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" fallback={v.slice(0,2).toUpperCase()} />
          <div>
            <p className="font-semibold text-neutral-800">{v}</p>
            <p className="text-xs font-mono text-neutral-400">{row.pid}</p>
          </div>
        </div>
      ),
    },
    {
      key: "age", header: "Age / Gender",
      render: (v: number, row: Patient) => <span className="text-sm text-neutral-600">{v}y • {row.gender === "M" ? "Male" : "Female"}</span>,
    },
    { key: "diagnosis", header: "Diagnosis" },
    {
      key: "lastVisit", header: "Last Visit",
      render: (v: string) => <span className="text-sm text-neutral-600">{v}</span>,
    },
    {
      key: "nextAppt", header: "Next Appointment",
      render: (v: string) => <span className={`text-sm ${v === "Not scheduled" ? "text-neutral-400 italic" : "text-neutral-700"}`}>{v}</span>,
    },
    {
      key: "status", header: "Status",
      render: (v: string) => <Badge variant={statusBadge[v] ?? "neutral"}>{statusLabel[v] ?? v}</Badge>,
    },
    {
      key: "id", header: "Actions", width: "80px",
      render: (_: string, row: Patient) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="p-1.5" onClick={(e) => { e.stopPropagation(); setSelectedPatient(row); }}>
            <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="p-1.5">
            <HugeiconsIcon icon={PrescriptionIcon} className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Patients"
        subtitle="All patients under your care"
        action={<Button variant="outline" size="sm">Export</Button>}
      />

      {/* Stats */}
      <div className="flex items-center gap-3 mb-5">
        {[["Total", "186"], ["Active", "142"], ["Follow-up Due", "28"], ["New This Month", "12"]].map(([l, v]) => (
          <div key={l} className="bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
            <span className="text-base font-bold text-neutral-900">{v}</span>
            <span className="text-xs text-neutral-500">{l}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-xs">
          <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} leftIcon={Search01Icon} />
        </div>
        <div className="flex gap-1.5">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === t.id ? "bg-primary-600 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        onRowClick={(row) => setSelectedPatient(row)}
        emptyState={<EmptyState icon={UserGroupIcon} title="No patients found" description="Try adjusting your search filters." />}
      />

      {/* Patient detail drawer */}
      {selectedPatient && (
        <Drawer
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={selectedPatient.name}
          subtitle={`${selectedPatient.age}y • ${selectedPatient.gender === "M" ? "Male" : "Female"} • ${selectedPatient.pid}`}
          confirmText="Write Prescription"
          cancelText="Close"
        >
          <Tabs
            tabs={[{ id: "overview", label: "Overview" }, { id: "history", label: "Visit History" }, { id: "rx", label: "Prescriptions" }]}
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
            <p className="text-sm text-neutral-500 text-center py-8">Visit history coming soon.</p>
          )}
          {drawerTab === "rx" && (
            <p className="text-sm text-neutral-500 text-center py-8">Prescription history coming soon.</p>
          )}
        </Drawer>
      )}
    </div>
  );
}
