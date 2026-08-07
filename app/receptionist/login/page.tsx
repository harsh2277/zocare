"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { signIn } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function ReceptionistLoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ employeeId?: string; password?: string }>({});

  // IT support states
  const [showItModal, setShowItModal] = useState(false);
  const [itForm, setItForm] = useState({ name: "", issue: "Forgot Password", message: "" });
  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { employeeId?: string; password?: string } = {};
    if (!employeeId.trim()) errs.employeeId = "Email Address required";
    if (!password) errs.password = "Password required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      await signIn("receptionist", employeeId, password);
      router.replace("/receptionist/queue");
    } catch (err) {
      setErrors({ password: err instanceof Error ? err.message : "Unable to sign in." });
      setLoading(false);
    }
  };

  const [itSubmitting, setItSubmitting] = useState(false);

  const handleItSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setItSubmitting(true);
    const supabase = createClient();
    const { error } = await (supabase.from("it_support_requests") as any).insert({
      requester_name: itForm.name,
      requester_role: "receptionist",
      issue_type: itForm.issue,
      message: itForm.message,
    });
    setItSubmitting(false);

    if (error) {
      alert("Couldn't submit your request: " + error.message);
      return;
    }

    alert("Your IT Support request has been submitted to the Clinic Administrator!");
    setShowItModal(false);
    setItForm({ name: "", issue: "Forgot Password", message: "" });
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
            placeholder="e.g. harsh@gmail.com"
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

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <span className="relative bg-white px-3 text-xs text-neutral-400 font-medium">or</span>
        </div>

        <button
          type="button"
          disabled
          title="Coming soon"
          className="w-full bg-[#eaebed] text-[#94a3b8] py-3.5 px-4 font-bold flex items-center justify-center gap-2.5 cursor-not-allowed opacity-70 rounded-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-sm font-bold">Continue with Google (Coming soon)</span>
        </button>

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
              <Input
                label="Your Name"
                placeholder="e.g. Mary Joseph"
                value={itForm.name}
                onChange={(e) => setItForm((prev) => ({ ...prev, name: (e.target as HTMLInputElement).value }))}
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
                <Button type="submit" variant="primary" className="bg-[#0b6e6e] border-[#0b6e6e]" loading={itSubmitting}>Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
