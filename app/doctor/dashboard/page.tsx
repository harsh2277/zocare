"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  BarChartIcon,
  ChevronDownIcon,
  ArrowRight01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";

// Mock Data
const statCards = [
  {
    title: "Today's Appointments",
    value: "12",
    subtitle: "+2 walk-ins",
    subtitleColor: "text-[#10b981]",
    icon: UserGroupIcon,
  },
  {
    title: "Patients Seen",
    value: "7",
    subtitle: "58% complete",
    subtitleColor: "text-[#0b6e6e]",
    icon: CheckmarkCircle01Icon,
  },
  {
    title: "Pending",
    value: "5",
    subtitle: "Avg wait: 22 min",
    subtitleColor: "text-[#f59e0b]",
    icon: Clock01Icon,
  },
  {
    title: "Avg Consultation",
    value: "18m",
    subtitle: "↓ 3m from yesterday",
    subtitleColor: "text-[#10b981]",
    icon: BarChartIcon,
  },
];

const patientsList = [
  { token: "TK-001", name: "Ahmed Khan", age: "45M", type: "Follow-up", typeBg: "bg-[#dbeafe] text-[#1e40af]", time: "09:00", wait: "-", status: "Done", statusBg: "bg-[#d1fae5] text-[#10b981]", highlight: false, initials: "AK" },
  { token: "TK-002", name: "Zainab Bibi", age: "28F", type: "Routine", typeBg: "bg-[#f3f4f6] text-[#374151]", time: "09:15", wait: "-", status: "Done", statusBg: "bg-[#d1fae5] text-[#10b981]", highlight: false, initials: "ZB" },
  { token: "TK-003", name: "Muhammad Ali", age: "12M", type: "New Patient", typeBg: "bg-[#ede9fe] text-[#6b21a8]", time: "09:30", wait: "8 min", waitColor: "text-[#10b981]", status: "In Consultation", statusBg: "bg-[#ccf2f2] text-[#0b6e6e]", highlight: false, initials: "MA", resume: true },
  { token: "TK-004", name: "Fatima Noor", age: "29F", type: "Vaccination", typeBg: "bg-[#fee2e2] text-[#92400e]", time: "09:45", wait: "34 min", waitColor: "text-[#ef4444]", status: "Waiting", statusBg: "bg-[#fef3c7] text-[#f59e0b]", highlight: true, initials: "FN" },
  { token: "TK-005", name: "Hassan Raza", age: "56M", type: "Follow-up", typeBg: "bg-[#dbeafe] text-[#1e40af]", time: "10:00", wait: "28 min", waitColor: "text-[#10b981]", status: "Waiting", statusBg: "bg-[#fef3c7] text-[#f59e0b]", highlight: false, initials: "HR" },
  { token: "TK-006", name: "Amna Sheikh", age: "34F", type: "New Patient", typeBg: "bg-[#ede9fe] text-[#6b21a8]", time: "10:15", wait: "-", status: "Waiting", statusBg: "bg-[#fef3c7] text-[#f59e0b]", highlight: false, initials: "AS" },
  { token: "TK-007", name: "Omar Farooq", age: "40M", type: "Routine", typeBg: "bg-[#f3f4f6] text-[#374151]", time: "10:30", wait: "-", status: "Waiting", statusBg: "bg-[#fef3c7] text-[#f59e0b]", highlight: false, initials: "OF" },
];

const diagnosesList = [
  { name: "Seasonal Flu / Influenza", code: "J11.1", pts: "3 pts" },
  { name: "Seasonal Flu / Influenza", code: "J11.1", pts: "3 pts" },
  { name: "Gastritis", code: "K29.7", pts: "2 pts" },
  { name: "Hypertension", code: "I10", pts: "2 pts" },
  { name: "Diabetes Follow-up", code: "E11.9", pts: "1 pt" },
];

const prescriptionsList = [
  { name: "Ahmed Khan", time: "09:22 AM", drugs: ["Amoxicillin", "Paracetamol"], initials: "AK" },
  { name: "Zainab Bibi", time: "09:18 AM", drugs: ["Omeprazole", "Metronidazole"], initials: "ZB" },
  { name: "Zainab Bibi", time: "09:18 AM", drugs: ["Omeprazole", "Metronidazole"], initials: "ZB" },
  { name: "Zainab Bibi", time: "09:18 AM", drugs: ["Omeprazole", "Metronidazole"], initials: "ZB" },
  { name: "Muhammad Ali", time: "Ongoing", drugs: ["Paracetamol", "Cetirizine"], initials: "MA" },
];

