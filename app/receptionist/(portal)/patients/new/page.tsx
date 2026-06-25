"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Cancel01Icon, CheckmarkCircle01Icon, StethoscopeIcon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Doctor = { id: string; full_name: string; specialization: string | null };

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const allergyOptions = ["Penicillin", "Sulfa", "Latex", "Aspirin", "Ibuprofen", "Codeine", "Peanuts", "Shellfish"];

function getInitials(name: string) {
  return name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getDepartment(specialization: string | null): string {
  if (!specialization) return "General";
  const spec = specialization.toLowerCase();
  if (spec.includes("cardio")) return "Cardiology";
  if (spec.includes("pediat")) return "Pediatrics";
  if (spec.includes("dermat")) return "Dermatology";
  if (spec.includes("gyneco")) return "Gynecology";
  if (spec.includes("ortho")) return "Orthopedics";
  return specialization;
}

export default function AddNewPatientPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone");

  const [visitType, setVisitType] = useState("consultation");
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    firstName: "", lastName: "", mobile: "", email: "",
    dob: "", gender: "", bloodType: "", address: "",
  });
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phoneParam) {
      setForm((f) => ({ ...f, mobile: phoneParam }));
    }
  }, [phoneParam]);

  // Step and Modal States
  const [activeStep, setActiveStep] = useState<"form" | "billing" | "token">("form");
  const [generatedToken, setGeneratedToken] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "insurance">("cash");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];
      const [{ data: doctorData }, { data: queueData }] = await Promise.all([
        supabase
          .from("doctors").select("id, full_name, specialization")
          .eq("is_active", true).order("full_name").limit(6),
        supabase
          .from("queue_entries")
          .select("doctor_id")
          .eq("queue_date", today)
      ]);

      const counts: Record<string, number> = {};
      (queueData ?? []).forEach((q: any) => {
        if (q.doctor_id) {
          counts[q.doctor_id] = (counts[q.doctor_id] || 0) + 1;
        }
      });

      setDoctors(doctorData ?? []);
      setPatientCounts(counts);
    };
    load();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addAllergy = () => {
    const val = allergyInput.trim();
    if (val && !allergies.includes(val)) setAllergies((a) => [...a, val]);
    setAllergyInput("");
  };

  const handleNextToBilling = () => {
    setError(null);
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.mobile.trim()) { setError("Mobile number is required."); return; }
    if (!selectedDoctorId) { setError("Please select a doctor to assign."); return; }
    setActiveStep("billing");
  };

  const handleFinalizePaymentAndCheckIn = async () => {
    setError(null);
    setSaving(true);
    const supabase = createClient();
    try {
      // 1. Insert patient
      const patientPayload = {
        full_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone: form.mobile || null,
        email: form.email || null,
        date_of_birth: form.dob || null,
        gender: form.gender || null,
        blood_group: form.bloodType || null,
        address: form.address || null,
        allergies: allergies.length > 0 ? allergies.join(",") : null,
        is_active: true,
      } as any;
      const { data: patientData, error: patientErr } = await supabase
        .from("patients")
        .insert(patientPayload)
        .select("id")
        .single() as unknown as { data: { id: string } | null; error: any };

      if (patientErr) throw patientErr;

      // 1.5 Create appointment
      const today = new Date().toISOString().split("T")[0];
      const appointmentPayload = {
        patient_id: patientData!.id,
        doctor_id: selectedDoctorId,
        appointment_date: today,
        appointment_time: new Date().toTimeString().split(" ")[0],
        type: visitType,
        status: "checked_in",
      } as any;
      const { data: appointmentData, error: appointmentErr } = await supabase
        .from("appointments")
        .insert(appointmentPayload)
        .select("id")
        .single() as unknown as { data: { id: string } | null; error: any };

      if (appointmentErr) throw appointmentErr;

      // 2. Determine token number for today
      // @ts-ignore
      const { data: lastEntries, error: lastEntriesErr } = await supabase
        .from("queue_entries")
        .select("token_number")
        .eq("queue_date", today)
        .order("token_number", { ascending: false })
        .limit(1) as unknown as { data: { token_number: number }[] | null; error: any };

      if (lastEntriesErr) throw lastEntriesErr;
      
      const nextToken = lastEntries && lastEntries.length > 0 ? lastEntries[0].token_number + 1 : 1;

      // 3. Insert queue entry
      const queuePayload = {
        patient_id: patientData!.id,
        doctor_id: selectedDoctorId,
        appointment_id: appointmentData!.id,
        queue_date: today,
        token_number: nextToken,
        status: "waiting",
        checked_in_at: new Date().toISOString(),
      } as any;
      const { data: queueData, error: queueErr } = await supabase
        .from("queue_entries")
        .insert(queuePayload)
        .select("token_number")
        .single() as unknown as { data: { token_number: number } | null; error: any };

      if (queueErr) throw queueErr;

      // 4. Create invoice
      const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      const invoicePayload = {
        invoice_no: invoiceNo,
        patient_id: patientData!.id,
        doctor_id: selectedDoctorId,
        subtotal: 600,
        discount: 0,
        tax: 0,
        total: 600,
        paid_amount: 600,
        payment_method: paymentMethod,
        status: "paid",
        issued_at: new Date().toISOString(),
        due_date: today,
      } as any;
      await supabase.from("billing_invoices").insert(invoicePayload);

      setGeneratedToken(queueData!.token_number);
      setActiveStep("token");
    } catch (err: any) {
      setError(err.message || "An error occurred during check in.");
      setActiveStep("form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Add New Patient</h1>
        <p className="text-sm text-neutral-500 mt-1">Please fill in the patient details to create a new record in the system.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error-50 border border-error-200 text-sm text-error-700">{error}</div>
      )}

      <div className="space-y-4">
        {/* Personal Information */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-neutral-100">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Personal Information</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" placeholder="e.g. Ahmed" value={form.firstName} onChange={(e) => set("firstName", (e.target as HTMLInputElement).value)} />
              <Input label="Last Name" placeholder="e.g. Khan" value={form.lastName} onChange={(e) => set("lastName", (e.target as HTMLInputElement).value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Mobile Number *" placeholder="+92 300 0000000" value={form.mobile} onChange={(e) => set("mobile", (e.target as HTMLInputElement).value)} />
              <Input label="Email Address" placeholder="ahmed.khan@example.com" value={form.email} onChange={(e) => set("email", (e.target as HTMLInputElement).value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={form.dob} onChange={(e) => set("dob", (e.target as HTMLInputElement).value)} />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                options={[{ value: "", label: "Select Gender" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Blood Type"
                value={form.bloodType}
                onChange={(e) => set("bloodType", e.target.value)}
                options={[{ value: "", label: "Select Group" }, ...bloodTypes.map((b) => ({ value: b, label: b }))]}
              />
              <Select
                label="Visit Type *"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                options={[
                  { value: "consultation", label: "Consultation" },
                  { value: "follow_up", label: "Follow-up" },
                  { value: "emergency", label: "Emergency" },
                  { value: "procedure", label: "Procedure" }
                ]}
              />
              <Input label="Residential Address" placeholder="Street, Sector, City" value={form.address} onChange={(e) => set("address", (e.target as HTMLInputElement).value)} />
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Allergies</label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search or type to add allergy..."
                    value={allergyInput}
                    onChange={(e) => setAllergyInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                    list="allergy-options"
                  />
                  <datalist id="allergy-options">
                    {allergyOptions.map((a) => <option key={a} value={a} />)}
                  </datalist>
                </div>
                <Button variant="primary" leftIcon={PlusSignIcon} onClick={addAllergy} className="shrink-0">Add</Button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-error-50 text-error-700 border border-error-200 rounded-full">
                      {a}
                      <button onClick={() => setAllergies((prev) => prev.filter((x) => x !== a))} className="hover:text-error-900 transition-colors">
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Assign Doctor */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-neutral-100">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Medical Information</p>
          </div>
          <div className="p-6">
            {doctors.length === 0 ? (
              <p className="text-sm text-neutral-400">Loading doctors...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id === selectedDoctorId ? null : doc.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedDoctorId === doc.id
                      ? "border-[#0d6e6b] bg-[#f4f8f7] ring-1 ring-[#0d6e6b]/30"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                  >
                    <div className="flex items-start justify-between w-full gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#0d6e6b] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(doc.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-850 leading-snug">{doc.full_name}</p>
                          <p className="text-xs text-neutral-450 mt-0.5">{doc.specialization ?? "—"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#e6f0fa] text-[#1e88e5] whitespace-nowrap shrink-0">Available</span>
                    </div>

                    <div className="grid grid-cols-2 pt-3 border-t border-neutral-100 w-full">
                      <div>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">DEPARTMENT</p>
                        <p className="text-xs font-bold text-neutral-800">{getDepartment(doc.specialization)}</p>
                      </div>
                      <div className="pl-4 border-l border-neutral-200">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">TOTAL PATIENTS</p>
                        <p className="text-xs font-bold text-neutral-800">{patientCounts[doc.id] ?? 0}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-2">
          <Button variant="outline" onClick={() => router.push("/receptionist/patients")}>Cancel</Button>
          <Button
            variant="primary"
            leftIcon={CheckmarkCircle01Icon}
            loading={saving}
            onClick={handleNextToBilling}
            size="md"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Step 3: Billing & Payment Modal */}
      {activeStep === "billing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-800">Billing &amp; Payment</h2>
              <button onClick={() => setActiveStep("form")} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
              </button>
            </div>



            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Assigned Patient Info */}
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#f0f4f8] rounded-lg text-sm text-neutral-700">
                <div className="w-8 h-8 rounded-full bg-[#0d6e6b] flex items-center justify-center text-white shrink-0">
                  <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4" />
                </div>
                <span>
                  <strong className="text-neutral-800 font-bold">{form.firstName} {form.lastName}</strong> assigned to <strong className="text-[#0d6e6b] font-bold">{doctors.find(d => d.id === selectedDoctorId)?.full_name || "Doctor"}</strong>
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100">
                <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral-500">
                  <span>Consultation Fee</span>
                  <span className="font-semibold text-neutral-800">₹500</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral-500">
                  <span>Registration Fee</span>
                  <span className="font-semibold text-neutral-800">₹100</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-50 font-bold text-sm text-neutral-850">
                  <span>Total Amount</span>
                  <span className="text-[#0d6e6b]">₹600</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-xs font-bold text-neutral-600 mb-2.5">Payment Method</p>
                <div className="grid grid-cols-3 gap-3">
                  {(["cash", "card", "insurance"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 rounded-lg border text-center font-bold text-sm transition-all capitalize ${
                        paymentMethod === method
                          ? "border-[#0d6e6b] bg-[#0d6e6b] text-white"
                          : "border-neutral-250 hover:border-neutral-350 text-neutral-600 bg-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveStep("form")}>
                &larr; Back
              </Button>
              <Button 
                variant="primary" 
                className="bg-[#0d6e6b] hover:bg-[#0b5c59] text-white border-0" 
                onClick={handleFinalizePaymentAndCheckIn}
                loading={saving}
              >
                Confirm &amp; Generate Token
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Token Generated Modal */}
      {activeStep === "token" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-800">Token Generated</h2>
              <button onClick={() => router.push("/receptionist/patients")} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
              </button>
            </div>



            {/* Content */}
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#e6f4f2] text-[#0d6e6b] flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Check In Successful!</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {form.firstName} {form.lastName} assigned to {doctors.find(d => d.id === selectedDoctorId)?.full_name || "Doctor"}
                </p>
              </div>

              {/* Dashed token box */}
              <div className="w-full max-w-xs border border-dashed border-[#0d6e6b] bg-[#f4fcfb] rounded-2xl py-6 px-4 my-2">
                <span className="text-[10px] font-bold text-[#0d6e6b] uppercase tracking-widest block mb-1">TOKEN NUMBER</span>
                <span className="text-5xl font-black text-[#0d6e5c]">#{String(generatedToken ?? "").padStart(2, "0")}</span>
              </div>

              <p className="text-xs font-semibold text-neutral-500">Est. Wait: 15 min</p>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="md" onClick={() => alert("Printing token...")}>
                  Print Token
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  className="bg-[#0d6e6b] hover:bg-[#0b5c59] text-white border-0" 
                  onClick={() => router.push("/receptionist/patients")}
                >
                  Done
                </Button>
              </div>
              <button 
                type="button" 
                onClick={() => router.push("/receptionist/patients")} 
                className="text-xs font-semibold text-[#0d6e6b] hover:underline self-center"
              >
                Back to Patients
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
