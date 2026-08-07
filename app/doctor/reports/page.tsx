"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { DownloadSquare01Icon, UserGroupIcon, PrescriptionIcon, Invoice03Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";

type Period = "month" | "last3" | "quarter";

const CATEGORY_COLORS: Record<string, string> = {
  consultation: "bg-primary-500",
  procedure: "bg-success-500",
  medicine: "bg-warning-500",
  lab: "bg-info-500",
  service: "bg-neutral-400",
  other: "bg-neutral-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  consultation: "Consultations",
  procedure: "Procedures",
  medicine: "Medicines",
  lab: "Lab Tests",
  service: "Services",
  other: "Other",
};

const getDoctorId = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("doctor_id");
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return stored && uuidRegex.test(stored) ? stored : null;
};

const getPeriodRange = (period: Period) => {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  const months: string[] = [];

  if (period === "month") {
    start.setMonth(start.getMonth() - 5, 1);
  } else if (period === "last3") {
    start.setMonth(start.getMonth() - 5, 1);
  } else {
    start.setMonth(start.getMonth() - 17, 1);
  }
  start.setHours(0, 0, 0, 0);

  // month labels for the trailing 6 buckets shown in the chart
  const bucketCount = 6;
  const stepMonths = period === "quarter" ? 3 : 1;
  for (let i = bucketCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i * stepMonths, 1);
    months.push(d.toLocaleDateString("en-US", { month: "short" }));
  }

  return {
    startISO: start.toISOString().split("T")[0],
    endISO: end.toISOString().split("T")[0],
    months,
    bucketCount,
    stepMonths,
  };
};

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function DoctorReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [months, setMonths] = useState<string[]>([]);
  const [patientCounts, setPatientCounts] = useState<number[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<{ label: string; pct: number; amount: string; color: string }[]>([]);
  const [topDiagnoses, setTopDiagnoses] = useState<{ diagnosis: string; count: number; pct: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ action: string; patient: string; time: string; color: string }[]>([]);

  const periods: { key: Period; label: string }[] = [
    { key: "month", label: "This Month" },
    { key: "last3", label: "Last 3 Months" },
    { key: "quarter", label: "This Quarter" },
  ];

  useEffect(() => {
    const load = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createClient();
      const { startISO, endISO, months: bucketMonths, bucketCount, stepMonths } = getPeriodRange(activePeriod);
      setMonths(bucketMonths);

      // Appointments in range
      const { data: appts, count: apptCount } = await supabase
        .from("appointments")
        .select("id, patient_id, appointment_date", { count: "exact" })
        .eq("doctor_id", doctorId)
        .gte("appointment_date", startISO)
        .lte("appointment_date", endISO);

      setAppointmentCount(apptCount ?? appts?.length ?? 0);
      const uniquePatients = new Set((appts ?? []).map((a: any) => a.patient_id));
      setPatientCount(uniquePatients.size);

      // Bucket appointment volume by month/quarter
      const counts = new Array(bucketCount).fill(0);
      const now = new Date();
      (appts ?? []).forEach((a: any) => {
        const d = new Date(a.appointment_date);
        for (let i = 0; i < bucketCount; i++) {
          const bucketDate = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1 - i) * stepMonths, 1);
          const nextBucketDate = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1 - i) * stepMonths + stepMonths, 1);
          if (d >= bucketDate && d < nextBucketDate) {
            counts[i] += 1;
          }
        }
      });
      setPatientCounts(counts);

      // Prescriptions in range
      const { data: rxs, count: rxCount } = await supabase
        .from("prescriptions")
        .select("id, diagnosis, created_at", { count: "exact" })
        .eq("doctor_id", doctorId)
        .gte("created_at", startISO)
        .lte("created_at", endISO + "T23:59:59");
      setPrescriptionCount(rxCount ?? rxs?.length ?? 0);

      const diagnosisCounts: Record<string, number> = {};
      (rxs ?? []).forEach((r: any) => {
        if (r.diagnosis && r.diagnosis.trim()) {
          const key = r.diagnosis.trim();
          diagnosisCounts[key] = (diagnosisCounts[key] ?? 0) + 1;
        }
      });
      const totalDiag = Object.values(diagnosisCounts).reduce((a, b) => a + b, 0);
      const topDx = Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([diagnosis, count]) => ({
          diagnosis,
          count,
          pct: totalDiag > 0 ? Math.round((count / totalDiag) * 100) : 0,
        }));
      setTopDiagnoses(topDx);

      // Billing invoices in range
      const { data: invoices } = await supabase
        .from("billing_invoices")
        .select("id, total, paid_amount, created_at")
        .eq("doctor_id", doctorId)
        .gte("created_at", startISO)
        .lte("created_at", endISO + "T23:59:59");

      const revenue = (invoices ?? []).reduce((sum: number, inv: any) => sum + Number(inv.paid_amount ?? 0), 0);
      setTotalRevenue(revenue);

      const invoiceIds = (invoices ?? []).map((inv: any) => inv.id);
      if (invoiceIds.length > 0) {
        const { data: items } = await supabase
          .from("billing_invoice_items")
          .select("category, total_price, invoice_id")
          .in("invoice_id", invoiceIds);

        const categoryTotals: Record<string, number> = {};
        (items ?? []).forEach((it: any) => {
          const cat = it.category ?? "other";
          categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(it.total_price ?? 0);
        });
        const totalCat = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        const breakdown = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amount]) => ({
            label: CATEGORY_LABELS[cat] ?? cat,
            pct: totalCat > 0 ? Math.round((amount / totalCat) * 100) : 0,
            amount: formatINR(amount),
            color: CATEGORY_COLORS[cat] ?? "bg-neutral-400",
          }));
        setRevenueBreakdown(breakdown);
      } else {
        setRevenueBreakdown([]);
      }

      // Recent activity from queue entries with patient names
      const { data: recentQueue } = await supabase
        .from("queue_entries")
        .select("status, updated_at, patients(full_name)")
        .eq("doctor_id", doctorId)
        .order("updated_at", { ascending: false })
        .limit(10);

      const activity = (recentQueue ?? []).map((q: any) => {
        const actionLabel =
          q.status === "completed" ? "Consultation completed" :
          q.status === "in_progress" ? "Consultation started" :
          q.status === "called" ? "Patient called" :
          q.status === "skipped" ? "Patient skipped" : "Checked in to queue";
        const color =
          q.status === "completed" ? "bg-success-500" :
          q.status === "in_progress" ? "bg-primary-500" :
          q.status === "skipped" ? "bg-error-500" : "bg-info-500";
        return {
          action: actionLabel,
          patient: q.patients?.full_name ?? "Patient",
          time: q.updated_at ? new Date(q.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—",
          color,
        };
      });
      setRecentActivity(activity);

      setLoading(false);
    };
    load();
  }, [activePeriod]);

  const maxCount = useMemo(() => Math.max(1, ...patientCounts), [patientCounts]);

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

      {loading ? (
        <div className="p-8 text-center text-sm text-neutral-400">Loading report data...</div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Revenue" value={formatINR(totalRevenue)} icon={Invoice03Icon} iconColor="success" />
            <StatCard title="Total Patients" value={String(patientCount)} icon={UserGroupIcon} iconColor="primary" />
            <StatCard title="Prescriptions" value={String(prescriptionCount)} icon={PrescriptionIcon} iconColor="info" />
            <StatCard title="Appointments" value={String(appointmentCount)} icon={Calendar01Icon} iconColor="warning" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {/* Patient volume chart */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Volume</CardTitle>
                <p className="text-xs text-neutral-400">Trend over time</p>
              </CardHeader>
              <div className="space-y-3">
                {months.map((month, i) => (
                  <div key={`${month}-${i}`} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 w-12 shrink-0">{month}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${i === months.length - 1 ? "bg-[#0b6e6e]" : "bg-[#0b6e6e]/40"}`}
                        style={{ width: `${((patientCounts[i] ?? 0) / maxCount) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{patientCounts[i] ?? 0}</span>
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
              {revenueBreakdown.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">No billing data for this period.</p>
              ) : (
                <div className="space-y-4">
                  {revenueBreakdown.map((r) => (
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
              )}
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Top diagnoses */}
            <Card padding="none">
              <div className="px-5 py-4 border-b border-neutral-100">
                <CardTitle>Top Diagnoses</CardTitle>
              </div>
              {topDiagnoses.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">No diagnosis data for this period.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-5 py-3 text-left text-xs font-bold text-neutral-450 uppercase tracking-wide">Diagnosis</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-neutral-450 uppercase tracking-wide">Count</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-neutral-450 uppercase tracking-wide">% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDiagnoses.map((d, i) => (
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
              )}
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-800">{a.action}</p>
                        <p className="text-xs text-neutral-400">{a.patient} • {a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
