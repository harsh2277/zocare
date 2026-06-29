"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, EyeIcon, DownloadSquare01Icon, Invoice03Icon } from "@hugeicons/core-free-icons";

type Invoice = {
  id: string; invoiceNo: string; patient: string; initials: string;
  service: string; extraItems: number; amount: number; paid: number;
  status: string; date: string;
  itemsList?: { desc: string; qty: number; price: number }[];
};

const initialInvoices: Invoice[] = [
  {
    id:"1", invoiceNo:"INV-000001", patient:"Priya Sharma", initials:"PS", service:"Consultation", extraItems:1, amount:1500, paid:1500, status:"paid", date:"20 Jun 2026",
    itemsList: [
      { desc: "General Consultation", qty: 1, price: 800 },
      { desc: "ECG Test", qty: 1, price: 700 }
    ]
  },
  {
    id:"2", invoiceNo:"INV-000002", patient:"Rahul Mehta", initials:"RM", service:"Consultation", extraItems:2, amount:2200, paid:0, status:"issued", date:"18 Jun 2026",
    itemsList: [
      { desc: "General Consultation", qty: 1, price: 800 },
      { desc: "Nebulization Session", qty: 1, price: 800 },
      { desc: "Broncodil Cough Syrup", qty: 2, price: 300 }
    ]
  },
  {
    id:"3", invoiceNo:"INV-000003", patient:"Meera Krishnan", initials:"MK", service:"Blood Test Package", extraItems:3, amount:4500, paid:2000, status:"partial", date:"15 Jun 2026",
    itemsList: [
      { desc: "Diabetes Review Panel", qty: 1, price: 2500 },
      { desc: "Consultation Fee", qty: 1, price: 800 },
      { desc: "Metformin 500mg (60 tabs)", qty: 2, price: 600 }
    ]
  },
  {
    id:"4", invoiceNo:"INV-000004", patient:"Arjun Nair", initials:"AN", service:"Consultation", extraItems:0, amount:800, paid:800, status:"paid", date:"12 Jun 2026",
    itemsList: [
      { desc: "General Consultation", qty: 1, price: 800 }
    ]
  },
  {
    id:"5", invoiceNo:"INV-000005", patient:"Sunita Gupta", initials:"SG", service:"Physiotherapy (3x)", extraItems:1, amount:3600, paid:3600, status:"paid", date:"10 Jun 2026",
    itemsList: [
      { desc: "Physiotherapy Session", qty: 3, price: 1000 },
      { desc: "Calcium Supplements", qty: 1, price: 600 }
    ]
  },
  {
    id:"6", invoiceNo:"INV-000006", patient:"Kiran Desai", initials:"KD", service:"Endoscopy Procedure", extraItems:2, amount:8500, paid:0, status:"draft", date:"8 Jun 2026",
    itemsList: [
      { desc: "Upper Endoscopy", qty: 1, price: 7000 },
      { desc: "Anaesthesia & Sedatives", qty: 1, price: 1000 },
      { desc: "Pantoprazole 40mg", qty: 1, price: 500 }
    ]
  },
  {
    id:"7", invoiceNo:"INV-000007", patient:"Asha Patel", initials:"AP", service:"Cardiology Review", extraItems:3, amount:3200, paid:3200, status:"paid", date:"5 Jun 2026",
    itemsList: [
      { desc: "Cardiology Consultation", qty: 1, price: 1500 },
      { desc: "Echocardiogram", qty: 1, price: 1200 },
      { desc: "Medication Bundle", qty: 1, price: 500 }
    ]
  },
  {
    id:"8", invoiceNo:"INV-000008", patient:"Dev Joshi", initials:"DJ", service:"Consultation", extraItems:1, amount:1200, paid:0, status:"cancelled", date:"1 Jun 2026",
    itemsList: [
      { desc: "General Consultation", qty: 1, price: 800 },
      { desc: "Allergy Spray", qty: 1, price: 400 }
    ]
  },
];

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral" | "error"> = {
  paid: "success", issued: "info", partial: "warning", draft: "neutral", cancelled: "error", refunded: "neutral",
};

