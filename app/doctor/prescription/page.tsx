"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, EyeIcon, PrinterIcon, Search01Icon, PrescriptionIcon } from "@hugeicons/core-free-icons";

type Rx = {
  id: string; rxNo: string; patient: string; initials: string;
  diagnosis: string; drugs: string[]; date: string; followUp: string; status: string;
};

const mockRx: Rx[] = [
  { id:"1", rxNo:"RX-000001", patient:"Priya Sharma",   initials:"PS", diagnosis:"Hypertension",      drugs:["Amlodipine 5mg","Telmisartan 40mg"],         date:"20 Jun 2026", followUp:"20 Jul 2026", status:"active"    },
  { id:"2", rxNo:"RX-000002", patient:"Rahul Mehta",    initials:"RM", diagnosis:"Acute Bronchitis",  drugs:["Azithromycin 500mg","Broncodil","Paracetamol"],date:"18 Jun 2026", followUp:"—",           status:"completed" },
  { id:"3", rxNo:"RX-000003", patient:"Meera Krishnan", initials:"MK", diagnosis:"Type 2 Diabetes",  drugs:["Metformin 500mg","Glimepiride 1mg"],            date:"15 Jun 2026", followUp:"15 Jul 2026", status:"active"    },
  { id:"4", rxNo:"RX-000004", patient:"Arjun Nair",     initials:"AN", diagnosis:"Viral Fever",      drugs:["Paracetamol 500mg","ORS","Cetirizine"],         date:"12 Jun 2026", followUp:"—",           status:"completed" },
  { id:"5", rxNo:"RX-000005", patient:"Sunita Gupta",   initials:"SG", diagnosis:"Osteoarthritis",   drugs:["Calcium 500mg","Vitamin D3","Etoricoxib 90mg"], date:"10 Jun 2026", followUp:"10 Jul 2026", status:"active"    },
  { id:"6", rxNo:"RX-000006", patient:"Kiran Desai",    initials:"KD", diagnosis:"GERD",             drugs:["Pantoprazole 40mg","Domperidone 10mg"],          date:"8 Jun 2026",  followUp:"—",           status:"active"    },
  { id:"7", rxNo:"RX-000007", patient:"Asha Patel",     initials:"AP", diagnosis:"Heart Failure",    drugs:["Furosemide 40mg","Spironolactone 25mg"],         date:"5 Jun 2026",  followUp:"19 Jun 2026", status:"active"    },
  { id:"8", rxNo:"RX-000008", patient:"Dev Joshi",      initials:"DJ", diagnosis:"Allergic Rhinitis",drugs:["Cetirizine 10mg","Nasal spray","Montelukast"],   date:"1 Jun 2026",  followUp:"—",           status:"cancelled" },
];

const statusBadge: Record<string, "success" | "neutral" | "error"> = {
  active: "success", completed: "neutral", cancelled: "error",
};

export default function DoctorPrescriptionListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  const filtered = mockRx.filter((r) => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.rxNo.includes(search) || r.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns: Column<Rx>[] = [
    {
      key: "rxNo", header: "Rx No.", width: "110px",
      render: (v: string) => <span className="font-mono text-xs text-neutral-500">{v}</span>,
    },
    {
      key: "patient", header: "Patient",
      render: (v: string, row: Rx) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" fallback={row.initials} />
          <span className="font-medium text-neutral-800">{v}</span>
        </div>
      ),
    },
    { key: "diagnosis", header: "Diagnosis" },
    {
      key: "drugs", header: "Medications",
      render: (v: string[]) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-neutral-600 truncate max-w-[120px]">{v[0]}</span>
          {v.length > 1 && <Badge variant="neutral">+{v.length - 1}</Badge>}
        </div>
      ),
    },
    { key: "date", header: "Date", render: (v: string) => <span className="text-sm text-neutral-600">{v}</span> },
    {
      key: "followUp", header: "Follow-up",
      render: (v: string) => <span className={`text-sm ${v === "—" ? "text-neutral-300" : "text-neutral-600"}`}>{v}</span>,
    },
    {
      key: "status", header: "Status",
      render: (v: string) => <Badge variant={statusBadge[v] ?? "neutral"}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>,
    },
    {
      key: "id", header: "Actions", width: "80px",
      render: (_: string, row: Rx) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="p-1.5" onClick={(e) => { e.stopPropagation(); router.push(`/doctor/prescription/${row.id}`); }}>
            <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="p-1.5">
            <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle="All prescriptions written by you"
        action={<Button leftIcon={PlusSignIcon} onClick={() => setShowNewModal(true)}>New Prescription</Button>}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 max-w-xs">
          <Input placeholder="Search by patient, Rx No., diagnosis..." value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} leftIcon={Search01Icon} />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
          options={[{ value: "", label: "All Statuses" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]}
        />
        <Input type="date" placeholder="From date" className="w-36" />
        <Input type="date" placeholder="To date" className="w-36" />
      </div>

      <DataTable columns={columns} data={filtered} keyField="id" onRowClick={(row) => router.push(`/doctor/prescription/${row.id}`)} />

      <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
        <span>Showing {filtered.length} of 142 prescriptions</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {/* New Prescription modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Prescription">
        <div className="text-left space-y-3 mt-2">
          <p className="text-sm text-neutral-500">Search for a patient to write a prescription.</p>
          <Input
            label="Search Patient"
            placeholder="Name or Patient ID..."
            value={patientSearch}
            onChange={(e) => setPatientSearch((e.target as HTMLInputElement).value)}
            leftIcon={Search01Icon}
          />
          {patientSearch && (
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
              {["Priya Sharma (ZC-0001)", "Rahul Mehta (ZC-0002)", "Meera Krishnan (ZC-0003)"]
                .filter((p) => p.toLowerCase().includes(patientSearch.toLowerCase()))
                .map((p) => (
                  <button key={p} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-800" onClick={() => { router.push("/doctor/prescription/new"); setShowNewModal(false); }}>
                    {p}
                  </button>
                ))}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" leftIcon={PrescriptionIcon} onClick={() => { router.push("/doctor/prescription/new"); setShowNewModal(false); }}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
