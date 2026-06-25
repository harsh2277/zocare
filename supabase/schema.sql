-- ============================================================================
-- zocare OPD — initial database schema
-- ============================================================================
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste this ->
-- Run. Safe to re-run (everything is "if not exists" / "create or replace").
--
-- Scope of this file: the two staff entities only -> doctors and receptionists.
-- Patients and appointments are intentionally left for a later step.
--
-- gen_random_uuid() is built into Supabase's Postgres, so no extension is needed.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Helper: keep `updated_at` fresh automatically on every UPDATE
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- doctors
-- ----------------------------------------------------------------------------
create table if not exists public.doctors (
  id              uuid primary key default gen_random_uuid(),
  -- Future login hook: link to a Supabase Auth user once auth is added.
  -- Nullable and unused for now. `on delete set null` keeps the doctor row if
  -- the auth user is ever deleted.
  auth_user_id    uuid references auth.users (id) on delete set null,
  full_name       text not null,
  email           text unique,
  phone           text,
  specialization  text,
  registration_no text unique,            -- medical council / license number
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists doctors_auth_user_id_idx
  on public.doctors (auth_user_id);

drop trigger if exists doctors_set_updated_at on public.doctors;
create trigger doctors_set_updated_at
  before update on public.doctors
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- receptionists
-- ----------------------------------------------------------------------------
create table if not exists public.receptionists (
  id           uuid primary key default gen_random_uuid(),
  -- Future login hook (see note on doctors.auth_user_id above).
  auth_user_id uuid references auth.users (id) on delete set null,
  full_name    text not null,
  email        text unique,
  phone        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists receptionists_auth_user_id_idx
  on public.receptionists (auth_user_id);

drop trigger if exists receptionists_set_updated_at on public.receptionists;
create trigger receptionists_set_updated_at
  before update on public.receptionists
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------------------
-- RLS is turned ON (best practice — keep it on). The policies below are
-- DEV-ONLY and PERMISSIVE: they let the public publishable/anon key do anything.
--
--  ⚠️  REPLACE THESE BEFORE PRODUCTION / as soon as you add Supabase Auth.
--      The publishable key ships to the browser, so "allow all" means anyone
--      can read and write staff data. Once auth exists, scope these policies to
--      authenticated staff (this is what the `auth_user_id` columns are for).
-- ----------------------------------------------------------------------------
alter table public.doctors       enable row level security;
alter table public.receptionists enable row level security;

drop policy if exists "dev: doctors full access" on public.doctors;
create policy "dev: doctors full access"
  on public.doctors
  for all
  using (true)
  with check (true);

drop policy if exists "dev: receptionists full access" on public.receptionists;
create policy "dev: receptionists full access"
  on public.receptionists
  for all
  using (true)
  with check (true);
