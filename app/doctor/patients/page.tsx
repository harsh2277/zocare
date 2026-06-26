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
import { UserGroupIcon, Search01Icon, EyeIcon, PrescriptionIcon, Delete01Icon, Invoice03Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";

type Visit = { date: string; reason: string; diagnosis: string; doctor: string };
type RxRecord = { date: string; drugs: string[]; status: "active" | "completed" };
type Bill = { invoiceNo: string; date: string; service: string; amount: number; paid: number; status: "paid" | "partial" | "issued" };

type Patient = {
  id: string; pid: string; name: string; age: number; gender: string;
  diagnosis: string; lastVisit: string; nextAppt: string; status: string;
  allergies: string; medications: string[]; notes: string;
  visits: Visit[]; prescriptions: RxRecord[]; bills: Bill[];
};

const mockPatients: Patient[] = [
  {
    id:"1", pid:"ZC-0001", name:"Priya Sharma", age:34, gender:"F", diagnosis:"Hypertension",
    lastVisit:"20 Jun 2026", nextAppt:"25 Jul 2026", status:"active", allergies:"None",
    medications:["Amlodipine 5mg"], notes:"BP controlled. Continue medication.",
    visits:[
      { date:"20 Jun 2026", reason:"Routine BP review", diagnosis:"Hypertension", doctor:"Dr. Anita Sharma" },
      { date:"22 May 2026", reason:"Headache, dizziness", diagnosis:"Hypertension", doctor:"Dr. Anita Sharma" },
      { date:"18 Apr 2026", reason:"First consultation", diagnosis:"Hypertension", doctor:"Dr. Anita Sharma" },
    ],
    prescriptions:[
      { date:"20 Jun 2026", drugs:["Amlodipine 5mg"], status:"active" },
      { date:"22 May 2026", drugs:["Amlodipine 2.5mg","Aspirin 75mg"], status:"completed" },
    ],
    bills:[
      { invoiceNo:"INV-000001", date:"20 Jun 2026", service:"Consultation + ECG", amount:1500, paid:1500, status:"paid" },
      { invoiceNo:"INV-000045", date:"22 May 2026", service:"Consultation", amount:800, paid:800, status:"paid" },
    ],
  },
  {
    id:"2", pid:"ZC-0002", name:"Rahul Mehta", age:28, gender:"M", diagnosis:"Acute Bronchitis",
    lastVisit:"18 Jun 2026", nextAppt:"Not scheduled", status:"follow_up", allergies:"Penicillin",
    medications:["Azithromycin 500mg","Broncodil"], notes:"Follow up after 1 week.",
    visits:[
      { date:"18 Jun 2026", reason:"Fever and cough for 5 days", diagnosis:"Acute Bronchitis", doctor:"Dr. Vikram Patel" },
    ],
    prescriptions:[
      { date:"18 Jun 2026", drugs:["Azithromycin 500mg","Broncodil Syrup"], status:"active" },
    ],
    bills:[
      { invoiceNo:"INV-000002", date:"18 Jun 2026", service:"Consultation + Nebulization", amount:2200, paid:0, status:"issued" },
    ],
  },
  {
    id:"3", pid:"ZC-0003", name:"Meera Krishnan", age:45, gender:"F", diagnosis:"Type 2 Diabetes",
    lastVisit:"15 Jun 2026", nextAppt:"15 Jul 2026", status:"active", allergies:"Sulfa drugs",
    medications:["Metformin 500mg","Glimepiride"], notes:"HbA1c improving. Diet compliance good.",
    visits:[
      { date:"15 Jun 2026", reason:"Quarterly diabetes review", diagnosis:"Type 2 Diabetes", doctor:"Dr. Anita Sharma" },
      { date:"12 Mar 2026", reason:"HbA1c follow-up", diagnosis:"Type 2 Diabetes", doctor:"Dr. Anita Sharma" },
    ],
    prescriptions:[
      { date:"15 Jun 2026", drugs:["Metformin 500mg","Glimepiride 1mg"], status:"active" },
    ],
    bills:[
      { invoiceNo:"INV-000003", date:"15 Jun 2026", service:"Consultation + Blood Test Package", amount:4500, paid:2000, status:"partial" },
    ],
  },
  {
    id:"4", pid:"ZC-0004", name:"Arjun Nair", age:22, gender:"M", diagnosis:"Viral Fever",
    lastVisit:"12 Jun 2026", nextAppt:"Not scheduled", status:"active", allergies:"None",
    medications:["Paracetamol 500mg"], notes:"Recovered. No follow-up needed.",
    visits:[{ date:"12 Jun 2026", reason:"Fever and body ache", diagnosis:"Viral Fever", doctor:"Dr. Vikram Patel" }],
    prescriptions:[{ date:"12 Jun 2026", drugs:["Paracetamol 500mg"], status:"completed" }],
    bills:[{ invoiceNo:"INV-000004", date:"12 Jun 2026", service:"Consultation", amount:800, paid:800, status:"paid" }],
  },
  {
    id:"5", pid:"ZC-0005", name:"Sunita Gupta", age:58, gender:"F", diagnosis:"Osteoarthritis",
    lastVisit:"10 Jun 2026", nextAppt:"10 Jul 2026", status:"active", allergies:"NSAIDs",
    medications:["Calcium 500mg","Vitamin D3"], notes:"Physiotherapy recommended.",
    visits:[{ date:"10 Jun 2026", reason:"Joint pain in both knees", diagnosis:"Osteoarthritis", doctor:"Dr. Mohan Iyer" }],
    prescriptions:[{ date:"10 Jun 2026", drugs:["Calcium 500mg","Vitamin D3"], status:"active" }],
    bills:[{ invoiceNo:"INV-000005", date:"10 Jun 2026", service:"Physiotherapy (3x)", amount:3600, paid:3600, status:"paid" }],
  },
  {
    id:"6", pid:"ZC-0006", name:"Kiran Desai", age:41, gender:"M", diagnosis:"GERD",
    lastVisit:"8 Jun 2026", nextAppt:"8 Jul 2026", status:"active", allergies:"None",
    medications:["Pantoprazole 40mg"], notes:"Lifestyle modifications advised.",
    visits:[{ date:"8 Jun 2026", reason:"Acidity and bloating", diagnosis:"GERD", doctor:"Dr. Vikram Patel" }],
    prescriptions:[{ date:"8 Jun 2026", drugs:["Pantoprazole 40mg"], status:"active" }],
    bills:[{ invoiceNo:"INV-000006", date:"8 Jun 2026", service:"Endoscopy Procedure", amount:8500, paid:0, status:"issued" }],
  },
  {
    id:"7", pid:"ZC-0007", name:"Asha Patel", age:67, gender:"F", diagnosis:"Heart Failure",
    lastVisit:"5 Jun 2026", nextAppt:"19 Jun 2026", status:"follow_up", allergies:"Aspirin",
    medications:["Furosemide","Spironolactone"], notes:"Monitor fluid retention.",
    visits:[{ date:"5 Jun 2026", reason:"Swelling in ankles", diagnosis:"Heart Failure", doctor:"Dr. Anita Sharma" }],
    prescriptions:[{ date:"5 Jun 2026", drugs:["Furosemide 40mg","Spironolactone 25mg"], status:"active" }],
    bills:[{ invoiceNo:"INV-000007", date:"5 Jun 2026", service:"Cardiology Review", amount:3200, paid:3200, status:"paid" }],
  },
  {
    id:"8", pid:"ZC-0008", name:"Dev Joshi", age:19, gender:"M", diagnosis:"Allergic Rhinitis",
    lastVisit:"1 Jun 2026", nextAppt:"Not scheduled", status:"active", allergies:"Dust mites",
    medications:["Cetirizine 10mg","Nasal spray"], notes:"Avoid allergen exposure.",
    visits:[{ date:"1 Jun 2026", reason:"Runny nose and sneezing", diagnosis:"Allergic Rhinitis", doctor:"Dr. Sneha Rao" }],
    prescriptions:[{ date:"1 Jun 2026", drugs:["Cetirizine 10mg","Nasal Spray"], status:"completed" }],
    bills:[{ invoiceNo:"INV-000008", date:"1 Jun 2026", service:"Consultation", amount:1200, paid:0, status:"issued" }],
  },
];

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
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const filtered = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.pid.includes(search);
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const openDrawer = (p: Patient) => { setDrawerTab("overview"); setSelectedPatient(p); };
  const confirmDelete = () => {
    if (!toDelete) return;
    setPatients((list) => list.filter((p) => p.id !== toDelete.id));
    if (selectedPatient?.id === toDelete.id) setSelectedPatient(null);
    setToDelete(null);
  };

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
      key: "id", header: "Actions", width: "120px",
      render: (_: string, row: Patient) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="p-1.5" onClick={(e) => { e.stopPropagation(); openDrawer(row); }} title="View">
            <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="p-1.5" title="Prescription">
            <HugeiconsIcon icon={PrescriptionIcon} className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="p-1.5 text-error-500 hover:bg-error-50" onClick={(e) => { e.stopPropagation(); setToDelete(row); }} title="Delete">
            <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
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
        {[["Total", String(patients.length)], ["Active", String(patients.filter(p=>p.status==="active").length)], ["Follow-up Due", String(patients.filter(p=>p.status==="follow_up").length)], ["New This Month", "12"]].map(([l, v]) => (
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
        onRowClick={openDrawer}
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
