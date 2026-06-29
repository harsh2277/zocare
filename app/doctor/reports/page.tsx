"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { DownloadSquare01Icon, UserGroupIcon, PrescriptionIcon, Invoice03Icon, Calendar01Icon } from "@hugeicons/core-free-icons";

type Period = "month" | "last3" | "quarter";

const dataByPeriod = {
  month: {
    stats: {
      revenue: "₹1,24,500",
      patients: "186",
      prescriptions: "142",
      appointments: "218"
    },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    patientCounts: [42, 58, 61, 74, 68, 83],
    revenueBreakdown: [
      { label: "Consultations", pct: 45, amount: "₹56,025", color: "bg-primary-500" },
      { label: "Procedures", pct: 28, amount: "₹34,860", color: "bg-success-500" },
      { label: "Medicines", pct: 15, amount: "₹18,675", color: "bg-warning-500" },
      { label: "Lab Tests", pct: 12, amount: "₹14,940", color: "bg-info-500" },
    ],
    topDiagnoses: [
      { diagnosis: "Hypertension", count: 24, pct: 13 },
      { diagnosis: "Type 2 Diabetes", count: 19, pct: 10 },
      { diagnosis: "Viral Fever", count: 18, pct: 10 },
      { diagnosis: "GERD", count: 14, pct: 8 },
      { diagnosis: "Allergic Rhinitis", count: 11, pct: 6 },
    ],
    recentActivity: [
      { action: "Prescription written", patient: "Priya Sharma", time: "10:05 AM", color: "bg-primary-500" },
      { action: "Invoice issued", patient: "Rahul Mehta", time: "09:42 AM", color: "bg-success-500" },
      { action: "Consultation completed", patient: "Meera Krishnan", time: "09:30 AM", color: "bg-info-500" },
      { action: "Follow-up scheduled", patient: "Asha Patel", time: "Yesterday", color: "bg-warning-500" },
    ]
  },
  last3: {
    stats: {
      revenue: "₹3,82,900",
      patients: "542",
      prescriptions: "410",
      appointments: "625"
    },
    months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    patientCounts: [74, 68, 83, 91, 102, 124],
    revenueBreakdown: [
      { label: "Consultations", pct: 48, amount: "₹1,83,792", color: "bg-primary-500" },
      { label: "Procedures", pct: 25, amount: "₹95,725", color: "bg-success-500" },
      { label: "Medicines", pct: 17, amount: "₹65,093", color: "bg-warning-500" },
      { label: "Lab Tests", pct: 10, amount: "₹38,290", color: "bg-info-500" },
    ],
    topDiagnoses: [
      { diagnosis: "Hypertension", count: 72, pct: 15 },
      { diagnosis: "Viral Fever", count: 58, pct: 12 },
      { diagnosis: "Type 2 Diabetes", count: 52, pct: 11 },
      { diagnosis: "Acute Bronchitis", count: 44, pct: 9 },
      { diagnosis: "GERD", count: 38, pct: 8 },
    ],
    recentActivity: [
      { action: "Prescription written", patient: "Kiran Desai", time: "2 days ago", color: "bg-primary-500" },
      { action: "Patient checked in", patient: "Rahul Mehta", time: "3 days ago", color: "bg-success-500" },
      { action: "Discharged patient", patient: "Arjun Nair", time: "4 days ago", color: "bg-info-500" },
    ]
  },
  quarter: {
    stats: {
      revenue: "₹5,40,200",
      patients: "790",
      prescriptions: "612",
      appointments: "895"
    },
    months: ["Q1-26", "Q2-26", "Q3-26", "Q4-26", "Q1-27", "Q2-27"],
    patientCounts: [110, 135, 142, 178, 168, 218],
    revenueBreakdown: [
      { label: "Consultations", pct: 42, amount: "₹2,26,884", color: "bg-primary-500" },
      { label: "Procedures", pct: 30, amount: "₹1,62,060", color: "bg-success-500" },
      { label: "Medicines", pct: 16, amount: "₹86,432", color: "bg-warning-500" },
      { label: "Lab Tests", pct: 12, amount: "₹64,824", color: "bg-info-500" },
    ],
    topDiagnoses: [
      { diagnosis: "Hypertension", count: 112, pct: 16 },
      { diagnosis: "Type 2 Diabetes", count: 86, pct: 12 },
      { diagnosis: "Viral Fever", count: 82, pct: 12 },
      { diagnosis: "GERD", count: 64, pct: 9 },
      { diagnosis: "Osteoarthritis", count: 58, pct: 8 },
    ],
    recentActivity: [
      { action: "Consultation completed", patient: "Dev Joshi", time: "1 week ago", color: "bg-info-500" },
      { action: "Staff member added", patient: "Dr. Anita Sharma", time: "2 weeks ago", color: "bg-warning-500" },
      { action: "Prescription updated", patient: "Sunita Gupta", time: "3 weeks ago", color: "bg-primary-500" },
    ]
  }
};

export default function DoctorReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("month");

  const periods: { key: Period; label: string }[] = [
    { key: "month", label: "This Month" },
    { key: "last3", label: "Last 3 Months" },
    { key: "quarter", label: "This Quarter" },
  ];

  const currentData = dataByPeriod[activePeriod];
  const maxCount = Math.max(...currentData.patientCounts);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights for your practice"
        action={<Button variant="outline" leftIcon={DownloadSquare01Icon}>Export Report</Button>}
      />

      {/* Period filter */}
      <div className="flex items-center gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activePeriod === p.key
                ? "bg-[#0b6e6e] text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={currentData.stats.revenue} icon={Invoice03Icon} iconColor="success" trend={{ value: 18, label: "vs last period" }} />
        <StatCard title="Total Patients" value={currentData.stats.patients} icon={UserGroupIcon} iconColor="primary" trend={{ value: 12, label: "vs last period" }} />
        <StatCard title="Prescriptions" value={currentData.stats.prescriptions} icon={PrescriptionIcon} iconColor="info" />
        <StatCard title="Appointments" value={currentData.stats.appointments} icon={Calendar01Icon} iconColor="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Patient volume chart */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Volume</CardTitle>
            <p className="text-xs text-neutral-400">Trend over time</p>
          </CardHeader>
          <div className="space-y-3">
            {currentData.months.map((month, i) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 w-12 shrink-0">{month}</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${i === currentData.months.length - 1 ? "bg-[#0b6e6e]" : "bg-[#0b6e6e]/40"}`}
                    style={{ width: `${(currentData.patientCounts[i] / maxCount) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{currentData.patientCounts[i]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <p className="text-xs text-neutral-400">Service share</p>
          </CardHeader>
          <div className="space-y-4">
            {currentData.revenueBreakdown.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                    <span className="text-sm text-neutral-700">{r.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{r.pct}%</span>
                    <span className="text-sm font-semibold text-neutral-800">{r.amount}</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top diagnoses */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-neutral-100">
            <CardTitle>Top Diagnoses</CardTitle>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3 text-left text-xs font-bold text-neutral-450 uppercase tracking-wide">Diagnosis</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-neutral-450 uppercase tracking-wide">Count</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-neutral-450 uppercase tracking-wide">% Share</th>
              </tr>
            </thead>
            <tbody>
              {currentData.topDiagnoses.map((d, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 text-sm text-neutral-700">{d.diagnosis}</td>
                  <td className="px-5 py-3 text-sm text-neutral-700 text-right font-medium">{d.count}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs font-semibold text-[#0b6e6e]">{d.pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <div className="space-y-4">
            {currentData.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{a.action}</p>
                  <p className="text-xs text-neutral-400">{a.patient} • {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
