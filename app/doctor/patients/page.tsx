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

const mockPatients: Patient[] = [
  {
    id:"1", pid:"ZC-0001", name:"Priya Sharma", age:34, gender:"F", phone:"+91 98765 43210", address:"Flat 402, Shanti Vihar, Mumbai", bloodType:"O+", diagnosis:"Hypertension",
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
    id:"2", pid:"ZC-0002", name:"Rahul Mehta", age:28, gender:"M", phone:"+91 87654 32109", address:"12, Park Street, Kolkata", bloodType:"A+", diagnosis:"Acute Bronchitis",
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
    id:"3", pid:"ZC-0003", name:"Meera Krishnan", age:45, gender:"F", phone:"+91 76543 21098", address:"Block C, Green Glen, Bangalore", bloodType:"B-", diagnosis:"Type 2 Diabetes",
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
    id:"4", pid:"ZC-0004", name:"Arjun Nair", age:22, gender:"M", phone:"+91 65432 10987", address:"Prithvi Enclave, Kochi", bloodType:"O-", diagnosis:"Viral Fever",
    lastVisit:"12 Jun 2026", nextAppt:"Not scheduled", status:"active", allergies:"None",
    medications:["Paracetamol 500mg"], notes:"Recovered. No follow-up needed.",
    visits:[{ date:"12 Jun 2026", reason:"Fever and body ache", diagnosis:"Viral Fever", doctor:"Dr. Vikram Patel" }],
    prescriptions:[{ date:"12 Jun 2026", drugs:["Paracetamol 500mg"], status:"completed" }],
    bills:[{ invoiceNo:"INV-000004", date:"12 Jun 2026", service:"Consultation", amount:800, paid:800, status:"paid" }],
  },
  {
    id:"5", pid:"ZC-0005", name:"Sunita Gupta", age:58, gender:"F", phone:"+91 91234 56789", address:"A-45, Ashok Vihar, Delhi", bloodType:"AB+", diagnosis:"Osteoarthritis",
    lastVisit:"10 Jun 2026", nextAppt:"10 Jul 2026", status:"active", allergies:"NSAIDs",
    medications:["Calcium 500mg","Vitamin D3"], notes:"Physiotherapy recommended.",
    visits:[{ date:"10 Jun 2026", reason:"Joint pain in both knees", diagnosis:"Osteoarthritis", doctor:"Dr. Mohan Iyer" }],
    prescriptions:[{ date:"10 Jun 2026", drugs:["Calcium 500mg","Vitamin D3"], status:"active" }],
    bills:[{ invoiceNo:"INV-000005", date:"10 Jun 2026", service:"Physiotherapy (3x)", amount:3600, paid:3600, status:"paid" }],
  },
  {
    id:"6", pid:"ZC-0006", name:"Kiran Desai", age:41, gender:"M", phone:"+91 92345 67890", address:"45/A, MG Road, Pune", bloodType:"B+", diagnosis:"GERD",
    lastVisit:"8 Jun 2026", nextAppt:"8 Jul 2026", status:"active", allergies:"None",
    medications:["Pantoprazole 40mg"], notes:"Lifestyle modifications advised.",
    visits:[{ date:"8 Jun 2026", reason:"Acidity and bloating", diagnosis:"GERD", doctor:"Dr. Vikram Patel" }],
    prescriptions:[{ date:"8 Jun 2026", drugs:["Pantoprazole 40mg"], status:"active" }],
    bills:[{ invoiceNo:"INV-000006", date:"8 Jun 2026", service:"Endoscopy Procedure", amount:8500, paid:0, status:"issued" }],
  },
  {
    id:"7", pid:"ZC-0007", name:"Asha Patel", age:67, gender:"F", phone:"+91 93456 78901", address:"Shanti Park, Ahmedabad", bloodType:"A-", diagnosis:"Heart Failure",
    lastVisit:"5 Jun 2026", nextAppt:"19 Jun 2026", status:"follow_up", allergies:"Aspirin",
    medications:["Furosemide","Spironolactone"], notes:"Monitor fluid retention.",
    visits:[{ date:"5 Jun 2026", reason:"Swelling in ankles", diagnosis:"Heart Failure", doctor:"Dr. Anita Sharma" }],
    prescriptions:[{ date:"5 Jun 2026", drugs:["Furosemide 40mg","Spironolactone 25mg"], status:"active" }],
    bills:[{ invoiceNo:"INV-000007", date:"5 Jun 2026", service:"Cardiology Review", amount:3200, paid:3200, status:"paid" }],
  },
  {
    id:"8", pid:"ZC-0008", name:"Dev Joshi", age:19, gender:"M", phone:"+91 94567 89012", address:"Model Town, Jaipur", bloodType:"AB-", diagnosis:"Allergic Rhinitis",
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
  const router = useRouter();
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
