"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CallIcon, StethoscopeIcon, CheckmarkCircle01Icon, PrinterIcon, PlusSignIcon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPatient?: PatientResult | null;
}

type PatientResult = { id: string; patient_id: string; name: string; phone: string; age: number | null; blood: string | null };
type DoctorOption = { id: string; name: string; specialization: string | null };
type Step = 1 | 2 | 3 | 4;

const steps = [
  { n: 1 as Step, label: "Find Patient" },
  { n: 2 as Step, label: "Doctor" },
  { n: 3 as Step, label: "Billing" },
  { n: 4 as Step, label: "Token" },
];

const stepTitles: Record<Step, string> = {
  1: "Check In Patient",
  2: "Confirm Patient & Assign Doctor",
  3: "Billing & Payment",
  4: "Token Generated",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export const CheckInModal = ({ isOpen, onClose, initialPatient }: Props) => {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [mobileSearch, setMobileSearch] = useState("");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [visitType, setVisitType] = useState("consultation");
  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "insurance">("cash");
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("doctors").select("id, full_name, specialization")
        .eq("is_active", true).order("full_name");
      setDoctors(((data ?? []) as any[]).map((d: any) => ({ id: d.id, name: d.full_name, specialization: d.specialization })));
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialPatient) {
        setSelectedPatient(initialPatient);
        setStep(2);
      } else {
        setSelectedPatient(null);
        setStep(1);
      }
    }
  }, [initialPatient, isOpen]);

  // Auto-search mobile number
  useEffect(() => {
    if (!isOpen) return;
    if (!mobileSearch.trim()) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("patients").select("id, patient_id, full_name, phone, date_of_birth, blood_group")
        .ilike("phone", `%${mobileSearch.trim()}%`).limit(5);
      setResults(((data ?? []) as any[]).map((p: any) => ({
        id: p.id, patient_id: p.patient_id, name: p.full_name, phone: p.phone ?? "",
        age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31536000000) : null,
        blood: p.blood_group,
      })));
      setSearching(false);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [mobileSearch, isOpen]);

  const reset = () => {
    setStep(1); setMobileSearch(""); setResults([]); setSelectedPatient(null);
    setSelectedDoctor(null); setVisitType("consultation"); setNote(""); setPayMethod("cash"); setTokenNumber(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleNext = async () => {
    if (step === 1 && !selectedPatient) return;
    if (step === 2 && !selectedDoctor) return;
    if (step === 3) {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      // Create appointment
      const { data: appointmentData, error: appointmentErr } = await (supabase.from("appointments") as any).insert({
        patient_id: selectedPatient!.id,
        doctor_id: selectedDoctor!.id,
        appointment_date: today,
        appointment_time: new Date().toTimeString().split(" ")[0],
        type: visitType,
        status: "checked_in",
        notes: note || null,
      }).select("id").single();

      if (appointmentErr) {
        console.error(appointmentErr);
        return;
      }

      const { data: maxData } = await (supabase
        .from("queue_entries") as any).select("token_number")
        .eq("queue_date", today).order("token_number", { ascending: false }).limit(1);
      const nextToken = (((maxData as any)?.[0]?.token_number) ?? 0) + 1;
      setTokenNumber(nextToken);

      await (supabase.from("queue_entries") as any).insert({
        patient_id: selectedPatient!.id,
        doctor_id: selectedDoctor!.id,
        appointment_id: appointmentData.id,
        queue_date: today,
        token_number: nextToken,
        status: "waiting",
        checked_in_at: new Date().toISOString(),
        notes: note || null,
      });
    }
    setStep((s) => (s + 1) as Step);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">{stepTitles[step]}</h2>
          <Button variant="ghost" size="sm" leftIcon={Cancel01Icon} onClick={handleClose} />
        </div>



        {/* Body */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Search by Mobile Number</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    leftIcon={CallIcon}
                    placeholder="+92 300 1234567"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch((e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>

              {searching && (
                <p className="text-xs text-neutral-400 text-center py-2">Searching patient...</p>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">MATCHING RESULTS ({results.length})</p>
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${selectedPatient?.id === p.id ? "border-primary-400 bg-primary-50/50" : "border-neutral-200 hover:border-neutral-300"
                        }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(p.name)}</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{p.name}</p>
                        <p className="text-xs text-neutral-500">{p.phone} · {p.patient_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.length === 0 && mobileSearch && !searching && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-neutral-450">No patients found for that number.</p>
                  <Button
                    variant="primary"
                    leftIcon={PlusSignIcon}
                    onClick={() => {
                      handleClose();
                      router.push(`/receptionist/patients/new?phone=${encodeURIComponent(mobileSearch)}`);
                    }}
                  >
                    Add Patient
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && selectedPatient && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Patient</p>
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-primary-300 bg-primary-50/40">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(selectedPatient.name)}</div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{selectedPatient.name}</p>
                    <p className="text-xs text-neutral-500">{selectedPatient.patient_id}{selectedPatient.age != null ? ` · Age ${selectedPatient.age}` : ""}{selectedPatient.blood ? ` · Blood ${selectedPatient.blood}` : ""}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Assign Doctor</p>
                <div className="border-y border-neutral-100 py-3">
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {doctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${selectedDoctor?.id === doc.id ? "border-primary-400 bg-primary-50/40" : "border-neutral-200 hover:border-neutral-300"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{getInitials(doc.name.replace("Dr. ", ""))}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-800 truncate">{doc.name}</p>
                            <p className="text-[10px] text-neutral-400">{doc.specialization ?? "—"}</p>
                          </div>
                        </div>
                        <Badge variant="success">Available</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Visit Type"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  options={[
                    { value: "consultation", label: "Consultation" },
                    { value: "follow_up", label: "Follow-up" },
                    { value: "emergency", label: "Emergency" },
                    { value: "procedure", label: "Procedure" }
                  ]}
                />
                <Input
                  label="Note"
                  multiline
                  rows={2}
                  placeholder="Type symptoms or reasons..."
                  value={note}
                  onChange={(e) => setNote((e.target as HTMLTextAreaElement).value)}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && selectedPatient && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 text-sm">
                <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="font-medium text-neutral-700">{selectedPatient.name}</span>
                <span className="text-neutral-400">assigned to</span>
                <span className="font-semibold text-primary-600">{selectedDoctor.name}</span>
              </div>

              <Card padding="none">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Consultation Fee</span>
                  <span className="text-sm font-medium text-neutral-700">₹500</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Registration Fee</span>
                  <span className="text-sm font-medium text-neutral-700">₹100</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50">
                  <span className="text-sm font-bold text-neutral-800">Total Amount</span>
                  <span className="text-base font-bold text-primary-600">₹600</span>
                </div>
              </Card>

              <div>
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "card", "insurance"] as const).map((m) => (
                    <Button
                      key={m}
                      variant={payMethod === m ? "primary" : "outline"}
                      onClick={() => setPayMethod(m)}
                      className="capitalize"
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && selectedPatient && selectedDoctor && (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-7 h-7 text-success-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">Check In Successful!</h3>
              <p className="text-sm text-neutral-500 mb-6">{selectedPatient.name} assigned to {selectedDoctor.name}</p>

              <div className="border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-xl px-8 py-6 mb-4 mx-auto max-w-xs">
                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-2">TOKEN NUMBER</p>
                <p className="text-5xl font-black text-primary-700">#{tokenNumber ?? "—"}</p>
              </div>

              <p className="text-sm text-neutral-500 mb-6">Est. Wait: <span className="font-semibold text-neutral-700">15 min</span></p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="outline" leftIcon={PrinterIcon}>Print Token</Button>
                <Button variant="primary" leftIcon={CheckmarkCircle01Icon} onClick={() => { handleClose(); router.push("/receptionist/queue"); }}>Done</Button>
              </div>

              <Button variant="link" onClick={() => { handleClose(); router.push("/receptionist/patients"); }}>
                Back to Patients
              </Button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
            {step > 1
              ? <Button variant="outline" leftIcon={ArrowLeft01Icon} onClick={() => setStep((s) => (s - 1) as Step)}>Back</Button>
              : <Button variant="outline" leftIcon={Cancel01Icon} onClick={handleClose}>Cancel</Button>
            }
            <Button variant="primary" rightIcon={ArrowRight01Icon} onClick={handleNext}>
              {step === 3 ? "Confirm & Generate Token" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
