"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReceptionistLoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ employeeId?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { employeeId?: string; password?: string } = {};
    if (!employeeId.trim()) errs.employeeId = "Employee ID not found";
    if (!password) errs.password = "Incorrect password";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/receptionist/dashboard");
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
            label="Employee ID"
            placeholder="e.g. EMP-10294"
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
          <span className="text-primary-600 font-semibold cursor-pointer hover:underline">
            Contact IT Support
          </span>
        </p>
      </div>
    </div>
  );
}
