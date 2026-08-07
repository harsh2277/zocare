/**
 * Deletes ALL ROWS from the clinical/transactional tables while leaving the
 * `doctors` and `receptionists` tables (and their table structure) untouched.
 * Deleted in FK-dependency order so cascades don't fight the script:
 *   billing_invoice_items -> billing_invoices -> prescription_items ->
 *   prescriptions -> queue_entries -> appointments -> patients
 *
 *   node --env-file=.env.local scripts/wipe-clinical-data.mjs
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

const TABLES_IN_ORDER = [
  "billing_invoice_items",
  "billing_invoices",
  "prescription_items",
  "prescriptions",
  "queue_entries",
  "appointments",
  "patients",
];

for (const table of TABLES_IN_ORDER) {
  const deleted = await rest(`/${table}?id=not.is.null`, { method: "DELETE" });
  console.log(`${table}: deleted ${Array.isArray(deleted) ? deleted.length : 0} rows`);
}

console.log("\nDone. doctors and receptionists were not touched.");
