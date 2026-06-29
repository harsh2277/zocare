"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Edit02Icon, EyeIcon, Delete01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

type StaffMember = {
  id: string;
  role: "doctor" | "receptionist";
  name: string;
  initials: string;
  email: string;
  phone: string;
  spec?: string;
  regNo?: string;
  status: "active" | "inactive";
  joined: string;
  logs: { date: string; action: string }[];
};

const initialStaff: StaffMember[] = [
  {
    id: "d1", role: "doctor", name: "Dr. Anita Sharma", initials: "AS", email: "anita@zocare.health", phone: "+91 98765 43210", spec: "Cardiologist", regNo: "MH-12345", status: "active", joined: "Jan 2024",
    logs: [
      { date: "29 Jun 2026, 09:30 AM", action: "Logged in to portal" },
      { date: "29 Jun 2026, 10:15 AM", action: "Prescribed Tab. Paracetamol 650mg to Priya Sharma" },
      { date: "29 Jun 2026, 11:00 AM", action: "Completed consultation for Rahul Mehta" },
    ]
  },
  {
    id: "d2", role: "doctor", name: "Dr. Vikram Patel", initials: "VP", email: "vikram@zocare.health", phone: "+91 87654 32109", spec: "General Physician", regNo: "MH-12346", status: "active", joined: "Mar 2024",
    logs: [
      { date: "28 Jun 2026, 08:00 AM", action: "Logged in to portal" },
      { date: "28 Jun 2026, 12:30 PM", action: "Updated patient profile for Arjun Nair" },
    ]
  },
  {
    id: "d3", role: "doctor", name: "Dr. Sneha Rao", initials: "SR", email: "sneha@zocare.health", phone: "+91 76543 21098", spec: "Dermatologist", regNo: "MH-12347", status: "active", joined: "Jun 2024",
    logs: [
      { date: "27 Jun 2026, 02:00 PM", action: "Logged in to portal" },
    ]
  },
  {
    id: "d4", role: "doctor", name: "Dr. Mohan Iyer", initials: "MI", email: "mohan@zocare.health", phone: "+91 65432 10987", spec: "Orthopedist", regNo: "MH-12348", status: "active", joined: "Sep 2024",
    logs: []
  },
  {
    id: "d5", role: "doctor", name: "Dr. Priya Nair", initials: "PN", email: "priya@zocare.health", phone: "+91 54321 09876", spec: "Gynecologist", regNo: "MH-12349", status: "inactive", joined: "Nov 2024",
    logs: []
  },
  {
    id: "r1", role: "receptionist", name: "Kavya Menon", initials: "KM", email: "kavya@zocare.health", phone: "+91 43210 98765", status: "active", joined: "Feb 2024",
    logs: [
      { date: "29 Jun 2026, 08:30 AM", action: "Logged in" },
      { date: "29 Jun 2026, 08:45 AM", action: "Checked in patient Priya Sharma" },
      { date: "29 Jun 2026, 09:10 AM", action: "Generated Invoice INV-000001" },
    ]
  },
  {
    id: "r2", role: "receptionist", name: "Rohan Sharma", initials: "RS", email: "rohan@zocare.health", phone: "+91 32109 87654", status: "active", joined: "Apr 2024",
    logs: [
      { date: "29 Jun 2026, 09:00 AM", action: "Logged in" },
    ]
  },
  {
    id: "r3", role: "receptionist", name: "Divya Pillai", initials: "DP", email: "divya@zocare.health", phone: "+91 21098 76543", status: "inactive", joined: "Jul 2024",
    logs: []
  },
];

const emptyForm = { role: "doctor", fullName: "", email: "", phone: "", spec: "", regNo: "", tempPassword: "", sendInvite: true };

