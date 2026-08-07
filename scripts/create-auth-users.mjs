/**
 * Creates (or re-creates) the two demo Supabase Auth accounts.
 *
 *   node --env-file=.env.local scripts/create-auth-users.mjs
 *
 * Prints the resulting auth UUIDs — paste them into `supabase/seed.sql` so the
 * `doctors` / `receptionists` rows link to the right auth user.
 *
 * Uses the SECRET key, so this must only ever run on your machine / a server.
 */

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local");
  process.exit(1);
}

const ACCOUNTS = [
  { email: "doctor@gmail.com", password: "doctor123", full_name: "Dr. Doctor", role: "doctor" },
  { email: "harsh@gmail.com", password: "harsh123", full_name: "Harsh", role: "receptionist" },
];

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

async function admin(path, init) {
  const res = await fetch(`${url}/auth/v1/admin${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  return body;
}

// Anything not in ACCOUNTS gets removed — the brief is "only these two users".
const existing = await admin("/users?per_page=200", { method: "GET" });
const wanted = new Set(ACCOUNTS.map((a) => a.email));

for (const user of existing.users ?? []) {
  if (!wanted.has(user.email)) {
    await admin(`/users/${user.id}`, { method: "DELETE" });
    console.log(`deleted  ${user.email}`);
  }
}

for (const account of ACCOUNTS) {
  const found = (existing.users ?? []).find((u) => u.email === account.email);
  const payload = {
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.full_name, role: account.role },
  };

  const user = found
    ? await admin(`/users/${found.id}`, { method: "PUT", body: JSON.stringify(payload) })
    : await admin("/users", { method: "POST", body: JSON.stringify(payload) });

  console.log(`${found ? "updated" : "created"}  ${user.email}  ->  ${user.id}`);
}

console.log("\nPaste the UUIDs above into supabase/seed.sql (auth_user_id columns).");
