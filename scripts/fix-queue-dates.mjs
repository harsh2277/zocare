/**
 * One-off fix: seed.sql's `current_date` gets frozen to whenever the seed
 * script last ran, so `queue_entries.queue_date` (and the linked
 * `appointments.appointment_date`) drift stale and today's queue/dashboard
 * pages show nothing. This shifts every queue_entries row dated on the
 * original seed day forward to today, and nudges the matching appointments
 * along with it, so the demo data is live again.
 *
 *   node --env-file=.env.local scripts/fix-queue-dates.mjs
 *
 * Uses the SECRET key — run locally only.
 */

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local");
  process.exit(1);
}

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function rest(path, init) {
  const res = await fetch(`${url}/rest/v1${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  return body;
}

const today = new Date().toISOString().split("T")[0];

const entries = await rest("/queue_entries?select=id,queue_date,appointment_id&order=queue_date.desc", { method: "GET" });
console.log(`found ${entries.length} queue_entries rows`);

const staleEntries = entries.filter((e) => e.queue_date !== today);
if (staleEntries.length === 0) {
  console.log("all queue_entries already dated today — nothing to do.");
} else {
  const ids = staleEntries.map((e) => e.id);
  await rest(`/queue_entries?id=in.(${ids.join(",")})`, {
    method: "PATCH",
    body: JSON.stringify({ queue_date: today }),
  });
  console.log(`updated ${ids.length} queue_entries -> queue_date=${today}`);

  const appointmentIds = staleEntries.map((e) => e.appointment_id).filter(Boolean);
  if (appointmentIds.length > 0) {
    await rest(`/appointments?id=in.(${appointmentIds.join(",")})`, {
      method: "PATCH",
      body: JSON.stringify({ appointment_date: today }),
    });
    console.log(`updated ${appointmentIds.length} appointments -> appointment_date=${today}`);
  }
}
