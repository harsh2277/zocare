"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon, TaskDaily01Icon, PrescriptionIcon, BarChartIcon,
  PlusSignIcon, ArrowRight01Icon, UserIcon,
} from "@hugeicons/core-free-icons";

const schedule = [
  { time: "09:00 AM", patient: "Priya Sharma",   type: "Consultation", status: "completed",  initials: "PS" },
  { time: "09:30 AM", patient: "Rahul Mehta",    type: "Follow-up",    status: "completed",  initials: "RM" },
  { time: "10:00 AM", patient: "Meera Krishnan", type: "Consultation", status: "in_progress",initials: "MK" },
  { time: "10:30 AM", patient: "Arjun Nair",     type: "Consultation", status: "upcoming",   initials: "AN" },
  { time: "11:00 AM", patient: "Sunita Gupta",   type: "Follow-up",    status: "upcoming",   initials: "SG" },
  { time: "11:30 AM", patient: "Kiran Desai",    type: "Emergency",    status: "upcoming",   initials: "KD" },
];

const queueData = [
  { token: 3, name: "Meera Krishnan", status: "current" },
  { token: 4, name: "Arjun Nair",     status: "next" },
  { token: 5, name: "Sunita Gupta",   status: "waiting" },
  { token: 6, name: "Kiran Desai",    status: "waiting" },
];

const recentRx = [
  { patient: "Priya Sharma",   date: "Today",       drug: "Amlodipine 5mg", initials: "PS" },
  { patient: "Rahul Mehta",    date: "Today",       drug: "Azithromycin 500mg", initials: "RM" },
  { patient: "Asha Patel",     date: "Yesterday",   drug: "Metformin 500mg", initials: "AP" },
];

const statusConfig: Record<string, { label: string; badge: "success" | "primary" | "neutral"; dot: string }> = {
  completed:   { label: "Completed",   badge: "success", dot: "bg-success-500" },
  in_progress: { label: "In Progress", badge: "primary", dot: "bg-primary-500 animate-pulse" },
  upcoming:    { label: "Upcoming",    badge: "neutral",  dot: "bg-neutral-300" },
};

export default function DoctorDashboardPage() {
  const [, setTab] = useState("today");

  return (
    <div>
      <PageHeader
        title="Good morning, Dr. Sharma"
        subtitle="Wednesday, 25 June 2026 • Your schedule for today"
        action={
          <Button leftIcon={PlusSignIcon} size="sm" onClick={() => setTab("new")}>
            New Prescription
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value="12" icon={Calendar01Icon} iconColor="primary" trend={{ value: 5, label: "vs last week" }} />
        <StatCard title="Patients in Queue" value="4"  icon={TaskDaily01Icon}  iconColor="warning"  subtitle="Next: Arjun Nair" />
        <StatCard title="Prescriptions Today" value="8" icon={PrescriptionIcon} iconColor="success" />
        <StatCard title="Pending Reports"    value="3"  icon={BarChartIcon}   iconColor="info" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Schedule */}
        <div className="lg:col-span-3">
          <Card padding="none">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">6 appointments</p>
              </div>
              <Button size="sm" variant="ghost" rightIcon={ArrowRight01Icon}>Full schedule</Button>
            </div>
            <div className="divide-y divide-neutral-100">
              {schedule.map((item, i) => {
                const cfg = statusConfig[item.status];
                return (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${item.status === "in_progress" ? "bg-primary-50/50" : ""}`}>
                    <p className="text-xs text-neutral-400 w-20 shrink-0 font-medium">{item.time}</p>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <Avatar size="sm" fallback={item.initials} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800">{item.patient}</p>
                      <Badge variant={item.type === "Emergency" ? "error" : "neutral"} className="text-[10px]">{item.type}</Badge>
                    </div>
                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                    {item.status === "upcoming" && (
                      <Button size="sm" variant="outline">Start</Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Queue status */}
          <Card padding="none">
            <div className="px-4 py-3.5 border-b border-neutral-100">
              <CardTitle>Queue Status</CardTitle>
            </div>
            <div className="p-4">
              {/* Current patient */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Currently With</p>
                <div className="flex items-center gap-3">
                  <Avatar size="md" fallback="MK" status="online" />
                  <div>
                    <p className="font-bold text-neutral-900">Meera Krishnan</p>
                    <p className="text-xs text-neutral-500">Token #3 • Started 10:02 AM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {queueData.filter((q) => q.status !== "current").map((entry) => (
                  <div key={entry.token} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${entry.status === "next" ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {entry.token}
                    </div>
                    <span className="text-sm text-neutral-700 flex-1">{entry.name}</span>
                    {entry.status === "next" && <Badge variant="info">Next</Badge>}
                  </div>
                ))}
              </div>

              <Button variant="primary" className="w-full mt-4" leftIcon={UserIcon}>
                Call Next Patient
              </Button>
            </div>
          </Card>

          {/* Recent Rx */}
          <Card padding="none">
            <div className="px-4 py-3.5 border-b border-neutral-100 flex items-center justify-between">
              <CardTitle>Recent Prescriptions</CardTitle>
              <Button size="sm" variant="ghost">View all</Button>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentRx.map((rx, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Avatar size="sm" fallback={rx.initials} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{rx.patient}</p>
                    <p className="text-xs text-neutral-400">{rx.drug}</p>
                  </div>
                  <span className="text-xs text-neutral-400">{rx.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
