"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type NotifKey = "newAppt" | "cancelAppt" | "queueUpdates" | "patientMessages";

export default function DoctorSettingsPage() {
  const [activeTab, setActiveTab] = useState("clinic");

  // Clinic Info
  const [clinic, setClinic] = useState({ name: "Zocare Clinic", address: "123 Health Street, Mumbai", phone: "+91 22 1234 5678", email: "clinic@zocare.health", slotDuration: "15" });
  const [hours, setHours] = useState(weekdays.map((d) => ({ day: d, active: d !== "Sunday", start: "09:00", end: "17:00" })));

  // Notifications
  const [emailNotif, setEmailNotif] = useState<Record<NotifKey, boolean>>({ newAppt: true, cancelAppt: true, queueUpdates: false, patientMessages: true });
  const [smsNotif, setSmsNotif] = useState<Record<NotifKey, boolean>>({ newAppt: true, cancelAppt: false, queueUpdates: false, patientMessages: false });

  // Security
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  // Appearance
  const [appearance, setAppearance] = useState({ language: "en", dateFormat: "DD/MM/YYYY", timeFormat: "12h", timezone: "Asia/Kolkata" });

  const notifRows: { key: NotifKey; label: string; desc: string }[] = [
    { key: "newAppt",        label: "New appointment booked",   desc: "Notify when a patient books an appointment" },
    { key: "cancelAppt",     label: "Appointment cancelled",    desc: "Notify when an appointment is cancelled" },
    { key: "queueUpdates",   label: "Queue updates",            desc: "Notify when queue position changes" },
    { key: "patientMessages",label: "Patient messages",         desc: "Notify when a patient sends a message" },
  ];

  const sessions = [
    { device: "Chrome on macOS", location: "Mumbai, India", time: "Active now" },
    { device: "Safari on iPhone", location: "Mumbai, India", time: "2 hours ago" },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your clinic and account preferences" />

      <Tabs
        tabs={[
          { id: "clinic",        label: "Clinic Info"    },
          { id: "notifications", label: "Notifications"  },
          { id: "security",      label: "Security"       },
          { id: "appearance",    label: "Appearance"     },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Clinic Info */}
      {activeTab === "clinic" && (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Clinic Information</CardTitle></CardHeader>
            <div className="space-y-4">
              <Input label="Clinic Name" value={clinic.name} onChange={(e) => setClinic((c) => ({ ...c, name: (e.target as HTMLInputElement).value }))} />
              <Input label="Address" multiline rows={2} value={clinic.address} onChange={(e) => setClinic((c) => ({ ...c, address: (e.target as HTMLTextAreaElement).value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" value={clinic.phone} onChange={(e) => setClinic((c) => ({ ...c, phone: (e.target as HTMLInputElement).value }))} />
                <Input label="Email" value={clinic.email} onChange={(e) => setClinic((c) => ({ ...c, email: (e.target as HTMLInputElement).value }))} />
              </div>
              <Select
                label="Appointment Slot Duration"
                value={clinic.slotDuration}
                onChange={(e) => setClinic((c) => ({ ...c, slotDuration: (e.target as HTMLSelectElement).value }))}
                options={[{ value:"10",label:"10 minutes" },{ value:"15",label:"15 minutes" },{ value:"20",label:"20 minutes" },{ value:"30",label:"30 minutes" }]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Working Hours</CardTitle></CardHeader>
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-4">
                  <Toggle
                    checked={h.active}
                    onChange={(v) => setHours((prev) => prev.map((d, j) => j === i ? { ...d, active: v } : d))}
                  />
                  <span className="text-sm text-neutral-700 w-28 shrink-0">{h.day}</span>
                  <Input type="time" value={h.start} disabled={!h.active} onChange={(e) => setHours((prev) => prev.map((d, j) => j === i ? { ...d, start: (e.target as HTMLInputElement).value } : d))} className="w-32" />
                  <span className="text-neutral-400 text-sm">to</span>
                  <Input type="time" value={h.end} disabled={!h.active} onChange={(e) => setHours((prev) => prev.map((d, j) => j === i ? { ...d, end: (e.target as HTMLInputElement).value } : d))} className="w-32" />
                </div>
              ))}
            </div>
          </Card>

          <Button variant="primary">Save Changes</Button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
            <div className="divide-y divide-neutral-100">
              {notifRows.map((r) => (
                <div key={r.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{r.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{r.desc}</p>
                  </div>
                  <Toggle checked={emailNotif[r.key]} onChange={(v) => setEmailNotif((p) => ({ ...p, [r.key]: v }))} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>SMS Notifications</CardTitle></CardHeader>
            <div className="divide-y divide-neutral-100">
              {notifRows.map((r) => (
                <div key={r.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{r.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{r.desc}</p>
                  </div>
                  <Toggle checked={smsNotif[r.key]} onChange={(v) => setSmsNotif((p) => ({ ...p, [r.key]: v }))} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <div className="space-y-4">
              <Input label="Current Password" type="password" value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: (e.target as HTMLInputElement).value }))} />
              <Input label="New Password" type="password" value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: (e.target as HTMLInputElement).value }))} />
              <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: (e.target as HTMLInputElement).value }))} />
              <Button variant="primary">Update Password</Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <p className="text-sm text-neutral-500 mb-4">Add an extra layer of security to your account by enabling 2FA via authenticator app.</p>
            <Button variant="outline">Enable 2FA</Button>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{s.device}</p>
                    <p className="text-xs text-neutral-400">{s.location} • {s.time}</p>
                  </div>
                  {i !== 0 && <Button size="sm" variant="ghost" className="text-error-600 hover:bg-error-50">Revoke</Button>}
                  {i === 0 && <span className="text-xs text-success-600 font-semibold">This device</span>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
            <p className="text-sm text-neutral-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="outline" className="border-error-300 text-error-600 hover:bg-error-50">Delete Account</Button>
          </Card>
        </div>
      )}

      {/* Appearance */}
      {activeTab === "appearance" && (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Appearance & Localization</CardTitle></CardHeader>
            <div className="space-y-4">
              <Select
                label="Language"
                value={appearance.language}
                onChange={(e) => setAppearance((a) => ({ ...a, language: (e.target as HTMLSelectElement).value }))}
                options={[{ value:"en",label:"English" },{ value:"hi",label:"Hindi" },{ value:"gu",label:"Gujarati" },{ value:"mr",label:"Marathi" }]}
              />
              <Select
                label="Date Format"
                value={appearance.dateFormat}
                onChange={(e) => setAppearance((a) => ({ ...a, dateFormat: (e.target as HTMLSelectElement).value }))}
                options={[{ value:"DD/MM/YYYY",label:"DD/MM/YYYY" },{ value:"MM/DD/YYYY",label:"MM/DD/YYYY" },{ value:"YYYY-MM-DD",label:"YYYY-MM-DD" }]}
              />
              <Select
                label="Time Format"
                value={appearance.timeFormat}
                onChange={(e) => setAppearance((a) => ({ ...a, timeFormat: (e.target as HTMLSelectElement).value }))}
                options={[{ value:"12h",label:"12-hour (AM/PM)" },{ value:"24h",label:"24-hour" }]}
              />
              <Select
                label="Timezone"
                value={appearance.timezone}
                onChange={(e) => setAppearance((a) => ({ ...a, timezone: (e.target as HTMLSelectElement).value }))}
                options={[{ value:"Asia/Kolkata",label:"Asia/Kolkata (IST, UTC+5:30)" },{ value:"UTC",label:"UTC" }]}
              />
              <Button variant="primary">Save Preferences</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
