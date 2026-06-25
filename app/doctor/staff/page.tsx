"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Edit02Icon } from "@hugeicons/core-free-icons";

type Doctor = { id: string; name: string; initials: string; email: string; spec: string; regNo: string; phone: string; status: string; joined: string; };
type Receptionist = { id: string; name: string; initials: string; email: string; phone: string; status: string; joined: string; };

const doctors: Doctor[] = [
  { id:"1", name:"Dr. Anita Sharma",  initials:"AS", email:"anita@zocare.health",  spec:"Cardiologist",      regNo:"MH-12345", phone:"+91 98765 43210", status:"active",   joined:"Jan 2024" },
  { id:"2", name:"Dr. Vikram Patel",  initials:"VP", email:"vikram@zocare.health", spec:"General Physician", regNo:"MH-12346", phone:"+91 87654 32109", status:"active",   joined:"Mar 2024" },
  { id:"3", name:"Dr. Sneha Rao",    initials:"SR", email:"sneha@zocare.health",  spec:"Dermatologist",     regNo:"MH-12347", phone:"+91 76543 21098", status:"active",   joined:"Jun 2024" },
  { id:"4", name:"Dr. Mohan Iyer",   initials:"MI", email:"mohan@zocare.health",  spec:"Orthopedist",       regNo:"MH-12348", phone:"+91 65432 10987", status:"active",   joined:"Sep 2024" },
  { id:"5", name:"Dr. Priya Nair",   initials:"PN", email:"priya@zocare.health",  spec:"Gynecologist",      regNo:"MH-12349", phone:"+91 54321 09876", status:"inactive", joined:"Nov 2024" },
];

const receptionists: Receptionist[] = [
  { id:"1", name:"Kavya Menon",   initials:"KM", email:"kavya@zocare.health",   phone:"+91 43210 98765", status:"active",   joined:"Feb 2024" },
  { id:"2", name:"Rohan Sharma",  initials:"RS", email:"rohan@zocare.health",   phone:"+91 32109 87654", status:"active",   joined:"Apr 2024" },
  { id:"3", name:"Divya Pillai",  initials:"DP", email:"divya@zocare.health",   phone:"+91 21098 76543", status:"inactive", joined:"Jul 2024" },
];

const emptyForm = { role: "doctor", fullName: "", email: "", phone: "", spec: "", regNo: "", tempPassword: "", sendInvite: true };

export default function DoctorStaffPage() {
  const [activeTab, setActiveTab] = useState("doctors");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const doctorColumns: Column<Doctor>[] = [
    {
      key: "name", header: "Staff Member",
      render: (v: string, row: Doctor) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={row.initials} />
          <div>
            <p className="font-semibold text-neutral-800">{v}</p>
            <p className="text-xs text-neutral-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "spec",    header: "Specialization" },
    { key: "regNo",  header: "Registration No.", render: (v: string) => <span className="font-mono text-xs text-neutral-500">{v}</span> },
    { key: "phone",  header: "Phone" },
    { key: "joined", header: "Joined" },
    {
      key: "status", header: "Status",
      render: (v: string) => <Badge variant={v === "active" ? "success" : "neutral"}>{v === "active" ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "id", header: "Actions", width: "60px",
      render: () => (
        <Button size="sm" variant="ghost" className="p-1.5"><HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /></Button>
      ),
    },
  ];

  const receptColumns: Column<Receptionist>[] = [
    {
      key: "name", header: "Staff Member",
      render: (v: string, row: Receptionist) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={row.initials} />
          <div>
            <p className="font-semibold text-neutral-800">{v}</p>
            <p className="text-xs text-neutral-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone",  header: "Phone" },
    { key: "joined", header: "Joined" },
    {
      key: "status", header: "Status",
      render: (v: string) => <Badge variant={v === "active" ? "success" : "neutral"}>{v === "active" ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "id", header: "Actions", width: "60px",
      render: () => (
        <Button size="sm" variant="ghost" className="p-1.5"><HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /></Button>
      ),
    },
  ];

  return (
    <div>
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

      {activeTab === "doctors" && (
        <DataTable columns={doctorColumns} data={doctors} keyField="id" />
      )}
      {activeTab === "receptionists" && (
        <DataTable columns={receptColumns} data={receptionists} keyField="id" />
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setForm(emptyForm); }} title="Add Staff Member">
        <div className="text-left space-y-3 mt-2">
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
            <Button variant="primary" className="flex-1" onClick={() => setShowAddModal(false)}>
              Add & Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
