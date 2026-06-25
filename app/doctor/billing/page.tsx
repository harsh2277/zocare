"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, Column } from "@/components/app/data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, EyeIcon, DownloadSquare01Icon, Edit02Icon, Invoice03Icon, Delete01Icon } from "@hugeicons/core-free-icons";

type Invoice = {
  id: string; invoiceNo: string; patient: string; initials: string;
  service: string; extraItems: number; amount: number; paid: number;
  status: string; date: string;
};

const invoices: Invoice[] = [
  { id:"1", invoiceNo:"INV-000001", patient:"Priya Sharma",   initials:"PS", service:"Consultation",        extraItems:1, amount:1500, paid:1500, status:"paid",    date:"20 Jun 2026" },
  { id:"2", invoiceNo:"INV-000002", patient:"Rahul Mehta",    initials:"RM", service:"Consultation",        extraItems:2, amount:2200, paid:0,    status:"issued",  date:"18 Jun 2026" },
  { id:"3", invoiceNo:"INV-000003", patient:"Meera Krishnan", initials:"MK", service:"Blood Test Package",  extraItems:3, amount:4500, paid:2000, status:"partial", date:"15 Jun 2026" },
  { id:"4", invoiceNo:"INV-000004", patient:"Arjun Nair",     initials:"AN", service:"Consultation",        extraItems:0, amount:800,  paid:800,  status:"paid",    date:"12 Jun 2026" },
  { id:"5", invoiceNo:"INV-000005", patient:"Sunita Gupta",   initials:"SG", service:"Physiotherapy (3x)",  extraItems:1, amount:3600, paid:3600, status:"paid",    date:"10 Jun 2026" },
  { id:"6", invoiceNo:"INV-000006", patient:"Kiran Desai",    initials:"KD", service:"Endoscopy Procedure", extraItems:2, amount:8500, paid:0,    status:"draft",   date:"8 Jun 2026"  },
  { id:"7", invoiceNo:"INV-000007", patient:"Asha Patel",     initials:"AP", service:"Cardiology Review",   extraItems:3, amount:3200, paid:3200, status:"paid",    date:"5 Jun 2026"  },
  { id:"8", invoiceNo:"INV-000008", patient:"Dev Joshi",      initials:"DJ", service:"Consultation",        extraItems:1, amount:1200, paid:0,    status:"cancelled",date:"1 Jun 2026"  },
];

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral" | "error"> = {
  paid: "success", issued: "info", partial: "warning", draft: "neutral", cancelled: "error", refunded: "neutral",
};

type LineItem = { description: string; category: string; qty: number; unitPrice: number };
const emptyItem: LineItem = { description: "", category: "consultation", qty: 1, unitPrice: 0 };

export default function DoctorBillingPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);

  const filtered = invoices.filter((inv) => {
    const ms = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNo.includes(search);
    const mf = !filterStatus || inv.status === filterStatus;
    return ms && mf;
  });

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const updateItem = (i: number, k: keyof LineItem, v: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  };
  const addItem = () => setItems((p) => [...p, { ...emptyItem }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const columns: Column<Invoice>[] = [
    { key: "invoiceNo", header: "Invoice #", width:"120px", render: (v:string) => <span className="font-mono text-xs text-neutral-400">{v}</span> },
    {
      key: "patient", header: "Patient",
      render: (v:string, row:Invoice) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" fallback={row.initials} />
          <span className="font-medium text-neutral-800">{v}</span>
        </div>
      ),
    },
    {
      key: "service", header: "Services",
      render: (v:string, row:Invoice) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-neutral-600 truncate max-w-[120px]">{v}</span>
          {row.extraItems > 0 && <Badge variant="neutral">+{row.extraItems}</Badge>}
        </div>
      ),
    },
    { key: "amount", header: "Amount",     render: (v:number) => <span className="font-semibold text-neutral-800">₹{v.toLocaleString()}</span> },
    { key: "paid",   header: "Paid",       render: (v:number, row:Invoice) => <span className={`font-medium ${v >= row.amount ? "text-success-600" : "text-warning-600"}`}>₹{v.toLocaleString()}</span> },
    { key: "status", header: "Status",     render: (v:string) => <Badge variant={statusVariant[v] ?? "neutral"}>{v.charAt(0).toUpperCase()+v.slice(1)}</Badge> },
    { key: "date",   header: "Date",       render: (v:string) => <span className="text-sm text-neutral-500">{v}</span> },
    {
      key: "id", header: "Actions", width:"90px",
      render: () => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="p-1.5"><HugeiconsIcon icon={EyeIcon} className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" className="p-1.5"><HugeiconsIcon icon={DownloadSquare01Icon} className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" className="p-1.5"><HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Invoices and payment management"
        action={<Button leftIcon={PlusSignIcon} onClick={() => setShowCreate(true)}>Create Invoice</Button>}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue",   value: "₹1,24,500", sub: "This month",   color: "text-success-600 bg-success-50 border-success-200" },
          { label: "Pending",         value: "₹18,200",   sub: "3 invoices",   color: "text-warning-600 bg-warning-50 border-warning-200" },
          { label: "Paid Invoices",   value: "89",         sub: "This month",   color: "text-primary-600 bg-primary-50 border-primary-200" },
          { label: "Overdue",         value: "4",          sub: "Follow up",    color: "text-error-600 bg-error-50 border-error-200"       },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl px-4 py-3.5 ${s.color}`}>
            <p className="text-xs font-semibold opacity-70 mb-1">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 max-w-xs">
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
          options={[{ value:"", label:"All Statuses" },{ value:"draft",label:"Draft" },{ value:"issued",label:"Issued" },{ value:"paid",label:"Paid" },{ value:"partial",label:"Partial" },{ value:"cancelled",label:"Cancelled" }]}
        />
        <Input type="date" className="w-36" />
        <Input type="date" className="w-36" />
      </div>

      <DataTable columns={columns} data={filtered} keyField="id" />

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice">
        <div className="text-left space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          <Input label="Search Patient" placeholder="Name or Patient ID" value={patientSearch} onChange={(e) => setPatientSearch((e.target as HTMLInputElement).value)} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Line Items</p>
              <Button size="sm" variant="ghost" leftIcon={PlusSignIcon} onClick={addItem}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", (e.target as HTMLInputElement).value)} /></div>
                  <div className="col-span-2"><Input placeholder="Qty" type="number" value={String(item.qty)} onChange={(e) => updateItem(i, "qty", Number((e.target as HTMLInputElement).value))} /></div>
                  <div className="col-span-3"><Input placeholder="Unit Price" type="number" value={String(item.unitPrice)} onChange={(e) => updateItem(i, "unitPrice", Number((e.target as HTMLInputElement).value))} /></div>
                  <div className="col-span-2">
                    <Button size="sm" variant="ghost" className="p-1.5 w-full text-error-500 hover:bg-error-50" onClick={() => removeItem(i)}>
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-medium">₹{subtotal}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Tax (18%)</span><span className="font-medium">₹{tax}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t border-neutral-200 mt-1"><span>Total</span><span>₹{total}</span></div>
          </div>
          <Select label="Payment Method" value="" onChange={() => {}} options={[{ value:"", label:"Select method" },{ value:"cash",label:"Cash" },{ value:"card",label:"Card" },{ value:"upi",label:"UPI" },{ value:"insurance",label:"Insurance" }]} />
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Save Draft</Button>
            <Button variant="primary" className="flex-1" leftIcon={Invoice03Icon} onClick={() => setShowCreate(false)}>Issue Invoice</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
