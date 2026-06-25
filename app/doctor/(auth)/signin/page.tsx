"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, LockPasswordIcon, StethoscopeIcon } from "@hugeicons/core-free-icons";

export default function DoctorSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.push("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <HugeiconsIcon icon={StethoscopeIcon} className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your Doctor account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@clinic.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            leftIcon={Mail01Icon}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            leftIcon={LockPasswordIcon}
          />

          <div className="flex items-center justify-between">
            <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
            <Link href="/doctor/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-xs font-semibold text-error-600 bg-error-50 border border-error-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-neutral-400 font-medium">or</span>
          </div>
        </div>

        <p className="text-sm text-neutral-500 text-center">
          New to Zocare?{" "}
          <Link href="/doctor/signup" className="text-primary-600 hover:underline font-medium">Create an account</Link>
        </p>

        <p className="text-xs text-neutral-400 text-center mt-6">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
