"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Accordion } from "@/components/ui/accordion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, CheckmarkCircle01Icon, PrescriptionIcon, UserIcon } from "@hugeicons/core-free-icons";

type QueueEntry = {
  id: string; token: number; name: string; age: number; gender: string;
  checkedIn: string; complaint: string; waitMins: number;
  status: "waiting" | "in_progress" | "completed" | "skipped";
};

const initialQueue: QueueEntry[] = [
  { id:"1", token:1, name:"Priya Sharma",   age:34, gender:"F", checkedIn:"09:05 AM", complaint:"Chest pain and breathlessness",     waitMins:0,  status:"completed" },
  { id:"2", token:2, name:"Rahul Mehta",    age:28, gender:"M", checkedIn:"09:30 AM", complaint:"Fever and cough for 5 days",        waitMins:0,  status:"completed" },
  { id:"3", token:3, name:"Meera Krishnan", age:45, gender:"F", checkedIn:"10:15 AM", complaint:"Fever and headache for 3 days",     waitMins:0,  status:"in_progress" },
  { id:"4", token:4, name:"Arjun Nair",     age:22, gender:"M", checkedIn:"10:30 AM", complaint:"Throat pain and difficulty swallowing", waitMins:35, status:"waiting" },
  { id:"5", token:5, name:"Sunita Gupta",   age:58, gender:"F", checkedIn:"10:45 AM", complaint:"Joint pain in both knees",         waitMins:48, status:"waiting" },
  { id:"6", token:6, name:"Kiran Desai",    age:41, gender:"M", checkedIn:"11:00 AM", complaint:"Acidity and bloating",             waitMins:60, status:"waiting" },
  { id:"7", token:7, name:"Asha Patel",     age:67, gender:"F", checkedIn:"11:15 AM", complaint:"Swelling in ankles",               waitMins:72, status:"waiting" },
  { id:"8", token:8, name:"Dev Joshi",      age:19, gender:"M", checkedIn:"11:30 AM", complaint:"Runny nose and sneezing",          waitMins:84, status:"waiting" },
  { id:"9", token:9, name:"Pooja Iyer",     age:31, gender:"F", checkedIn:"11:45 AM", complaint:"Back pain for 2 weeks",            waitMins:96, status:"waiting" },
];

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);

  const markDone = (id: string) => setQueue((q) => q.map((e) => e.id === id ? { ...e, status: "completed" } : e));
  const callNext = (id: string) => {
    setQueue((q) => q.map((e) => {
      if (e.id === id) return { ...e, status: "in_progress" };
      if (e.status === "in_progress") return { ...e, status: "completed" };
      return e;
    }));
  };

  const current   = queue.find((e) => e.status === "in_progress");
  const waiting   = queue.filter((e) => e.status === "waiting");
  const completed = queue.filter((e) => e.status === "completed");
  const totalDone = completed.length;
  const totalCount = queue.length;

  return (
    <div>
      <PageHeader
        title="Patient Queue"
        subtitle={`Today, 25 June 2026 • Token #${current?.token ?? "—"} | Serving ${totalDone + (current ? 1 : 0)} of ${totalCount}`}
      />

      {/* Stats bar */}
      <div className="flex gap-3 mb-6">
        {[
          { label: `${waiting.length} Waiting`,   cls: "bg-warning-50 border-warning-200 text-warning-700" },
          { label: `${current ? 1 : 0} In Progress`, cls: "bg-primary-50 border-primary-200 text-primary-700" },
          { label: `${totalDone} Completed`,     cls: "bg-success-50 border-success-200 text-success-700" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-lg px-4 py-2.5 text-sm font-semibold ${s.cls}`}>{s.label}</div>
        ))}
        <div className="ml-auto text-sm text-neutral-500 flex items-center">
          <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 mr-1.5 text-neutral-400" />
          Avg. consult: 12 min
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Current patient */}
          {current && (
            <div className="bg-primary-50 border-2 border-primary-300 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Currently Consulting</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                  {current.token}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{current.name}</h2>
                  <p className="text-sm text-neutral-500">{current.age}y • {current.gender === "M" ? "Male" : "Female"} • Checked in {current.checkedIn}</p>
                  <p className="text-sm text-neutral-600 mt-1 italic">&ldquo;{current.complaint}&rdquo;</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" leftIcon={CheckmarkCircle01Icon} onClick={() => markDone(current.id)} className="flex-1">
                  Mark as Done
                </Button>
                <Button variant="outline" leftIcon={PrescriptionIcon} className="flex-1">
                  Write Prescription
                </Button>
              </div>
            </div>
          )}

          {/* Waiting list */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-600 mb-3">Waiting List ({waiting.length})</h3>
            <div className="space-y-2">
              {waiting.map((entry, i) => (
                <div key={entry.id} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4 hover:border-neutral-300 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-warning-100 text-warning-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {entry.token}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-800">{entry.name}</p>
                      <span className="text-xs text-neutral-400">{entry.age}y</span>
                      {i === 0 && <Badge variant="info">Next</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
                      <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" />
                      <span>Waiting {entry.waitMins} min</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => callNext(entry.id)}>
                    Call
                  </Button>
                </div>
              ))}
              {waiting.length === 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-sm text-neutral-400">
                  No more patients waiting.
                </div>
              )}
            </div>
          </div>

          {/* Completed accordion */}
          {completed.length > 0 && (
            <Accordion
              items={[{
                id: "completed",
                title: `Completed Today (${completed.length})`,
                content: (
                  <div className="space-y-2 pt-1">
                    {completed.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success-100 text-success-700 flex items-center justify-center text-xs font-bold">
                          {entry.token}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-700">{entry.name}</p>
                          <p className="text-xs text-neutral-400">{entry.age}y • {entry.checkedIn}</p>
                        </div>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4.5 h-4.5 text-success-500" />
                      </div>
                    ))}
                  </div>
                ),
              }]}
            />
          )}
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Queue Stats</CardTitle></CardHeader>
            <div className="space-y-3">
              {[
                { label: "Avg. Consultation", value: "12 min" },
                { label: "Total Today",        value: `${totalCount} patients` },
                { label: "Completed",          value: `${totalDone}/${totalCount}` },
                { label: "Remaining",          value: `${waiting.length + (current ? 1 : 0)} patients` },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{s.label}</span>
                  <span className="text-sm font-semibold text-neutral-800">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {waiting.length > 0 && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={UserIcon}
              onClick={() => waiting[0] && callNext(waiting[0].id)}
            >
              Call Next Patient
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
