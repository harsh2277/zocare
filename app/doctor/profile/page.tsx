"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, CheckmarkCircle01Icon, Mail01Icon, CallIcon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";

type DoctorProfile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  registration_no: string | null;
  avatar_url: string | null;
  created_at: string;
};

const getDoctorId = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("doctor_id");
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return stored && uuidRegex.test(stored) ? stored : null;
};

const formatJoined = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("") || "DR";

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientCount, setPatientCount] = useState<number | null>(null);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [tempPersonal, setTempPersonal] = useState({ fullName: "", email: "", phone: "" });
  const [tempProfessional, setTempProfessional] = useState({ specialization: "", regNo: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await (supabase
        .from("doctors")
        .select("*")
        .eq("id", doctorId)
        .single() as any);

      if (!error && data) {
        setDoctor(data as DoctorProfile);
        setTempPersonal({
          fullName: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
        setTempProfessional({
          specialization: data.specialization ?? "",
          regNo: data.registration_no ?? "",
        });
      }

      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", doctorId);
      setPatientCount(count ?? 0);

      setLoading(false);
    };
    load();
  }, []);

  const startEditPersonal = () => {
    if (!doctor) return;
    setTempPersonal({
      fullName: doctor.full_name ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
    });
    setIsEditingPersonal(true);
  };
  const cancelPersonal = () => setIsEditingPersonal(false);

  const savePersonal = async () => {
    if (!doctor) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("doctors") as any)
      .update({
        full_name: tempPersonal.fullName,
        email: tempPersonal.email,
        phone: tempPersonal.phone,
      })
      .eq("id", doctor.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setDoctor(data as DoctorProfile);
      setIsEditingPersonal(false);
    }
  };

  const startEditProfessional = () => {
    if (!doctor) return;
    setTempProfessional({
      specialization: doctor.specialization ?? "",
      regNo: doctor.registration_no ?? "",
    });
    setIsEditingProfessional(true);
  };

  const saveProfessional = async () => {
    if (!doctor) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("doctors") as any)
      .update({
        specialization: tempProfessional.specialization,
        registration_no: tempProfessional.regNo,
      })
      .eq("id", doctor.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setDoctor(data as DoctorProfile);
      setIsEditingProfessional(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading profile...</div>;
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center text-sm text-neutral-400">
        Could not load doctor profile. Please sign in again.
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary-50 to-neutral-50 border border-neutral-200 rounded-2xl p-8 mb-6 text-center">
        <div className="flex flex-col items-center">
          <Avatar size="xl" fallback={initials(doctor.full_name)} status="online" src={doctor.avatar_url ?? undefined} />
          <h1 className="text-2xl font-bold text-neutral-900 mt-3">{doctor.full_name}</h1>
          <p className="text-sm text-neutral-500 mt-1">{doctor.specialization ?? "—"}</p>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-5 pt-5 border-t border-neutral-200 w-full justify-center">
            {[
              [String(patientCount ?? 0), "Appointments"],
              [doctor.registration_no ?? "—", "Registration No."],
            ].map(([val, label]) => (
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
                  { label: "Full Name", value: doctor.full_name },
                  { label: "Email", value: doctor.email ?? "—" },
                  { label: "Phone", value: doctor.phone ?? "—" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm text-neutral-800">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Full Name" value={tempPersonal.fullName} onChange={(e) => setTempPersonal((p) => ({ ...p, fullName: (e.target as HTMLInputElement).value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Email" type="email" value={tempPersonal.email} onChange={(e) => setTempPersonal((p) => ({ ...p, email: (e.target as HTMLInputElement).value }))} leftIcon={Mail01Icon} />
                  <Input label="Phone" value={tempPersonal.phone} onChange={(e) => setTempPersonal((p) => ({ ...p, phone: (e.target as HTMLInputElement).value }))} leftIcon={CallIcon} />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={cancelPersonal} disabled={saving}>Cancel</Button>
                  <Button variant="primary" className="flex-1" leftIcon={CheckmarkCircle01Icon} onClick={savePersonal} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <Button
                size="sm"
                variant="outline"
                leftIcon={Edit02Icon}
                onClick={() => (isEditingProfessional ? setIsEditingProfessional(false) : startEditProfessional())}
              >
                {isEditingProfessional ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>

            {!isEditingProfessional ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Specialization", value: doctor.specialization ?? "—" },
                  { label: "Registration No.", value: doctor.registration_no ?? "—" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm text-neutral-800">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Specialization" value={tempProfessional.specialization} onChange={(e) => setTempProfessional((p) => ({ ...p, specialization: (e.target as HTMLInputElement).value }))} />
                  <Input label="Registration No." value={tempProfessional.regNo} onChange={(e) => setTempProfessional((p) => ({ ...p, regNo: (e.target as HTMLInputElement).value }))} />
                </div>
                <Button variant="primary" leftIcon={CheckmarkCircle01Icon} onClick={saveProfessional} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                { label: "Joined", value: formatJoined(doctor.created_at) },
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
                  <p className="text-xs text-neutral-400">{doctor.email ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={CallIcon} className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">Phone</p>
                  <p className="text-xs text-neutral-400">{doctor.phone ?? "—"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
