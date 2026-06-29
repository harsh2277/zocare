"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function DoctorSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your Email Address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: doctor, error: docErr } = await (supabase
      .from("doctors")
      .select("id, email, full_name, specialization")
      .eq("email", email.trim())
      .maybeSingle() as any);

    if (docErr || !doctor) {
      setLoading(false);
      setError("Doctor email address not found in clinic records.");
      return;
    }

    localStorage.setItem("doctor_id", doctor.id);
    localStorage.setItem("doctor_name", doctor.full_name);
    localStorage.setItem("doctor_specialization", doctor.specialization || "Cardiologist");
    setLoading(false);
    router.push("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[540px] bg-white rounded-2xl p-8 border border-[#e5e9f0]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Doctor Portal</h1>
          <p className="text-sm text-[#64748b] mt-1.5">Access your OPD dashboard and patient records</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
              Email Address
            </label>
            <Input
              type="text"
              placeholder="e.g. sarah.ahmed@zocare.health"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-[#334155]">
                Password
              </label>
              <Link href="/doctor/forgot-password" style={{ borderRadius: '0' }} className="text-sm font-bold text-[#086f6c] hover:text-[#065451] transition-colors">
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="........"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              className="!rounded-lg border-[#cbd5e1] focus:border-[#086f6c] focus:ring-[#086f6c]/20 py-3 text-base"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-error-600 bg-error-50 border border-error-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#086f6c] hover:bg-[#065451] text-white py-3.5 px-4 font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
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
          New doctor?{" "}
          <Link href="/doctor/signup" style={{ borderRadius: '0' }} className="text-[#086f6c] hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
