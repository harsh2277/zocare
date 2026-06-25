"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, LockPasswordIcon, ArrowLeft02Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

export default function DoctorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl  p-8 relative">
        <Link href="/doctor/signin" className="absolute top-6 left-6 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors">
          <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
        </Link>

        <div className="flex flex-col items-center mb-6 mt-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${sent ? "bg-success-50" : "bg-primary-50"}`}>
            <HugeiconsIcon icon={sent ? CheckmarkCircle01Icon : LockPasswordIcon} className={`w-7 h-7 ${sent ? "text-success-600" : "text-primary-600"}`} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-1">
            {sent ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="text-sm text-neutral-500 text-center">
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              leftIcon={Mail01Icon}
            />
            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading} disabled={!email}>
              Send reset link
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-sm text-success-700 text-center">
              Reset link sent successfully. Please check your inbox.
            </div>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={async () => {
                setLoading(true);
                await new Promise((r) => setTimeout(r, 1500));
                setLoading(false);
              }}
              loading={loading}
            >
              Resend link
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/doctor/signin" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
