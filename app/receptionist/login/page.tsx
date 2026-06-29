"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function ReceptionistLoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ employeeId?: string; password?: string }>({});

  // IT support states
  const [showItModal, setShowItModal] = useState(false);
  const [itForm, setItForm] = useState({ name: "Kavya Menon", issue: "Forgot Password", message: "" });
  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { employeeId?: string; password?: string } = {};
    if (!employeeId.trim()) errs.employeeId = "Email Address required";
    if (!password) errs.password = "Password required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();
    const { data: receptionist, error: recepErr } = await (supabase
      .from("receptionists")
      .select("id, email, full_name")
      .eq("email", employeeId.trim())
      .maybeSingle() as any);

    if (recepErr || !receptionist) {
      setLoading(false);
      setErrors({ employeeId: "Receptionist email not found in clinic records." });
      return;
    }

    localStorage.setItem("receptionist_id", receptionist.id);
    localStorage.setItem("receptionist_name", receptionist.full_name);
    setLoading(false);
    router.push("/receptionist/dashboard");
  };

  const handleItSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem("it_support_requests") || "[]");
    const newRequest = {
      id: Math.random().toString(36).substring(2, 9),
      name: itForm.name,
      date: today,
      issue: itForm.issue,
      message: itForm.message,
      status: "Pending"
    };
    localStorage.setItem("it_support_requests", JSON.stringify([newRequest, ...existing]));
    alert("Your IT Support request has been submitted to the Clinic Administrator!");
    setShowItModal(false);
    setItForm({ name: "Kavya Menon", issue: "Forgot Password", message: "" });
  };

  const clearError = (field: "employeeId" | "password") =>
    setErrors((p) => ({ ...p, [field]: undefined }));

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-1.5">OPD Reception Portal</h1>
          <p className="text-sm text-neutral-500">Sign in to manage patient appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            placeholder="e.g. mary.joseph@zocare.health"
            value={employeeId}
            onChange={(e) => { setEmployeeId((e.target as HTMLInputElement).value); clearError("employeeId"); }}
            error={errors.employeeId}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword((e.target as HTMLInputElement).value); clearError("password"); }}
            error={errors.password}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading}>
            Log in
          </Button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Forgot Password?{" "}
          <span 
            className="text-[#0B6E6E] font-semibold cursor-pointer hover:underline"
            onClick={() => setShowItModal(true)}
          >
            Contact IT Support
          </span>
        </p>
      </div>

      {/* IT Support Request Modal */}
      {showItModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-2xl text-left">
            <div>
              <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight">Contact IT Support</h3>
              <p className="text-xs text-neutral-400 mt-1">Submit a password reset or account recovery ticket</p>
            </div>
            
            <form onSubmit={handleItSubmit} className="space-y-4">
              <Select
                label="Select Name"
                value={itForm.name}
                onChange={(e) => setItForm((prev) => ({ ...prev, name: e.target.value }))}
                options={[
                  { value: "Kavya Menon", label: "Kavya Menon (Receptionist)" },
                  { value: "Rohan Sharma", label: "Rohan Sharma (Receptionist)" },
                  { value: "Divya Pillai", label: "Divya Pillai (Receptionist)" }
                ]}
              />

              <Input
                label="Date"
                value={today}
                disabled
              />

              <Select
                label="Issue Category"
                value={itForm.issue}
                onChange={(e) => setItForm((prev) => ({ ...prev, issue: e.target.value }))}
                options={[
                  { value: "Forgot Password", label: "Forgot Password / Reset Link Request" },
                  { value: "Account Locked", label: "Account Locked" },
                  { value: "Software Issue", label: "Portal Software Glitch" },
                  { value: "Other", label: "Other Support Request" }
                ]}
              />

              <Input
                label="Details / Message"
                multiline
                rows={3}
                placeholder="Explain your problem briefly..."
                value={itForm.message}
                onChange={(e) => setItForm((prev) => ({ ...prev, message: (e.target as HTMLTextAreaElement).value }))}
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowItModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-[#0b6e6e] border-[#0b6e6e]">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
