"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete01Icon, PrinterIcon, ArrowLeft02Icon, UserIcon, PrescriptionIcon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  isNew?: boolean;
}

interface PrescriptionForm {
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  followUpDate: string;
}

type PatientInfo = {
  full_name: string;
  patient_id: string;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  allergies: string | null;
  phone: string | null;
};

type DoctorInfo = {
  full_name: string;
  specialization: string | null;
};

const frequencyOptions = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "four_times_daily", label: "Four times daily" },
  { value: "as_needed", label: "As needed" },
];

const routeOptions = [
  { value: "oral", label: "Oral" },
  { value: "topical", label: "Topical" },
  { value: "injection", label: "Injection" },
  { value: "inhaled", label: "Inhaled" },
];

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [prescriptionNo, setPrescriptionNo] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  const [form, setForm] = useState<PrescriptionForm>({
    chiefComplaint: "",
    diagnosis: "",
    notes: "",
    followUpDate: "",
  });
  const [medications, setMedications] = useState<Medication[]>([]);
  const [deletedMedIds, setDeletedMedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const supabase = createClient();

      const { data: rx, error: rxErr } = await supabase
        .from("prescriptions")
        .select("*, patients(full_name, patient_id, gender, date_of_birth, blood_group, allergies, phone), doctors(full_name, specialization)")
        .eq("id", id)
        .single();

      if (rxErr || !rx) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPrescriptionNo((rx as any).prescription_no ?? "");
      setPrescriptionDate((rx as any).created_at ?? "");
      setStatus((rx as any).status ?? "active");
      setPatient((rx as any).patients ?? null);
      setDoctor((rx as any).doctors ?? null);
      setForm({
        chiefComplaint: (rx as any).chief_complaint ?? "",
        diagnosis: (rx as any).diagnosis ?? "",
        notes: (rx as any).notes ?? "",
        followUpDate: (rx as any).follow_up_date ?? "",
      });

      const { data: items, error: itemsErr } = await supabase
        .from("prescription_items")
        .select("*")
        .eq("prescription_id", id)
        .order("sort_order");

      if (!itemsErr && items) {
        setMedications(
          items.map((item: any) => ({
            id: item.id,
            name: item.medicine_name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            route: item.route ?? "oral",
            instructions: item.instructions ?? "",
          }))
        );
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const updateField = (field: keyof PrescriptionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateMedication = (medId: string, field: keyof Medication, value: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === medId ? { ...med, [field]: value } : med))
    );
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: `new-${Date.now()}`,
      name: "",
      dosage: "",
      frequency: "once_daily",
      duration: "",
      route: "oral",
      instructions: "",
      isNew: true,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const removeMedication = (medId: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== medId));
    if (!medId.startsWith("new-")) {
      setDeletedMedIds((prev) => [...prev, medId]);
    }
  };

  const handleSave = async (print: boolean) => {
    if (!id) return;
    setSaving(true);
    const supabase = createClient();

    const { error: updateErr } = await (supabase
      .from("prescriptions") as any)
      .update({
        chief_complaint: form.chiefComplaint,
        diagnosis: form.diagnosis,
        notes: form.notes,
        follow_up_date: form.followUpDate || null,
      })
      .eq("id", id);

    if (updateErr) {
      alert("Error saving prescription: " + updateErr.message);
      setSaving(false);
      return;
    }

    if (deletedMedIds.length > 0) {
      await supabase.from("prescription_items").delete().in("id", deletedMedIds);
      setDeletedMedIds([]);
    }

    const newMeds = medications.filter((m) => m.isNew);
    const existingMeds = medications.filter((m) => !m.isNew);

    if (newMeds.length > 0) {
      await (supabase.from("prescription_items") as any).insert(
        newMeds.map((m, idx) => ({
          prescription_id: id,
          medicine_name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route as any,
          instructions: m.instructions,
          sort_order: existingMeds.length + idx,
        }))
      );
    }

    for (const m of existingMeds) {
      await (supabase
        .from("prescription_items") as any)
        .update({
          medicine_name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route as any,
          instructions: m.instructions,
        })
        .eq("id", m.id);
    }

    setSaving(false);
    if (print) {
      window.print();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading prescription...</div>;
  }

  if (notFound || !patient) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-lg font-bold text-neutral-800 mb-2">Prescription Not Found</h2>
          <p className="text-sm text-neutral-500 mb-4">
            We couldn't find a prescription with this ID. It may have been deleted or the link is invalid.
          </p>
          <Button variant="primary" onClick={() => router.push("/doctor/patients")}>Back to Patients</Button>
        </Card>
      </div>
    );
  }

  let age: number | null = null;
  if (patient.date_of_birth) {
    age = Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31536000000);
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft02Icon} onClick={() => router.back()}>
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Prescription {prescriptionNo}</h1>
            <p className="text-xs text-neutral-500">Review and edit prescription details</p>
          </div>
        </div>
        <Badge variant={status === "active" ? "success" : status === "cancelled" ? "neutral" : "warning"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Top 2-column header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Patient Info Card */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-primary-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <div className="px-5 pb-5">
            <div className="flex items-start gap-4">
              <Avatar size="lg" fallback={patient.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "PT"} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-base font-semibold text-neutral-900">{patient.full_name}</p>
                  <p className="text-xs text-neutral-500">
                    {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "—"}
                    {age !== null ? `, ${age} years` : ""} • ID: {patient.patient_id}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Blood Group</p>
                    <p className="text-sm text-neutral-900 font-medium mt-0.5">{patient.blood_group ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Allergies</p>
                    <p className="text-sm text-error-600 font-medium mt-0.5">{patient.allergies ?? "None"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Contact</p>
                    <p className="text-sm text-neutral-900 font-medium mt-0.5">{patient.phone ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Prescription Info Card */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <HugeiconsIcon icon={PrescriptionIcon} className="h-4 w-4 text-primary-600" />
              Prescription Details
            </CardTitle>
          </CardHeader>
          <div className="px-5 pb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Rx No.</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">{prescriptionNo}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Date</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">
                  {prescriptionDate ? new Date(prescriptionDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Doctor</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">{doctor?.full_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Specialization</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">{doctor?.specialization ?? "—"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Clinical Section */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-neutral-700">Clinical Information</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Chief Complaint"
              multiline
              rows={3}
              value={form.chiefComplaint}
              onChange={(e) => updateField("chiefComplaint", (e.target as HTMLTextAreaElement).value)}
              placeholder="Describe the patient's chief complaint..."
            />
            <Input
              label="Diagnosis"
              multiline
              rows={3}
              value={form.diagnosis}
              onChange={(e) => updateField("diagnosis", (e.target as HTMLTextAreaElement).value)}
              placeholder="Enter diagnosis..."
            />
          </div>
        </div>
      </Card>

      {/* Medications Section */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-neutral-700">Medications</CardTitle>
            <Button variant="primary" size="sm" leftIcon={PlusSignIcon} onClick={addMedication}>
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <div className="px-5 pb-5 space-y-4">
          {medications.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">No medications added yet.</p>
          )}
          {medications.map((med, index) => (
            <div
              key={med.id}
              className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50/50"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  Medication {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeMedication(med.id)}
                  className="text-error-500 hover:text-error-700 transition-colors p-1 rounded-md hover:bg-error-50"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-1">
                  <Input
                    label="Medicine Name"
                    value={med.name}
                    onChange={(e) => updateMedication(med.id, "name", (e.target as HTMLInputElement).value)}
                    placeholder="e.g. Amoxicillin"
                  />
                </div>
                <Input
                  label="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedication(med.id, "dosage", (e.target as HTMLInputElement).value)}
                  placeholder="e.g. 500mg"
                />
                <Input
                  label="Duration"
                  value={med.duration}
                  onChange={(e) => updateMedication(med.id, "duration", (e.target as HTMLInputElement).value)}
                  placeholder="e.g. 7 days"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Select
                  label="Frequency"
                  value={med.frequency}
                  onChange={(e) => updateMedication(med.id, "frequency", (e.target as HTMLSelectElement).value)}
                  options={frequencyOptions}
                />
                <Select
                  label="Route"
                  value={med.route}
                  onChange={(e) => updateMedication(med.id, "route", (e.target as HTMLSelectElement).value)}
                  options={routeOptions}
                />
                <Input
                  label="Instructions"
                  value={med.instructions}
                  onChange={(e) => updateMedication(med.id, "instructions", (e.target as HTMLInputElement).value)}
                  placeholder="e.g. Take after meals"
                />
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" leftIcon={PlusSignIcon} onClick={addMedication} className="w-full">
            Add another medication
          </Button>
        </div>
      </Card>

      {/* Instructions & Follow-up */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-neutral-700">Instructions & Follow-up</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-4">
          <Input
            label="Notes / Advice"
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => updateField("notes", (e.target as HTMLTextAreaElement).value)}
            placeholder="Additional advice or notes..."
          />
          <div className="max-w-xs">
            <Input
              label="Follow-up Date"
              type="date"
              value={form.followUpDate}
              onChange={(e) => updateField("followUpDate", (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button variant="ghost" size="md" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button variant="outline" size="md" onClick={() => handleSave(false)} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="primary" size="md" leftIcon={PrinterIcon} onClick={() => handleSave(true)} disabled={saving}>
          Save & Print
        </Button>
      </div>
    </div>
  );
}
