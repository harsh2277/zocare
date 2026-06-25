"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, CheckmarkCircle01Icon, Mail01Icon, CallIcon } from "@hugeicons/core-free-icons";

const initialPersonal = {
  fullName: "Dr. Anita Sharma", email: "anita@zocare.health", phone: "+91 98765 43210",
  dob: "1985-04-12", gender: "female", address: "Building 3, Andheri West, Mumbai 400058",
};
const initialProfessional = {
  specialization: "Cardiologist", regNo: "MH-12345",
  qualifications: "MBBS, MD (Cardiology)", experience: "8 years",
  languages: ["English", "Hindi", "Gujarati"],
};

export default function DoctorProfilePage() {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [personal, setPersonal] = useState(initialPersonal);
  const [professional, setProfessional] = useState(initialProfessional);
  const [tempPersonal, setTempPersonal] = useState(initialPersonal);

  const setField = (k: string, v: string) => setTempPersonal((p) => ({ ...p, [k]: v }));

  const savePersonal = () => { setPersonal(tempPersonal); setIsEditingPersonal(false); };
  const cancelPersonal = () => { setTempPersonal(personal); setIsEditingPersonal(false); };
  const startEditPersonal = () => { setTempPersonal(personal); setIsEditingPersonal(true); };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary-50 to-neutral-50 border border-neutral-200 rounded-2xl p-8 mb-6 text-center">
        <div className="flex flex-col items-center">
          <Avatar size="xl" fallback="AS" status="online" />
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 transition-colors">
            Change Photo
          </button>
          <h1 className="text-2xl font-bold text-neutral-900 mt-3">{personal.fullName}</h1>
          <p className="text-sm text-neutral-500 mt-1">{professional.qualifications} • {professional.specialization}</p>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-5 pt-5 border-t border-neutral-200 w-full justify-center">
            {[["186", "Patients"], ["4.8★", "Rating"], ["8 yrs", "Experience"], ["MBBS, MD", "Qualifications"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold text-neutral-900">{val}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — personal + professional */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              {!isEditingPersonal && (
                <Button size="sm" variant="outline" leftIcon={Edit02Icon} onClick={startEditPersonal}>Edit</Button>
              )}
            </CardHeader>

            {!isEditingPersonal ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Full Name",   value: personal.fullName },
                  { label: "Email",       value: personal.email     },
                  { label: "Phone",       value: personal.phone     },
                  { label: "Date of Birth", value: personal.dob    },
                  { label: "Gender",      value: personal.gender.charAt(0).toUpperCase() + personal.gender.slice(1) },
                  { label: "Address",     value: personal.address, full: true },
                ].map((f) => (
                  <div key={f.label} className={f.full ? "col-span-2" : ""}>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm text-neutral-800">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Full Name" value={tempPersonal.fullName} onChange={(e) => setField("fullName", (e.target as HTMLInputElement).value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Email" type="email" value={tempPersonal.email} onChange={(e) => setField("email", (e.target as HTMLInputElement).value)} leftIcon={Mail01Icon} />
                  <Input label="Phone" value={tempPersonal.phone} onChange={(e) => setField("phone", (e.target as HTMLInputElement).value)} leftIcon={CallIcon} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Date of Birth" type="date" value={tempPersonal.dob} onChange={(e) => setField("dob", (e.target as HTMLInputElement).value)} />
                  <Select label="Gender" value={tempPersonal.gender} onChange={(e) => setField("gender", (e.target as HTMLSelectElement).value)}
                    options={[{ value:"male",label:"Male" },{ value:"female",label:"Female" },{ value:"other",label:"Other" }]} />
                </div>
                <Input label="Address" multiline rows={2} value={tempPersonal.address} onChange={(e) => setField("address", (e.target as HTMLTextAreaElement).value)} />
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={cancelPersonal}>Cancel</Button>
                  <Button variant="primary" className="flex-1" leftIcon={CheckmarkCircle01Icon} onClick={savePersonal}>Save Changes</Button>
                </div>
              </div>
            )}
          </Card>

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <Button size="sm" variant="outline" leftIcon={Edit02Icon} onClick={() => setIsEditingProfessional(!isEditingProfessional)}>
                {isEditingProfessional ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>

            {!isEditingProfessional ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Specialization",    value: professional.specialization },
                  { label: "Registration No.",  value: professional.regNo          },
                  { label: "Qualifications",    value: professional.qualifications  },
                  { label: "Experience",        value: professional.experience      },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm text-neutral-800">{f.value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {professional.languages.map((lang) => (
                      <Badge key={lang} variant="primary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Specialization" value={professional.specialization} onChange={(e) => setProfessional((p) => ({ ...p, specialization: (e.target as HTMLInputElement).value }))} />
                  <Input label="Registration No." value={professional.regNo} onChange={(e) => setProfessional((p) => ({ ...p, regNo: (e.target as HTMLInputElement).value }))} />
                </div>
                <Input label="Qualifications" value={professional.qualifications} onChange={(e) => setProfessional((p) => ({ ...p, qualifications: (e.target as HTMLInputElement).value }))} />
                <Input label="Years of Experience" value={professional.experience} onChange={(e) => setProfessional((p) => ({ ...p, experience: (e.target as HTMLInputElement).value }))} />
                <Button variant="primary" leftIcon={CheckmarkCircle01Icon} onClick={() => setIsEditingProfessional(false)}>Save</Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right — account info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <div className="space-y-3">
              {[
                { label: "Plan",         value: "Professional" },
                { label: "Joined",       value: "January 2024" },
                { label: "Last Login",   value: "Today, 8:42 AM" },
              ].map((i) => (
                <div key={i.label} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{i.label}</span>
                  <span className="text-sm font-medium text-neutral-800">{i.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Linked Accounts</CardTitle></CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">Email</p>
                  <p className="text-xs text-neutral-400">{personal.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-success-600">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-3.5 h-3.5" />
                  Verified
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={CallIcon} className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">Phone</p>
                  <p className="text-xs text-neutral-400">{personal.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-success-600">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-3.5 h-3.5" />
                  Verified
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
            <p className="text-xs text-neutral-400 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
            <Button variant="ghost" className="text-error-600 hover:bg-error-50 w-full">Delete Account</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
