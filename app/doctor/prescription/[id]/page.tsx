"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete01Icon, PrinterIcon, ArrowLeft02Icon, UserIcon, PrescriptionIcon } from "@hugeicons/core-free-icons";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface Prescription {
  chiefComplaint: string;
  diagnosis: string;
  bp: string;
  temperature: string;
  pulse: string;
  spo2: string;
  medications: Medication[];
  generalInstructions: string;
  followUpDate: string;
  advice: string;
}

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
  const [prescription, setPrescription] = useState<Prescription>({
    chiefComplaint: "Patient presents with fever, sore throat, and mild body aches for 3 days.",
    diagnosis: "Acute pharyngitis, likely viral in origin.",
    bp: "118/76",
    temperature: "99.8°F",
    pulse: "82",
    spo2: "98%",
    medications: [
      {
        id: "med-1",
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "three_times_daily",
        duration: "5 days",
        route: "oral",
        instructions: "Take after meals",
      },
      {
        id: "med-2",
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "once_daily",
        duration: "7 days",
        route: "oral",
        instructions: "Take at bedtime",
      },
    ],
    generalInstructions: "Rest adequately. Drink plenty of fluids. Avoid cold beverages and spicy food.",
    followUpDate: "2026-07-02",
    advice: "Return immediately if symptoms worsen or fever exceeds 103°F.",
  });

  const [status, setStatus] = useState<"Draft" | "Saved" | "Printed">("Draft");

  const updateField = (field: keyof Prescription, value: string) => {
    setPrescription((prev) => ({ ...prev, [field]: value }));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setPrescription((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      ),
    }));
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: "",
      dosage: "",
      frequency: "once_daily",
      duration: "",
      route: "oral",
      instructions: "",
    };
    setPrescription((prev) => ({
      ...prev,
      medications: [...prev.medications, newMed],
    }));
  };

  const removeMedication = (id: string) => {
    setPrescription((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  };

  const handleSaveDraft = () => {
    setStatus("Draft");
  };

  const handleSavePrint = () => {
    setStatus("Printed");
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft02Icon}>
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Write Prescription</h1>
            <p className="text-xs text-neutral-500">Complete the prescription details below</p>
          </div>
        </div>
        <Badge variant={status === "Draft" ? "warning" : status === "Printed" ? "success" : "neutral"}>
          {status}
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
              <Avatar size="lg" fallback="RM" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-base font-semibold text-neutral-900">Rahul Mehta</p>
                  <p className="text-xs text-neutral-500">Male, 28 years • ID: ZC-0042</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Blood Group</p>
                    <p className="text-sm text-neutral-900 font-medium mt-0.5">O+</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Allergies</p>
                    <p className="text-sm text-error-600 font-medium mt-0.5">Penicillin</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Contact</p>
                    <p className="text-sm text-neutral-900 font-medium mt-0.5">+91 98765 43210</p>
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
                <p className="text-sm text-neutral-900 font-medium mt-0.5">RX-2026-00847</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Date</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">June 25, 2026</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Doctor</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">Dr. Anita Sharma</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Qualification</p>
                <p className="text-sm text-neutral-900 font-medium mt-0.5">MBBS, MD</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <Badge variant="warning">Draft</Badge>
                </div>
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
              value={prescription.chiefComplaint}
              onChange={(e) => updateField("chiefComplaint", (e.target as HTMLTextAreaElement).value)}
              placeholder="Describe the patient's chief complaint..."
            />
            <Input
              label="Diagnosis"
              multiline
              rows={3}
              value={prescription.diagnosis}
              onChange={(e) => updateField("diagnosis", (e.target as HTMLTextAreaElement).value)}
              placeholder="Enter diagnosis..."
            />
          </div>

          {/* Vitals Row */}
          <div>
            <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">Vitals</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Blood Pressure"
                value={prescription.bp}
                onChange={(e) => updateField("bp", e.target.value)}
                placeholder="e.g. 120/80"
              />
              <Input
                label="Temperature"
                value={prescription.temperature}
                onChange={(e) => updateField("temperature", e.target.value)}
                placeholder="e.g. 98.6°F"
              />
              <Input
                label="Pulse (bpm)"
                value={prescription.pulse}
                onChange={(e) => updateField("pulse", e.target.value)}
                placeholder="e.g. 72"
              />
              <Input
                label="SpO2 (%)"
                value={prescription.spo2}
                onChange={(e) => updateField("spo2", e.target.value)}
                placeholder="e.g. 98%"
              />
            </div>
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
          {prescription.medications.map((med, index) => (
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
                    onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                    placeholder="e.g. Amoxicillin"
                  />
                </div>
                <Input
                  label="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                  placeholder="e.g. 500mg"
                />
                <Input
                  label="Duration"
                  value={med.duration}
                  onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                  placeholder="e.g. 7 days"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Select
                  label="Frequency"
                  value={med.frequency}
                  onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                  options={frequencyOptions}
                />
                <Select
                  label="Route"
                  value={med.route}
                  onChange={(e) => updateMedication(med.id, "route", e.target.value)}
                  options={routeOptions}
                />
                <Input
                  label="Instructions"
                  value={med.instructions}
                  onChange={(e) => updateMedication(med.id, "instructions", e.target.value)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="General Instructions"
              multiline
              rows={3}
              value={prescription.generalInstructions}
              onChange={(e) => updateField("generalInstructions", (e.target as HTMLTextAreaElement).value)}
              placeholder="General care instructions for the patient..."
            />
            <Input
              label="Advice"
              multiline
              rows={3}
              value={prescription.advice}
              onChange={(e) => updateField("advice", (e.target as HTMLTextAreaElement).value)}
              placeholder="Additional advice or warnings..."
            />
          </div>
          <div className="max-w-xs">
            <Input
              label="Follow-up Date"
              type="date"
              value={prescription.followUpDate}
              onChange={(e) => updateField("followUpDate", e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button variant="ghost" size="md" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="outline" size="md" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button variant="primary" size="md" leftIcon={PrinterIcon} onClick={handleSavePrint}>
          Save & Print
        </Button>
      </div>
    </div>
  );
}
