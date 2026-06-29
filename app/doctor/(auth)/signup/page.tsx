"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const specializationOptions = [
  { value: "", label: "Select..." },
  { value: "Cardiology", label: "Cardiology" },
  { value: "General Practice", label: "General Practice" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Neurology", label: "Neurology" }
];

export default function DoctorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNo: "",
    specialization: "",
    hospitalDept: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.registrationNo.trim()) e.registrationNo = "Medical License Number is required";
    if (!formData.specialization.trim()) e.specialization = "Specialization is required";
    if (!formData.hospitalDept.trim()) e.hospitalDept = "Hospital/Department is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: newDoc, error: insertErr } = await (supabase
      .from("doctors") as any)
      .insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization,
        registration_no: formData.registrationNo.trim(),
        is_active: true
      })
      .select("id")
      .single() as any;

    if (insertErr) {
      setLoading(false);
      setErrors({ form: "Error registering doctor: " + insertErr.message });
      return;
    }

    localStorage.setItem("doctor_id", newDoc.id);
    localStorage.setItem("doctor_name", formData.fullName.trim());
    localStorage.setItem("doctor_specialization", formData.specialization);
    setLoading(false);
    router.push("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[540px] bg-white rounded-2xl p-8 border border-[#e5e9f0]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Create Doctor Account</h1>
          <p className="text-sm text-[#64748b] mt-1.5">Register to join the OPD system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Dr. John Doe"
              value={formData.fullName}
              onChange={(e) => set("fullName", (e.target as HTMLInputElement).value)}
              error={errors.fullName}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                Medical License Number
              </label>
              <Input
                type="text"
                placeholder="REG-12345"
                value={formData.registrationNo}
                onChange={(e) => set("registrationNo", (e.target as HTMLInputElement).value)}
                error={errors.registrationNo}
                className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                Specialization
              </label>
              <Select
                options={specializationOptions}
                value={formData.specialization}
                onChange={(e) => set("specialization", (e.target as HTMLSelectElement).value)}
                error={errors.specialization}
                className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
              Hospital/Department
            </label>
            <Input
              type="text"
              placeholder="e.g. Cardiology"
              value={formData.hospitalDept}
              onChange={(e) => set("hospitalDept", (e.target as HTMLInputElement).value)}
              error={errors.hospitalDept}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
              Email
            </label>
            <Input
              type="email"
              placeholder="doctor@hospital.com"
              value={formData.email}
              onChange={(e) => set("email", (e.target as HTMLInputElement).value)}
              error={errors.email}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
              Password
            </label>
            <Input
              type="password"
              placeholder="........"
              value={formData.password}
              onChange={(e) => set("password", (e.target as HTMLInputElement).value)}
              error={errors.password}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          {errors.form && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#086f6c] hover:bg-[#065451] text-white py-3.5 px-4 font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e5e9f0]" /></div>
          <span className="relative bg-white px-3 text-xs text-[#94a3b8] font-medium">or</span>
        </div>

        <button
          type="button"
          className="w-full bg-[#eaebed] hover:bg-[#e2e4e7] text-[#1e293b] py-3.5 px-4 font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          style={{ borderRadius: '8px' }}
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
          <span className="text-sm font-bold text-[#1e293b]">Continue with Google</span>
        </button>

        <p className="text-sm text-[#64748b] text-center mt-6">
          Already registered?{" "}
          <Link href="/doctor/signin" style={{ borderRadius: '0' }} className="text-[#086f6c] hover:underline font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
