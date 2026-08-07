# zocare — OPD clinic portal

Next.js 16 App Router + Supabase (serverless Postgres + Supabase Auth).
Two portals: `/doctor/*` and `/receptionist/*`.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` redirects to the reception login.

## Demo accounts

These are the only two accounts in the system:

| Portal       | Email              | Password    |
| ------------ | ------------------ | ----------- |
| Doctor       | `doctor@gmail.com` | `doctor123` |
| Receptionist | `harsh@gmail.com`  | `harsh123`  |

Google sign-in is stubbed as *Coming soon* on both login screens.

## Database setup

Supabase is serverless Postgres — nothing to host. In the Supabase Dashboard →
**SQL Editor** → New query, run these in order (both are safe to re-run):

1. `supabase/schema.sql` — tables, indexes, `updated_at` triggers, auto-generated
   `patient_id` / `prescription_no` / `invoice_no`, and RLS policies that only
   let signed-in users read or write.
2. `supabase/seed.sql` — the two staff accounts plus demo patients,
   appointments, today's queue, prescriptions and invoices.

The two Supabase Auth users already exist in this project. To (re)create them —
for a fresh project, or to reset the passwords:

```bash
node --env-file=.env.local scripts/create-auth-users.mjs
```

It prints the auth UUIDs; paste them into the `auth_user_id` columns at the top
of `supabase/seed.sql` and re-run that file.

## How auth works

- `lib/auth.ts` — `signIn` / `signOut` / `getCurrentStaff`. Sign-in goes through
  Supabase Auth (`signInWithPassword`), then resolves the matching `doctors` or
  `receptionists` row via `auth_user_id`.
- `proxy.ts` (Next 16 renamed Middleware to Proxy) refreshes the session cookie
  on every request, bounces signed-out visitors to the right login page, and
  keeps each role inside its own portal.
- `lib/supabase/client.ts` (browser), `server.ts` (Server Components/Actions),
  `admin.ts` (secret key, server-only).

## Environment

`.env.local` holds the Supabase URL, publishable key and secret key. The secret
key is server-only — never import `lib/supabase/admin.ts` from a client
component.
