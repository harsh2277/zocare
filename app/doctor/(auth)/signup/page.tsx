"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { StethoscopeIcon, UserIcon, Mail01Icon, CallIcon, LockPasswordIcon } from "@hugeicons/core-free-icons";

export default function DoctorSignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    registrationNo: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const set = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    if (!formData.specialization.trim()) e.specialization = "Specialization is required";
    if (!formData.registrationNo.trim()) e.registrationNo = "Registration number is required";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8) e.password = "Minimum 8 characters";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) e.terms = "You must agree to the terms";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl  p-8">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <span className="text-xs text-neutral-500 font-medium">Step 1 of 1 — Personal Info</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1">
            <div className="bg-primary-600 h-1 rounded-full w-full" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mb-3">
            <HugeiconsIcon icon={StethoscopeIcon} className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Create Account</h1>
          <p className="text-sm text-neutral-500 mt-1">Join Zocare as a doctor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Dr. Jane Smith"
            value={formData.fullName}
            onChange={(e) => set("fullName", (e.target as HTMLInputElement).value)}
            leftIcon={UserIcon}
            error={errors.fullName}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => set("email", (e.target as HTMLInputElement).value)}
              leftIcon={Mail01Icon}
              error={errors.email}
            />
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => set("phone", (e.target as HTMLInputElement).value)}
              leftIcon={CallIcon}
              error={errors.phone}
            />
          </div>

          <Input
            label="Specialization"
            placeholder="e.g. Cardiology, General Practice"
            value={formData.specialization}
            onChange={(e) => set("specialization", (e.target as HTMLInputElement).value)}
            leftIcon={StethoscopeIcon}
            error={errors.specialization}
          />

          <Input
            label="Medical Registration No."
            placeholder="e.g. MED-123456"
            value={formData.registrationNo}
            onChange={(e) => set("registrationNo", (e.target as HTMLInputElement).value)}
            error={errors.registrationNo}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => set("password", (e.target as HTMLInputElement).value)}
              leftIcon={LockPasswordIcon}
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => set("confirmPassword", (e.target as HTMLInputElement).value)}
              leftIcon={LockPasswordIcon}
              error={errors.confirmPassword}
            />
          </div>

          <div>
            <Checkbox
              checked={agreedToTerms}
              onChange={setAgreedToTerms}
              label=""
            />
            <span className="text-sm text-neutral-700 ml-2">
              I agree to the{" "}
              <Link href="/terms" className="text-primary-600 hover:underline font-medium">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
            </span>
            {errors.terms && <p className="text-xs text-error-600 mt-1">{errors.terms}</p>}
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-5">
          Already have an account?{" "}
          <Link href="/doctor/signin" className="text-primary-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