export default function DoctorStaffPage() {
  const [activeTab, setActiveTab] = useState("doctors");
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail / Edit / Delete states
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "logs">("info");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", spec: "", regNo: "", status: "active" });
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  const setField = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleAddStaff = () => {
    if (!form.fullName || !form.email) return;
    const newMember: StaffMember = {
      id: Math.random().toString(36).substring(2, 9),
      role: form.role as "doctor" | "receptionist",
      name: form.fullName,
      initials: form.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      email: form.email,
      phone: form.phone || "—",
      spec: form.role === "doctor" ? form.spec : undefined,
      regNo: form.role === "doctor" ? form.regNo : undefined,
      status: "active",
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      logs: [{ date: new Date().toLocaleString(), action: "Profile created and added to clinic staff" }]
    };
    setStaff((prev) => [...prev, newMember]);
    setShowAddModal(false);
    setForm(emptyForm);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      spec: member.spec || "",
      regNo: member.regNo || "",
      status: member.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editingStaff) return;
    setStaff((prev) =>
      prev.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: editForm.name,
              email: editForm.email,
              phone: editForm.phone,
              spec: s.role === "doctor" ? editForm.spec : undefined,
              regNo: s.role === "doctor" ? editForm.regNo : undefined,
              status: editForm.status as "active" | "inactive",
            }
          : s
      )
    );
    setEditingStaff(null);
  };

  const handleDeleteStaff = () => {
    if (!deletingStaff) return;
    setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    setDeletingStaff(null);
    setSelectedStaff(null);
  };

  const doctorsList = staff.filter((s) => s.role === "doctor");
  const receptionistsList = staff.filter((s) => s.role === "receptionist");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff & Users"
        subtitle="Manage your clinic staff"
        action={<Button leftIcon={PlusSignIcon} onClick={() => setShowAddModal(true)}>Add Staff</Button>}
      />

      <div className="mb-5">
        <Tabs
          tabs={[{ id: "doctors", label: "Doctors" }, { id: "receptionists", label: "Receptionists" }]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />
      </div>

      {/* Staff Table Card */}
      <Card padding="none" className="overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-[#FBFCFD] select-none">
                {activeTab === "doctors" ? (
                  ["Staff Member", "Specialization", "Registration No.", "Phone", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-neutral-450 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))
                ) : (
                  ["Staff Member", "Phone", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-neutral-450 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {activeTab === "doctors" ? (
                doctorsList.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 cursor-pointer text-sm" onClick={() => { setSelectedStaff(row); setDetailTab("info"); }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" fallback={row.initials} />
                        <div>
                          <p className="font-semibold text-neutral-800">{row.name}</p>
                          <p className="text-xs text-neutral-400">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-medium">{row.spec}</td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-neutral-500">{row.regNo}</span></td>
                    <td className="px-5 py-3.5 text-neutral-650 font-mono">{row.phone}</td>
                    <td className="px-5 py-3.5 text-neutral-600">{row.joined}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setSelectedStaff(row); setDetailTab("info"); }} className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors" title="View Details"><HugeiconsIcon icon={EyeIcon} className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-neutral-500 hover:text-[#0b6e6e] hover:bg-[#F0FAFA] rounded-lg cursor-pointer transition-colors" title="Edit"><HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /></button>
                        <button onClick={() => setDeletingStaff(row)} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" title="Delete"><HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                receptionistsList.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 cursor-pointer text-sm" onClick={() => { setSelectedStaff(row); setDetailTab("info"); }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" fallback={row.initials} />
                        <div>
                          <p className="font-semibold text-neutral-800">{row.name}</p>
                          <p className="text-xs text-neutral-400">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-650 font-mono">{row.phone}</td>
                    <td className="px-5 py-3.5 text-neutral-600">{row.joined}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setSelectedStaff(row); setDetailTab("info"); }} className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors" title="View Details"><HugeiconsIcon icon={EyeIcon} className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-neutral-500 hover:text-[#0b6e6e] hover:bg-[#F0FAFA] rounded-lg cursor-pointer transition-colors" title="Edit"><HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /></button>
                        <button onClick={() => setDeletingStaff(row)} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" title="Delete"><HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal (Duplicate footer issue fixed by setting showFooter={false}) */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setForm(emptyForm); }} title="Add Staff Member" showFooter={false}>
        <div className="text-left space-y-4 mt-2">
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setField("role", (e.target as HTMLSelectElement).value)}
            options={[{ value: "doctor", label: "Doctor" }, { value: "receptionist", label: "Receptionist" }]}
          />
          <Input label="Full Name" placeholder="Full name" value={form.fullName} onChange={(e) => setField("fullName", (e.target as HTMLInputElement).value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="staff@clinic.com" value={form.email} onChange={(e) => setField("email", (e.target as HTMLInputElement).value)} />
            <Input label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setField("phone", (e.target as HTMLInputElement).value)} />
          </div>
          {form.role === "doctor" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Specialization" placeholder="e.g. Cardiologist" value={form.spec} onChange={(e) => setField("spec", (e.target as HTMLInputElement).value)} />
              <Input label="Registration No." placeholder="MH-XXXXX" value={form.regNo} onChange={(e) => setField("regNo", (e.target as HTMLInputElement).value)} />
            </div>
          )}
          <Input label="Temporary Password" type="password" placeholder="Min. 8 characters" value={form.tempPassword} onChange={(e) => setField("tempPassword", (e.target as HTMLInputElement).value)} />
          <Checkbox checked={form.sendInvite as boolean} onChange={(v) => setField("sendInvite", v)} label="Send email invite with login credentials" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 bg-[#0b6e6e] border-[#0b6e6e]" onClick={handleAddStaff}>
              Add & Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Staff Detail Drawer */}
      {selectedStaff && (
        <Drawer
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          title={selectedStaff.name}
          subtitle={`${selectedStaff.role.toUpperCase()} • Joined ${selectedStaff.joined}`}
          showFooter={false}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6">
              {/* Drawer Tabs */}
              <div className="flex border-b border-neutral-100">
                <button
                  type="button"
                  onClick={() => setDetailTab("info")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-0 cursor-pointer ${
                    detailTab === "info" ? "border-[#0B6E6E] text-[#0B6E6E]" : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab("logs")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-0 cursor-pointer ${
                    detailTab === "logs" ? "border-[#0B6E6E] text-[#0B6E6E]" : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  Activity Logs ({selectedStaff.logs.length})
                </button>
              </div>

              {detailTab === "info" && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="text-sm font-semibold text-neutral-800">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Mobile Number</p>
                    <p className="text-sm font-semibold text-neutral-800">{selectedStaff.phone}</p>
                  </div>
                  {selectedStaff.role === "doctor" && (
                    <>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Specialization</p>
                        <p className="text-sm font-semibold text-neutral-800">{selectedStaff.spec}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Registration No.</p>
                        <p className="text-sm font-semibold text-neutral-800">{selectedStaff.regNo}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Status</p>
                    <Badge variant={selectedStaff.status === "active" ? "success" : "neutral"}>{selectedStaff.status === "active" ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
              )}

              {detailTab === "logs" && (
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {selectedStaff.logs.length > 0 ? (
                    selectedStaff.logs.map((l, idx) => (
                      <div key={idx} className="p-3 bg-[#FBFCFD] rounded-xl border border-neutral-200/60 text-xs">
                        <p className="font-semibold text-neutral-800">{l.action}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{l.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-6">No recent activities found.</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <Button
                variant="ghost"
                leftIcon={Delete01Icon}
                className="text-error-600 hover:bg-error-50 p-2"
                onClick={() => {
                  setDeletingStaff(selectedStaff);
                }}
              >
                Delete User
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" leftIcon={Edit02Icon} onClick={() => { handleOpenEdit(selectedStaff); setSelectedStaff(null); }}>
                  Edit Details
                </Button>
                <Button variant="primary" onClick={() => setSelectedStaff(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Modal isOpen={!!editingStaff} onClose={() => setEditingStaff(null)} title="Edit Staff Details" showFooter={false}>
          <div className="text-left space-y-4 mt-2">
            <Input
              label="Full Name"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: (e.target as HTMLInputElement).value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email Address"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: (e.target as HTMLInputElement).value }))}
              />
              <Input
                label="Phone Number"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: (e.target as HTMLInputElement).value }))}
              />
            </div>
            {editingStaff.role === "doctor" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Specialization"
                  value={editForm.spec}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, spec: (e.target as HTMLInputElement).value }))}
                />
                <Input
                  label="Registration No."
                  value={editForm.regNo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, regNo: (e.target as HTMLInputElement).value }))}
                />
              </div>
            )}
            <Select
              label="Account Status"
              value={editForm.status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingStaff(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1 bg-[#0b6e6e] border-[#0b6e6e]" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete/Deactivate Confirmation Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-2xl text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-error-50 border border-error-100 flex items-center justify-center text-error-600">
              <HugeiconsIcon icon={Delete01Icon} className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">Delete Staff Member</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Are you sure you want to delete <strong>{deletingStaff.name}</strong>? This action will permanently remove their profile and login permissions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setDeletingStaff(null)}>Cancel</Button>
              <Button
                variant="primary"
                className="bg-error-600 hover:bg-error-700 border-0"
                onClick={handleDeleteStaff}
              >
                Delete Staff
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