export default function DoctorBillingPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = initialInvoices.filter((inv) => {
    const ms = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNo.includes(search);
    const mf = !filterStatus || inv.status === filterStatus;
    return ms && mf;
  });

  const handleDownloadInvoice = (inv: Invoice) => {
    alert(`Downloading ${inv.invoiceNo} PDF to your local downloads directory...`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing"
        subtitle="Invoices and payment management"
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₹1,24,500", sub: "This month", color: "text-neutral-500", iconText: "₹" },
          { label: "Pending Dues", value: "₹18,200", sub: "3 invoices", color: "text-amber-600", iconText: "!" },
          { label: "Paid Invoices", value: "89", sub: "This month", color: "text-emerald-600", iconText: "✓" },
          { label: "Overdue Alerts", value: "4", sub: "Requires follow up", color: "text-red-650", iconText: "⚠" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-neutral-500 font-medium leading-tight">{s.label}</p>
              <span className="text-neutral-300 font-bold text-lg select-none">{s.iconText}</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{s.value}</p>
            <p className={`text-xs font-medium ${s.color}`}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:max-w-xs">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            leftIcon={Search01Icon}
          />
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "issued", label: "Issued" },
              { value: "paid", label: "Paid" },
              { value: "partial", label: "Partial" },
              { value: "cancelled", label: "Cancelled" }
            ]}
            className="text-xs font-semibold py-2 min-w-[130px] rounded-lg"
          />
        </div>
      </div>

      {/* Invoices Table Card */}
      <Card padding="none" className="overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-[#FBFCFD] select-none">
                {["Invoice #", "Patient", "Services", "Amount", "Paid", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-neutral-450 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-neutral-450">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 cursor-pointer text-sm" onClick={() => setSelectedInvoice(row)}>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-neutral-500">
                      {row.invoiceNo}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm" fallback={row.initials} />
                        <span className="font-semibold text-neutral-800">{row.patient}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-neutral-600 truncate max-w-[160px] font-medium">{row.service}</span>
                        {row.extraItems > 0 && <Badge variant="neutral" className="text-[10px] py-0.5">+{row.extraItems} items</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-800">
                      ₹{row.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${row.paid >= row.amount ? "text-emerald-700" : "text-amber-700"}`}>
                        ₹{row.paid.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant[row.status] ?? "neutral"}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 font-medium">
                      {row.date}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => setSelectedInvoice(row)} className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors" title="View Details"><HugeiconsIcon icon={EyeIcon} className="w-4 h-4" /></button>
                        <button onClick={() => handleDownloadInvoice(row)} className="p-1.5 text-neutral-500 hover:text-[#0b6e6e] hover:bg-[#F0FAFA] rounded-lg cursor-pointer transition-colors" title="Download PDF"><HugeiconsIcon icon={DownloadSquare01Icon} className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <Drawer
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNo}`}
          subtitle={`Patient details and billing log`}
          showFooter={false}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6">
              {/* Header Info Block */}
              <div className="flex items-center gap-3 p-4 bg-[#FBFCFD] rounded-xl border border-neutral-200/50">
                <Avatar size="md" fallback={selectedInvoice.initials} />
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">{selectedInvoice.patient}</h4>
                  <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Date of Issue: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Line Items</p>
                <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-white">
                  {(selectedInvoice.itemsList || [{ desc: selectedInvoice.service, qty: 1, price: selectedInvoice.amount }]).map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 text-xs">
                      <div>
                        <p className="font-semibold text-neutral-800">{item.desc}</p>
                        <p className="text-neutral-450 mt-0.5">{item.qty} x ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-neutral-800 self-center">₹{item.qty * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="bg-[#FBFCFD] border border-neutral-200/40 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Discount</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-neutral-200/60 pt-2 mt-2 text-neutral-900">
                  <span>Total Amount</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-emerald-700">
                  <span>Amount Paid</span>
                  <span>₹{selectedInvoice.paid}</span>
                </div>
              </div>

              {/* Payment Status Check */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/50">
                <span className="text-xs font-semibold text-neutral-500">Current Status</span>
                <Badge variant={statusVariant[selectedInvoice.status] ?? "neutral"}>
                  {selectedInvoice.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={DownloadSquare01Icon}
                className="bg-[#0b6e6e] border-[#0b6e6e]"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                Print / Download
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