export default function DoctorDashboardPage() {
  const [timeframe, setTimeframe] = useState("today");

  return (
    <div className="flex flex-col gap-4 p-1 w-full max-w-[1660px] mx-auto">
      {/* ROW 1: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col justify-between h-[134px] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#647589] font-medium">{card.title}</span>
              <HugeiconsIcon
                icon={card.icon}
                className="w-6 h-6 text-[#94a3b8] opacity-50 shrink-0 group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[40px] font-bold text-[#1e2940] leading-none">{card.value}</span>
              <span className={`text-xs ${card.subtitleColor} font-medium`}>{card.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2: Today's Patients & Today's Progress / Diagnoses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Today's Patients Table */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-lg flex flex-col overflow-hidden h-[589px] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center p-4 border-b border-[#e2e8f0]">
            <h2 className="text-lg font-bold text-[#1e2940]">Today's Patients</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] rounded-md text-sm text-[#1e2940] hover:bg-neutral-50 transition-colors">
                <span>All Status</span>
                <HugeiconsIcon icon={ChevronDownIcon} className="w-3.5 h-3.5 text-[#647589]" />
              </button>
              <button className="px-4 py-1.5 border border-[#e2e8f0] rounded-md text-sm font-semibold text-[#1e2940] hover:bg-neutral-50 transition-colors">
                View Schedule
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-bold text-[#647589] uppercase tracking-wider">
                  <th className="py-3 px-4 w-24">Token</th>
                  <th className="py-3 px-4 w-48">Patient</th>
                  <th className="py-3 px-4 w-24">Age</th>
                  <th className="py-3 px-4 w-32">Visit Type</th>
                  <th className="py-3 px-4 w-32">Scheduled</th>
                  <th className="py-3 px-4 w-32">Wait Time</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {patientsList.map((row, idx) => (
                  <tr key={idx} className={`text-sm hover:bg-neutral-50 transition-colors ${row.highlight ? "bg-[#fff5f5] hover:bg-[#ffebeb]" : ""}`}>
                    <td className="py-3.5 px-4 font-semibold text-[#647589]">{row.token}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0b6e6e] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {row.initials}
                        </div>
                        <span className="font-semibold text-[#1e2940]">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1e2940]">{row.age}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${row.typeBg}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#1e2940]">{row.time}</td>
                    <td className={`py-3.5 px-4 font-semibold ${row.waitColor || "text-[#1e2940]"}`}>{row.wait}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${row.statusBg}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button className="flex items-center gap-1 text-sm font-bold text-[#0b6e6e] hover:text-[#095858] transition-colors cursor-pointer group/action">
                        <span>{row.resume ? "Resume" : "Start"}</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 group-hover/action:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#e2e8f0] flex justify-end text-xs text-[#647589] font-medium">
            Showing 8 of 12 patients · Page 1 of 2
          </div>
        </div>

        {/* Right Column: Progress & Diagnoses */}
        <div className="flex flex-col gap-4 h-[589px]">
          {/* Card: Today's Progress */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col justify-between h-[351px] hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#1e2940]">Today's Progress</h3>
              <span className="text-[11px] font-bold text-[#647589] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                Mon 23 Jun
              </span>
            </div>

            <div className="flex justify-center items-center my-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Circular indicator */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#0b6e6e"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * 7) / 12}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-[#1e2940]">7/12</span>
                  <span className="text-[11px] text-[#647589] mt-0.5">Patients Seen</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
              <span className="bg-[#d1fae5] text-[#10b981] px-2 py-1 rounded-full">Done: 7</span>
              <div className="w-[1px] h-6 bg-[#e2e8f0]" />
              <span className="bg-[#f0fafa] text-[#0b6e6e] px-2 py-1 rounded-full">Active: 1</span>
              <div className="w-[1px] h-6 bg-[#e2e8f0]" />
              <span className="bg-[#fef3c7] text-[#f59e0b] px-2 py-1 rounded-full">Pending: 4</span>
              <div className="w-[1px] h-6 bg-[#e2e8f0]" />
              <span className="bg-[#f1f5f9] text-[#647589] px-2 py-1 rounded-full">No-Show: 0</span>
            </div>
          </div>

          {/* Card: Today's Diagnoses */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col justify-between h-[222px] overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h3 className="font-bold text-[#1e2940]">Today's Diagnoses</h3>
                <p className="text-[11px] text-[#647589] mt-0.5">Chief complaints & ICD summary</p>
              </div>
              <span className="text-[11px] font-bold text-[#0b6e6e] bg-[#ccf2f2] px-2.5 py-1 rounded-full">
                4 recorded
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
              {diagnosesList.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-[#f1f5f9] last:border-0 hover:bg-neutral-50 transition-colors px-1 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block shrink-0" />
                    <span className="font-semibold text-[#1e2940] truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#647589] font-medium">{item.code}</span>
                    <span className="text-xs bg-[#f1f5f9] text-[#647589] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.pts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Patient Flow & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Patient Flow Line Chart Card */}
        <div 
          className="rounded-lg flex flex-col justify-between h-[362px] shadow-sm relative overflow-hidden select-none"
          style={{
            background: "linear-gradient(90deg, #0B4A5A 0%, #0B6E6E 100%)"
          }}
        >
          {/* Top Bar (Height: 76px) */}
          <div className="flex justify-between items-center px-5 pt-5 pb-4 h-[76px] w-full shrink-0">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-bold text-white font-figtree leading-tight">Patient Flow</h3>
              <p className="text-xs text-white/70 font-figtree leading-tight">
                {timeframe === "today" ? "Hourly check-ins · Mon 23 Jun" : "Daily check-ins · This Week"}
              </p>
            </div>
            {/* Toggles (Height: 26px) */}
            <div className="flex items-center gap-2 h-[26px]">
              <button
                type="button"
                onClick={() => setTimeframe("today")}
                className={`px-3 py-1 text-xs font-figtree rounded-full transition-all cursor-pointer ${
                  timeframe === "today" 
                    ? "bg-white text-[#0B6E6E] font-bold" 
                    : "border border-white/70 text-white/70 font-semibold hover:text-white hover:border-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("week")}
                className={`px-3 py-1 text-xs font-figtree rounded-full transition-all cursor-pointer ${
                  timeframe === "week" 
                    ? "bg-white text-[#0B6E6E] font-bold" 
                    : "border border-white/70 text-white/70 font-semibold hover:text-white hover:border-white"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          {/* Metrics Strip (Height: 85px) */}
          <div className="flex items-center px-5 py-4 gap-4 h-[85px] w-full shrink-0">
            {/* Metric Total */}
            <div className="flex flex-col items-start gap-1.5 flex-1">
              <span className="text-[11px] font-figtree font-semibold uppercase tracking-wider text-white/70">
                {timeframe === "today" ? "Total Today" : "Total Week"}
              </span>
              <div className="flex items-center gap-2 h-[34px]">
                <span className="text-2xl font-bold font-figtree text-white">
                  {timeframe === "today" ? "51" : "342"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex items-center px-2 py-0.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 h-[21px]">
                  <span className="text-[11px] font-bold font-figtree text-[#10B981]">
                    {timeframe === "today" ? "+8" : "+24"}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider 1 */}
            <div className="w-[1px] h-11 bg-white/10 shrink-0" />

            {/* Metric Peak */}
            <div className="flex flex-col items-start gap-1.5 flex-1">
              <span className="text-[11px] font-figtree font-semibold uppercase tracking-wider text-white/70">Peak Hour</span>
              <div className="flex items-center gap-2 h-[34px]">
                <span className="text-2xl font-bold font-figtree text-white">
                  {timeframe === "today" ? "11" : "68"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-semibold font-figtree text-white/70">
                  {timeframe === "today" ? "10:00 AM" : "Wed"}
                </span>
              </div>
            </div>

            {/* Divider 2 */}
            <div className="w-[1px] h-11 bg-white/10 shrink-0" />

            {/* Metric Avg */}
            <div className="flex flex-col items-start gap-1.5 flex-1">
              <span className="text-[11px] font-figtree font-semibold uppercase tracking-wider text-white/70">Avg / Hour</span>
              <div className="flex items-center gap-2 h-[34px]">
                <span className="text-2xl font-bold font-figtree text-white">
                  {timeframe === "today" ? "5.6" : "48.8"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Chart Area (Height: 161px) */}
          <div className="flex flex-col items-start px-5 py-3 gap-2 h-[161px] w-full shrink-0">
            {/* Plot Area (Height: 115px) */}
            <div className="relative w-full h-[115px] shrink-0">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-[1px] bg-white/15" />
                <div className="w-full h-[1px] bg-white/15" />
                <div className="w-full h-[1px] bg-white/15" />
              </div>

              {/* SVG Area */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 738 115" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="whiteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={
                    timeframe === "today"
                      ? "M 4 92 C 44 80, 54 66, 94 66 C 134 66, 140 34, 180 34 C 220 34, 253 70, 293 62 C 333 54, 342 28, 382 28 C 422 28, 412 33, 452 33 C 492 33, 506 6, 546 6 C 586 6, 616 33, 656 33 C 696 33, 694 -1, 734 -1 L 734 115 L 4 115 Z"
                      : "M 4 69 C 44 65, 86 60, 126 57 C 166 54, 208 23, 248 23 C 288 23, 330 65, 370 69 C 410 73, 452 83, 492 80 C 532 77, 574 62, 614 57 C 654 52, 694 80, 734 92 L 734 115 L 4 115 Z"
                  }
                  fill="url(#whiteGradient)"
                  className="transition-all duration-500 ease-in-out"
                />
                <path
                  d={
                    timeframe === "today"
                      ? "M 4 92 C 44 80, 54 66, 94 66 C 134 66, 140 34, 180 34 C 220 34, 253 70, 293 62 C 333 54, 342 28, 382 28 C 422 28, 412 33, 452 33 C 492 33, 506 6, 546 6 C 586 6, 616 33, 656 33 C 696 33, 694 -1, 734 -1"
                      : "M 4 69 C 44 65, 86 60, 126 57 C 166 54, 208 23, 248 23 C 288 23, 330 65, 370 69 C 410 73, 452 83, 492 80 C 532 77, 574 62, 614 57 C 654 52, 694 80, 734 92"
                  }
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>

              {/* Data Point Dots */}
              {timeframe === "today" ? (
                <>
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "4px", top: "92px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "94px", top: "66px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "293px", top: "62px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "382px", top: "28px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "452px", top: "33px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "546px", top: "6px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "656px", top: "33px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "734px", top: "-1px", transform: "translate(-50%, -50%)" }} />
                </>
              ) : (
                <>
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "4px", top: "69px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "126px", top: "57px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "370px", top: "69px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "492px", top: "80px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "614px", top: "57px", transform: "translate(-50%, -50%)" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" style={{ left: "734px", top: "92px", transform: "translate(-50%, -50%)" }} />
                </>
              )}

              {/* Dashed vertical line */}
              <div 
                className="absolute border-l border-dashed border-white/40 transition-all duration-500 ease-in-out pointer-events-none"
                style={{
                  left: timeframe === "today" ? "180px" : "248px",
                  top: timeframe === "today" ? "34px" : "23px",
                  height: timeframe === "today" ? `${115 - 34}px` : `${115 - 23}px`
                }}
              />

              {/* Active Indicator Current Point Dot */}
              <div 
                className="absolute w-2.5 h-2.5 bg-white rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 ease-in-out pointer-events-none"
                style={{
                  left: timeframe === "today" ? "180px" : "248px",
                  top: timeframe === "today" ? "34px" : "23px",
                  transform: "translate(-50%, -50%)"
                }}
              />

              {/* Tooltip & NOW Label Overlay */}
              <div 
                className="absolute flex flex-col items-center pointer-events-none transition-all duration-500 ease-in-out"
                style={{
                  left: timeframe === "today" ? "180px" : "248px",
                  top: timeframe === "today" ? "34px" : "23px",
                  transform: "translate(-50%, -100%)",
                  marginTop: "-8px"
                }}
              >
                {/* Tooltip */}
                <div className="bg-white text-[#0B6E6E] text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.15)] whitespace-nowrap mb-1">
                  {timeframe === "today" ? "11 patients" : "68 patients"}
                </div>
                {/* Now / Peak labels */}
                <span className="text-[10px] text-[#7FFFD4] font-bold uppercase tracking-wider mb-0.5">
                  {timeframe === "today" ? "NOW" : "PEAK"}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L5 1L9 5" stroke="#7FFFD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* X-Axis Labels (Height: 12px) */}
            <div className="flex justify-between w-full h-[12px] px-1 select-none">
              {timeframe === "today" ? (
                <>
                  <span className="text-[10px] font-figtree font-normal text-white/50">08</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">09</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">10</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">11</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">12</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">01</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">02</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">03</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">04</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Mon</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Tue</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Wed</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Thu</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Fri</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Sat</span>
                  <span className="text-[10px] font-figtree font-normal text-white/50">Sun</span>
                </>
              )}
            </div>
          </div>

          {/* Insight Bar (Height: 40px) */}
          <div className="flex justify-between items-center px-5 py-3 h-[40px] w-full bg-white/10 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[13px] font-semibold font-figtree text-white">
                {timeframe === "today" ? "Peak activity now - 11 check-ins at 10 AM" : "Peak activity - Wed (68 patients)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/70">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-normal font-figtree text-white/70">
                {timeframe === "today" ? "Next peak expected 11 AM" : "Next peak expected tomorrow"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Prescriptions list Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 flex flex-col justify-between h-[362px] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3 mb-2">
            <div>
              <h3 className="font-bold text-[#1e2940]">Prescriptions</h3>
              <p className="text-[11px] text-[#647589] mt-0.5">Today · 5 written</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-[#0b6e6e] hover:underline cursor-pointer">
              <span>View All</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f1f5f9] pr-1">
            {prescriptionsList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f1f5f9] text-[#647589] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1e2940]">{item.name}</p>
                    <p className="text-[10px] text-[#94a3b8]">{item.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.drugs.map((drug, dIdx) => (
                    <span key={dIdx} className="text-[10px] bg-[#f1f5f9] text-[#647589] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {drug}
                    </span>
                  ))}
                  <button className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer">
                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
