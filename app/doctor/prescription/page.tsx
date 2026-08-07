"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ComboboxDropdown } from "@/components/ui/custom-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/app/empty-state";
import {
  ArrowLeft01Icon,
  Search01Icon,
  PlusSignIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Tick01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";

type MedicineRow = {
  name: string;
  dosage: string;
  m: boolean;
  a: boolean;
  n: boolean;
  days: number;
  instructions: string;
};

type LabTest = {
  id: string;
  name: string;
  category: string;
  checked: boolean;
};

const medicineOptions = [
  { value: "Tab. Paracetamol 650mg", label: "Tab. Paracetamol 650mg" },
  { value: "Tab. Augmentin 625mg", label: "Tab. Augmentin 625mg" },
  { value: "Syp. Ascoril D", label: "Syp. Ascoril D" },
  { value: "Tab. Pantocid 40mg", label: "Tab. Pantocid 40mg" },
  { value: "Tab. Limcee 500mg", label: "Tab. Limcee 500mg" },
  { value: "Tab. Cetirizine 10mg", label: "Tab. Cetirizine 10mg" },
  { value: "Cap. Amoxicillin 500mg", label: "Cap. Amoxicillin 500mg" },
  { value: "Tab. Montair LC", label: "Tab. Montair LC" },
  { value: "Tab. Combiflam", label: "Tab. Combiflam" },
];

export default function DoctorPrescriptionPage() {
  const router = useRouter();

  const [activePatient, setActivePatient] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<{ full_name: string; specialization: string | null; registration_no: string | null } | null>(null);
  const [patientHistory, setPatientHistory] = useState<{ id: string; date: string; title: string; desc: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const getDoctorId = () => {
    const stored = localStorage.getItem("doctor_id");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (stored && uuidRegex.test(stored)) {
      return stored;
    }
    return null;
  };

  const loadActiveConsultation = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const docId = getDoctorId();

    const activeId = localStorage.getItem("active_consultation_id");
    if (!activeId && !docId) {
      router.push("/doctor/signin");
      return;
    }

    let query = supabase
      .from("queue_entries")
      .select(`id, token_number, checked_in_at, notes, appointment_id, patient_id, doctor_id,
        patients(id, patient_id, full_name, date_of_birth, gender, allergies, notes, blood_group),
        appointments(id, type, chief_complaint)`);

    if (activeId) {
      query = query.eq("id", activeId);
    } else {
      query = query.eq("doctor_id", docId as string).eq("queue_date", today).eq("status", "in_progress");
    }

    const { data, error } = await (query.maybeSingle() as any);

    if (data && !error) {
      const birthDate = data.patients?.date_of_birth;
      let age = 0;
      if (birthDate) {
        age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31536000000);
      }
      setActivePatient({
        id: data.id,
        patient_uuid: data.patients?.id,
        appointment_id: data.appointment_id,
        patient_id: data.patients?.patient_id,
        token: data.token_number,
        name: data.patients?.full_name,
        age: age,
        gender: data.patients?.gender === "male" ? "M" : data.patients?.gender === "female" ? "F" : "O",
        complaint: data.appointments?.chief_complaint ?? data.notes ?? "",
        type: data.appointments?.type === "consultation" ? "OPD" :
              data.appointments?.type === "follow_up" ? "Follow-up" :
              data.appointments?.type === "emergency" ? "Emergency" : "Routine",
        idNum: data.patients?.patient_id,
        lastVisit: "Today",
        blood: data.patients?.blood_group ?? "—",
        allergies: data.patients?.allergies ? data.patients.allergies.split(",") : [],
      });
      
      if (data.appointments?.chief_complaint) {
        setChiefComplaint(data.appointments.chief_complaint);
      }

      const doctorId = data.doctor_id ?? docId;
      if (doctorId) {
        const { data: doctorData } = await (supabase
          .from("doctors")
          .select("full_name, specialization, registration_no")
          .eq("id", doctorId)
          .maybeSingle() as any);
        if (doctorData) setDoctorInfo(doctorData);
      }

      const patientUuid = data.patients?.id;
      if (patientUuid) {
        const { data: historyData } = await (supabase
          .from("prescriptions")
          .select("id, diagnosis, chief_complaint, notes, created_at")
          .eq("patient_id", patientUuid)
          .order("created_at", { ascending: false })
          .limit(10) as any);
        setPatientHistory(
          (historyData ?? []).map((rx: any) => ({
            id: rx.id,
            date: rx.created_at ? new Date(rx.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—",
            title: rx.diagnosis || rx.chief_complaint || "Consultation",
            desc: rx.notes || rx.chief_complaint || "No notes recorded.",
          }))
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActiveConsultation();
  }, []);

  // Textarea state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [doctorsAdvice, setDoctorsAdvice] = useState("");

  // Symptoms state
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState("");
  const [showAddSymptomInput, setShowAddSymptomInput] = useState(false);

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom("");
      setShowAddSymptomInput(false);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  // Medicine Rows state
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);

  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [modalMedName, setModalMedName] = useState("");
  const [modalMedDosage, setModalMedDosage] = useState("1 tab");
  const [modalMedM, setModalMedM] = useState(false);
  const [modalMedA, setModalMedA] = useState(false);
  const [modalMedN, setModalMedN] = useState(false);
  const [modalMedDays, setModalMedDays] = useState(5);
  const [modalMedInstructions, setModalMedInstructions] = useState("After Food");
  const [bulkText, setBulkText] = useState("");

  const addMedicineRow = () => {
    setShowAddMedicineModal(true);
  };

  const submitAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "single") {
      handleAddMedicine(false);
    } else {
      const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;
      const newRows: MedicineRow[] = lines.map((line) => ({
        name: line,
        dosage: "1 tab",
        m: true,
        a: false,
        n: false,
        days: 5,
        instructions: "After Food",
      }));
      setMedicines([...medicines, ...newRows]);
      setBulkText("");
      setShowAddMedicineModal(false);
    }
  };


  const handleAddMedicine = (keepOpen: boolean) => {
    if (!modalMedName.trim()) return;

    setMedicines([
      ...medicines,
      {
        name: modalMedName,
        dosage: modalMedDosage,
        m: modalMedM,
        a: modalMedA,
        n: modalMedN,
        days: Number(modalMedDays),
        instructions: modalMedInstructions,
      },
    ]);

    // Reset name and frequency for next entry
    setModalMedName("");
    setModalMedM(false);
    setModalMedA(false);
    setModalMedN(false);

    if (!keepOpen) {
      setShowAddMedicineModal(false);
    }
  };

  const removeMedicineRow = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const toggleMedicineCheckbox = (idx: number, field: "m" | "a" | "n") => {
    const updated = [...medicines];
    updated[idx][field] = !updated[idx][field];
    setMedicines(updated);
  };

  const updateMedicineField = (idx: number, field: keyof MedicineRow, val: any) => {
    const updated = [...medicines];
    updated[idx] = { ...updated[idx], [field]: val };
    setMedicines(updated);
  };

  // Lab Tests state
  const [labTests, setLabTests] = useState<LabTest[]>([
    { id: "cbc", name: "CBC", category: "Haematology", checked: false },
    { id: "hba1c", name: "HbA1c", category: "Diabetes", checked: false },
    { id: "lipid", name: "Lipid Profile", category: "Cardiology", checked: false },
    { id: "lft", name: "LFT", category: "Liver", checked: false },
    { id: "kft", name: "KFT", category: "Kidney", checked: false },
    { id: "sugar", name: "Blood Sugar F/PP", category: "Diabetes", checked: false },
  ]);
  const [labTestSearch, setLabTestSearch] = useState("");

  const toggleLabTest = (id: string) => {
    setLabTests(labTests.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));
  };

  const clearAllLabTests = () => {
    setLabTests(labTests.map((t) => ({ ...t, checked: false })));
  };

  // Follow-up Date
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  const setQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split("T")[0]);
  };

  // Save / Complete Consultation handler
  const completeConsultation = async () => {
    if (!activePatient) return;
    
    const supabase = createClient();
    
    // 1. Insert into prescriptions table
    const prescriptionNo = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: prescriptionData, error: rxErr } = await (supabase
      .from("prescriptions") as any)
      .insert({
        prescription_no: prescriptionNo,
        patient_id: activePatient.patient_uuid,
        doctor_id: getDoctorId(),
        appointment_id: activePatient.appointment_id,
        diagnosis: chiefComplaint,
        chief_complaint: chiefComplaint,
        notes: doctorsAdvice,
        follow_up_date: followUpDate || null,
        status: "active"
      })
      .select("id")
      .single() as unknown as { data: { id: string } | null; error: any };

    if (rxErr) {
      alert("Error saving prescription: " + rxErr.message);
      return;
    }

    // 2. Insert prescription items
    if (medicines.length > 0) {
      const itemsPayload = medicines.map((m, index) => {
        let frequency = "";
        if (m.m) frequency += "1-"; else frequency += "0-";
        if (m.a) frequency += "1-"; else frequency += "0-";
        if (m.n) frequency += "1"; else frequency += "0";
        
        return {
          prescription_id: prescriptionData!.id,
          medicine_name: m.name,
          dosage: m.dosage,
          frequency: frequency,
          duration: `${m.days} days`,
          instructions: m.instructions,
          route: "oral",
          quantity: m.days * ( (m.m ? 1 : 0) + (m.a ? 1 : 0) + (m.n ? 1 : 0) ),
          sort_order: index
        };
      });

      const { error: itemsErr } = await (supabase
        .from("prescription_items") as any)
        .insert(itemsPayload);

      if (itemsErr) {
        alert("Error saving prescription items: " + itemsErr.message);
      }
    }

    // 3. Mark queue entry as completed
    await (supabase
      .from("queue_entries") as any)
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", activePatient.id);

    // 4. Mark appointment as completed
    if (activePatient.appointment_id) {
      await (supabase
        .from("appointments") as any)
        .update({ status: "completed" })
        .eq("id", activePatient.appointment_id);
    }

    // Print prescription
    window.print();

    localStorage.removeItem("active_consultation_id");
    window.dispatchEvent(new Event("active_consultation_changed"));
    router.push("/doctor/dashboard");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F1F5F9]">
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading patient consultation...</Card>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F1F5F9] gap-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-lg font-bold text-neutral-800 mb-2">No Active Consultation</h2>
          <p className="text-sm text-neutral-500 mb-4">Please select a patient from the dashboard or live queue to write a prescription.</p>
          <Button variant="primary" onClick={() => router.push("/doctor/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen max-h-screen flex flex-col bg-[#F1F5F9] overflow-hidden print:hidden">
        {/* Patient Info Header Bar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer flex items-center justify-center mr-1"
              title="Back to dashboard"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6 text-neutral-800" />
            </button>

            <div className="w-[50px] h-[50px] rounded-full bg-[#0b6e6e] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {activePatient.name ? activePatient.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "AP"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1E2940]">{activePatient.name}</h1>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs font-bold">{activePatient.age}{activePatient.gender}</span>
                <span className="bg-[#ccf2f2] text-[#0b6e6e] px-2 py-0.5 rounded text-xs font-bold">Token #{activePatient.token}</span>
              </div>
              <p className="text-xs text-[#647589] mt-0.5">
                ID: #{activePatient.idNum} • Last Visit: {activePatient.lastVisit}
              </p>
            </div>
          </div>

          {/* Right Details: Allergies */}
          {activePatient.allergies && activePatient.allergies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#ef4444] tracking-wider">ALLERGIES:</span>
              <div className="flex gap-1.5">
                {activePatient.allergies.map((a: string, i: number) => (
                  <span key={i} className="border border-red-200 text-red-500 bg-red-50/50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {a.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Workspace Frame */}
        <div className="flex-1 min-h-0 p-4 max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
          {/* Left Column (480px equivalent) */}
          <div className="lg:col-span-1 max-h-full flex flex-col gap-4 min-h-0 pr-1 shrink-0">
            {/* Patient History */}
            <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-none flex flex-col flex-1 min-h-0">
              <div className="px-4 py-3 bg-[#FBFCFD] border-b border-[#E2E8F0] shrink-0">
                <h2 className="text-[13px] font-bold text-[#1E2940] tracking-wider uppercase">Patient History</h2>
              </div>
              {patientHistory.length === 0 ? (
                <EmptyState
                  icon={File01Icon}
                  title="No past visits"
                  description="Previous prescriptions for this patient will show up here."
                />
              ) : (
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {patientHistory.map((h) => (
                    <div key={h.id} className="p-3 border border-[#E2E8F0] rounded-xl bg-white space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0B6E6E]">{h.date}</span>
                      </div>
                      <h3 className="text-xs font-bold text-[#1E2940]">{h.title}</h3>
                      <p className="text-xs text-[#647589] leading-relaxed">{h.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (1392px equivalent) */}
          <div className="lg:col-span-3 max-h-full flex flex-col gap-4 overflow-y-auto min-h-0 pr-1 pb-4">
            {/* Clinical Assessment */}
            <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-none shrink-0">
              <div className="px-5 py-3.5 bg-[#FBFCFD] border-b border-[#E2E8F0]">
                <h2 className="text-[13px] font-bold text-[#1E2940] tracking-wider uppercase">Clinical Assessment</h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Chief Complaint */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#647589]">Chief Complaint</label>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full h-16 p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#1e293b] focus:outline-none focus:border-[#0B6E6E] resize-none"
                    placeholder="Fever since 3 days, body ache and dry cough..."
                  />
                </div>

                {/* Associated Symptoms */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#647589] block">Associated Symptoms</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {symptoms.map((sym) => (
                      <span
                        key={sym}
                        onClick={() => removeSymptom(sym)}
                        className="bg-[#0B6E6E] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#095858] transition-colors"
                      >
                        {sym}
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                      </span>
                    ))}
                    {showAddSymptomInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newSymptom}
                          onChange={(e) => setNewSymptom(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSymptom()}
                          className="px-3 py-1 border border-[#0B6E6E] rounded-full text-xs focus:outline-none w-28 bg-white"
                          placeholder="Symptom name..."
                          autoFocus
                        />
                        <button onClick={addSymptom} className="text-xs font-bold text-[#0B6E6E]">Add</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddSymptomInput(true)}
                        className="border border-[#E2E8F0] text-[#94A3B8] px-3 py-1 rounded-full text-xs font-medium hover:border-neutral-300 transition-colors"
                      >
                        + Add Symptom
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Side-by-Side: Medication & Request Lab */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 shrink-0">
              {/* Medication & Prescription */}
              <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-none shrink-0 flex flex-col">
                <div className="px-5 py-3.5 bg-[#FBFCFD] border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
                  <h2 className="text-[13px] font-bold text-[#1E2940] tracking-wider uppercase">Medication & Prescription</h2>
                  <button
                    onClick={addMedicineRow}
                    className="text-xs font-bold text-[#0B6E6E] hover:text-[#095858] transition-colors uppercase tracking-wider flex items-center gap-1 active:scale-95"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="w-3.5 h-3.5" />
                    Add Medicine
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {medicines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">No Medicines Prescribed</p>
                      <p className="text-xs text-[#647589] max-w-[280px] mt-1 leading-relaxed">
                        Add medicines to this prescription by clicking the button above.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider">Medicine Name</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider text-center">Dosage</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider text-center">M A N</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider text-center">Days</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider text-right">Instructions</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#647589] uppercase tracking-wider text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {medicines.map((med, idx) => (
                            <tr key={idx} className="text-sm">
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => updateMedicineField(idx, "name", e.target.value)}
                                  className="bg-transparent border-0 font-semibold text-[#1E2940] focus:ring-0 focus:outline-none w-full"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => updateMedicineField(idx, "dosage", e.target.value)}
                                  className="bg-transparent border-0 text-[#647589] text-center focus:ring-0 focus:outline-none w-20 mx-auto"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center items-center gap-3">
                                  {(["m", "a", "n"] as const).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => toggleMedicineCheckbox(idx, t)}
                                      className={`w-[18px] h-[18px] rounded border border-[#E2E8F0] flex items-center justify-center transition-all ${med[t] ? "bg-[#0B6E6E] border-[#0B6E6E] text-white" : "bg-white text-transparent"
                                        }`}
                                    >
                                      <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  value={med.days}
                                  onChange={(e) => updateMedicineField(idx, "days", Number(e.target.value))}
                                  className="bg-transparent border-0 text-[#1E2940] text-center focus:ring-0 focus:outline-none w-12 mx-auto"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <select
                                  value={med.instructions}
                                  onChange={(e) => updateMedicineField(idx, "instructions", e.target.value)}
                                  className="bg-transparent border-0 text-[#647589] text-right focus:ring-0 focus:outline-none text-xs"
                                >
                                  <option value="After Food">After Food</option>
                                  <option value="Before Food">Before Food</option>
                                  <option value="With Food">With Food</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => removeMedicineRow(idx)}
                                  className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                  title="Remove medicine"
                                >
                                  <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>

              {/* Request Lab Investigation */}
              <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-none shrink-0">
                <div className="px-5 py-3.5 bg-[#FBFCFD] border-b border-[#E2E8F0] flex justify-between items-center">
                  <h2 className="text-[13px] font-bold text-[#1E2940] tracking-wider uppercase">Request Lab Investigation</h2>
                  <button onClick={clearAllLabTests} className="text-xs font-bold text-[#647589] hover:text-[#1E2940] transition-colors">Clear All</button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="relative">
                    <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={labTestSearch}
                      onChange={(e) => setLabTestSearch(e.target.value)}
                      placeholder="Search tests or packages..."
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:border-[#0B6E6E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {labTests.filter((t) =>
                      !labTestSearch.trim() ||
                      t.name.toLowerCase().includes(labTestSearch.trim().toLowerCase()) ||
                      t.category.toLowerCase().includes(labTestSearch.trim().toLowerCase())
                    ).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleLabTest(t.id)}
                        className={`p-3 border rounded-xl cursor-pointer select-none transition-all flex flex-col justify-between h-16 ${t.checked
                          ? "bg-[#F0FAFA] border-[#0B6E6E]"
                          : "bg-white border-[#E2E8F0] hover:border-neutral-300"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {t.checked && (
                              <div className="w-[18px] h-[18px] rounded bg-[#0B6E6E] flex items-center justify-center text-white">
                                <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {!t.checked && (
                              <div className="w-[18px] h-[18px] rounded border border-[#E2E8F0] bg-white" />
                            )}
                            <span className="font-bold text-xs text-[#1E2940]">{t.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#647589] font-medium pl-6">{t.category}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end items-center pt-2">
                    <span className="text-xs text-[#647589] font-medium">
                      {labTests.filter((t) => t.checked).length} test{labTests.filter((t) => t.checked).length === 1 ? "" : "s"} selected — included on the printed prescription
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Follow-up & Advice */}
            <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-none shrink-0">
              <div className="px-5 py-3.5 bg-[#FBFCFD] border-b border-[#E2E8F0]">
                <h2 className="text-[13px] font-bold text-[#1E2940] tracking-wider uppercase">Follow-up & Advice</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Advice textarea */}
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-[#647589]">Doctor's Advice</label>
                    <textarea
                      value={doctorsAdvice}
                      onChange={(e) => setDoctorsAdvice(e.target.value)}
                      className="w-full h-24 p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#1e293b] focus:outline-none focus:border-[#0B6E6E] resize-none"
                      placeholder="Doctor's advice..."
                    />
                  </div>

                  {/* Date Selection */}
                  <div className="w-full md:w-[260px] flex flex-col justify-end gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#647589]">Follow-up Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:border-[#0B6E6E]"
                      />
                    </div>
                    {/* Quick selectors */}
                    <div className="flex gap-2">
                      {[
                        { label: "After 3 Days", val: 3 },
                        { label: "1 Week", val: 7 },
                        { label: "1 Month", val: 30 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setQuickFollowUp(btn.val)}
                          className="flex-1 py-1.5 border border-[#E2E8F0] rounded-lg text-[10px] font-bold text-[#647589] hover:bg-neutral-50 transition-colors uppercase"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="h-[72px] bg-white border-t border-[#E2E8F0] px-8 flex items-center justify-end gap-4 shadow-sm z-50 select-none shrink-0 w-full">
          <button
            type="button"
            className="h-[41px] px-6 border border-[#E2E8F0] rounded-lg font-semibold text-sm text-[#647589] hover:bg-neutral-50 active:scale-95 transition-all"
          >
            Share PDF
          </button>
          <button
            type="button"
            onClick={completeConsultation}
            className="h-[41px] px-6 bg-[#0B6E6E] text-white rounded-lg font-bold text-sm hover:bg-[#095858] active:scale-95 transition-all flex items-center gap-1.5"
          >
            Complete & Print Consultation
            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Prescription Layout (Hidden on screen, visible during printing) */}
      <div className="hidden print:block bg-white text-neutral-800 p-10 w-full font-sans text-sm">
        {/* Clinic & Doctor Header */}
        <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-wide">ZOCARE CLINIC</h1>
            <p className="text-xs text-neutral-500 mt-1">Multi-Specialty Care Center</p>
            <p className="text-xs text-neutral-500">123, Health Avenue, Medical Zone</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold text-neutral-900">{doctorInfo?.full_name ?? "—"}</h2>
            <p className="text-xs text-neutral-600">{doctorInfo?.specialization ?? ""}</p>
            <p className="text-[11px] text-neutral-500 mt-1">{doctorInfo?.registration_no ? `Reg No: ${doctorInfo.registration_no}` : ""}</p>
          </div>
        </div>

        {/* Patient Metadata Info */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 bg-neutral-50 p-4 rounded-lg mb-6 text-xs border border-neutral-200">
          <div><strong className="text-neutral-600">Patient Name:</strong> <span className="text-neutral-900 font-semibold">{activePatient.name}</span></div>
          <div className="text-right"><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div><strong className="text-neutral-600">Age / Gender:</strong> {activePatient.age} Yrs / {activePatient.gender}</div>
          <div className="text-right"><strong>Patient ID:</strong> #{activePatient.idNum}</div>
          <div><strong className="text-neutral-600">Token Number:</strong> Token #{activePatient.token}</div>
          <div className="text-right"><strong>Visit Type:</strong> {activePatient.type}</div>
        </div>

        {/* Chief Complaints & Symptoms */}
        {(chiefComplaint.trim() || symptoms.length > 0) && (
          <div className="mb-6">
            <h3 className="font-bold text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Clinical Assessment</h3>
            {chiefComplaint.trim() && (
              <p className="text-xs text-neutral-800 leading-relaxed"><strong className="text-neutral-700">Chief Complaint:</strong> {chiefComplaint}</p>
            )}
            {symptoms.length > 0 && (
              <p className="text-xs text-neutral-800 mt-1 leading-relaxed">
                <strong className="text-neutral-700">Associated Symptoms:</strong> {symptoms.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Rx Section */}
        {medicines.length > 0 && (
          <div className="mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-300 text-neutral-500 font-semibold">
                  <th className="py-2 w-1/2">Medicine Name</th>
                  <th className="py-2 text-center">Dosage</th>
                  <th className="py-2 text-center">Frequency (M-A-N)</th>
                  <th className="py-2 text-center">Duration</th>
                  <th className="py-2 text-right">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {medicines.map((med, i) => (
                  <tr key={i} className="text-neutral-800">
                    <td className="py-2.5 font-semibold">{med.name}</td>
                    <td className="py-2.5 text-center">{med.dosage}</td>
                    <td className="py-2.5 text-center">
                      {med.m ? "1" : "0"}-{med.a ? "1" : "0"}-{med.n ? "1" : "0"}
                    </td>
                    <td className="py-2.5 text-center">{med.days} days</td>
                    <td className="py-2.5 text-right text-neutral-600">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lab Investigations Section */}
        {labTests.some(t => t.checked) && (
          <div className="mb-6">
            <h3 className="font-bold text-xs text-neutral-500 uppercase tracking-wider mb-2">Requested Investigations</h3>
            <div className="flex flex-wrap gap-2">
              {labTests.filter(t => t.checked).map(t => (
                <span key={t.id} className="border border-neutral-300 bg-neutral-50 text-neutral-700 px-3 py-1 rounded text-xs">
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Advice & Follow-up */}
        {(doctorsAdvice.trim() || followUpDate) && (
          <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-neutral-200 print:fixed print:bottom-10 print:left-10 print:right-10 print:mt-0 print:pt-10">
            <div>
              {doctorsAdvice.trim() && (
                <>
                  <h3 className="font-bold text-xs text-neutral-500 uppercase tracking-wider mb-1">Doctor's Advice</h3>
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line mb-3">{doctorsAdvice}</p>
                </>
              )}
              {followUpDate && (
                <p className="text-xs font-semibold text-neutral-800">
                  Follow-up Date: {new Date(followUpDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="flex flex-col justify-end items-end h-full pt-12">
              <div className="w-40 border-b border-neutral-400 text-center pb-1" />
              <p className="text-[10px] text-neutral-500 mt-1">Authorized Doctor Signature</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4 animate-in fade-in duration-200">
          <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl w-full max-w-md min-h-[460px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#FBFCFD] border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-[#1E2940] tracking-wider uppercase">Add New Medicine</h3>
              <button
                type="button"
                onClick={() => setShowAddMedicineModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#E2E8F0] shrink-0 bg-[#FBFCFD] px-5">
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 px-4 -mb-px transition-all cursor-pointer ${activeTab === "single"
                    ? "border-[#0B6E6E] text-[#0B6E6E]"
                    : "border-transparent text-[#647589] hover:text-[#1E2940]"
                  }`}
              >
                Single Medicine
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bulk")}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 px-4 -mb-px transition-all cursor-pointer ${activeTab === "bulk"
                    ? "border-[#0B6E6E] text-[#0B6E6E]"
                    : "border-transparent text-[#647589] hover:text-[#1E2940]"
                  }`}
              >
                Bulk Add
              </button>
            </div>

            {/* Modal Form Body */}
            <form id="add-med-form" onSubmit={submitAddMedicine} className="px-5 pt-5 pb-0 flex-1 space-y-6">
              {activeTab === "single" ? (
                /* Medicine Name */
                <div className="space-y-1.5">
                  <ComboboxDropdown
                    label="Medicine Name"
                    placeholder="Select or type medicine..."
                    options={medicineOptions}
                    value={modalMedName}
                    onSelect={(val) => setModalMedName(val)}
                  />
                </div>
              ) : (
                /* Bulk Text Area */
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-[#647589]">Medicines List (One per line)</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g.&#10;Tab. Paracetamol 650mg&#10;Tab. Augmentin 625mg&#10;Syp. Ascoril D"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#1e293b] focus:outline-none focus:border-[#0B6E6E] focus:bg-white resize-none transition-colors h-[100px]"
                  />
                </div>
              )}

              {/* Frequency MAN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#647589] block">Frequency (M A N)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Morning", active: modalMedM, toggle: () => setModalMedM(!modalMedM) },
                    { label: "Afternoon", active: modalMedA, toggle: () => setModalMedA(!modalMedA) },
                    { label: "Night", active: modalMedN, toggle: () => setModalMedN(!modalMedN) },
                  ].map((freq) => (
                    <button
                      key={freq.label}
                      type="button"
                      onClick={freq.toggle}
                      className={`h-10 border rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center cursor-pointer ${freq.active
                          ? "bg-[#0B6E6E] border-[#0B6E6E] text-white"
                          : "bg-white border-[#E2E8F0] text-[#647589] hover:bg-neutral-50 active:scale-95"
                        }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#647589]">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={modalMedDays}
                    onChange={(e) => setModalMedDays(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#1e293b] focus:outline-none focus:border-[#0B6E6E] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#647589]">Instructions</label>
                  <select
                    value={modalMedInstructions}
                    onChange={(e) => setModalMedInstructions(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#647589] focus:outline-none focus:border-[#0B6E6E] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
              </div>
            </form>

            {/* Modal Footer (Action Buttons) */}
            <div className="px-5 py-3.5 bg-[#FBFCFD] border-t border-[#E2E8F0] flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddMedicineModal(false)}
                className="px-5 border border-[#E2E8F0] rounded-lg font-bold text-xs text-[#647589] hover:bg-[#F8FAFC] active:scale-95 transition-all uppercase tracking-wider h-10 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-med-form"
                className="px-6 bg-[#0B6E6E] text-white rounded-lg font-bold text-xs hover:bg-[#095858] active:scale-95 transition-all uppercase tracking-wider h-10 flex items-center justify-center"
              >
                Add to Prescription
              </button>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:block {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
