"use client";

import { createClient } from "@/lib/supabase/client";

export type StaffRole = "doctor" | "receptionist";

export type StaffProfile = {
  id: string;
  full_name: string;
  email: string | null;
  specialization?: string | null;
};

const STORAGE_KEYS = [
  "doctor_id",
  "doctor_name",
  "doctor_specialization",
  "receptionist_id",
  "receptionist_name",
  "active_consultation_id",
];

const TABLE: Record<StaffRole, "doctors" | "receptionists"> = {
  doctor: "doctors",
  receptionist: "receptionists",
};

/**
 * Loads the clinic profile row (doctors / receptionists) linked to an auth user
 * and mirrors it into localStorage, which is where the portal pages read the
 * current staff id from.
 */
async function loadProfile(role: StaffRole, authUserId: string, email: string) {
  const supabase = createClient();
  const columns = role === "doctor" ? "id, full_name, email, specialization" : "id, full_name, email";

  // Prefer the auth link; fall back to email so a profile seeded without
  // `auth_user_id` still resolves.
  const byAuth = await (supabase
    .from(TABLE[role])
    .select(columns)
    .eq("auth_user_id", authUserId)
    .maybeSingle() as any);

  let profile = byAuth.data as StaffProfile | null;

  if (!profile) {
    const byEmail = await (supabase
      .from(TABLE[role])
      .select(columns)
      .eq("email", email)
      .maybeSingle() as any);
    profile = byEmail.data as StaffProfile | null;
  }

  if (!profile) return null;

  if (role === "doctor") {
    localStorage.setItem("doctor_id", profile.id);
    localStorage.setItem("doctor_name", profile.full_name);
    localStorage.setItem("doctor_specialization", profile.specialization || "General Practice");
  } else {
    localStorage.setItem("receptionist_id", profile.id);
    localStorage.setItem("receptionist_name", profile.full_name);
  }

  return profile;
}

/** Email + password sign-in against Supabase Auth. Throws with a UI-ready message. */
export async function signIn(role: StaffRole, email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.user) {
    throw new Error("Incorrect email or password.");
  }

  const userRole = data.user.user_metadata?.role as StaffRole | undefined;
  if (userRole && userRole !== role) {
    await supabase.auth.signOut();
    throw new Error(
      role === "doctor"
        ? "This account is a receptionist account. Use the reception portal."
        : "This account is a doctor account. Use the doctor portal.",
    );
  }

  const profile = await loadProfile(role, data.user.id, data.user.email ?? "");
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error(
      `Signed in, but no ${role} record exists in the clinic database. Run supabase/seed.sql.`,
    );
  }

  return profile;
}

/**
 * Returns the profile for the current session, refreshing localStorage.
 * `null` means "not signed in as this role" — callers redirect to the login page.
 */
export async function getCurrentStaff(role: StaffRole) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const userRole = data.user.user_metadata?.role as StaffRole | undefined;
  if (userRole && userRole !== role) return null;

  return loadProfile(role, data.user.id, data.user.email ?? "");
}

/** Ends the Supabase session and clears every cached staff value. */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
