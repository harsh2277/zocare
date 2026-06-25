-- ============================================================================
-- zocare OPD — full database schema
-- ============================================================================
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste this ->
-- Run. Safe to re-run (everything is "if not exists" / "create or replace").
--
-- Supabase is serverless Postgres — no server to manage. All tables use:
--   • gen_random_uuid() — built-in, no extension needed
--   • RLS enabled on every table (dev-only permissive policies for now)
--   • auto-updated `updated_at` via trigger
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
  auth_user_id    uuid references auth.users (id) on delete set null,
  full_name       text not null,
  email           text unique,
  phone           text,
  specialization  text,
  registration_no text unique,
  avatar_url      text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists doctors_auth_user_id_idx on public.doctors (auth_user_id);

drop trigger if exists doctors_set_updated_at on public.doctors;
create trigger doctors_set_updated_at
  before update on public.doctors
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- receptionists
-- ----------------------------------------------------------------------------
create table if not exists public.receptionists (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null,
  full_name    text not null,
  email        text unique,
  phone        text,
  avatar_url   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists receptionists_auth_user_id_idx on public.receptionists (auth_user_id);

drop trigger if exists receptionists_set_updated_at on public.receptionists;
create trigger receptionists_set_updated_at
  before update on public.receptionists
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- patients
-- ----------------------------------------------------------------------------
create table if not exists public.patients (
  id             uuid primary key default gen_random_uuid(),
  patient_id     text unique not null,   -- human-readable e.g. ZC-0001
  full_name      text not null,
  date_of_birth  date,
  gender         text check (gender in ('male', 'female', 'other')),
  blood_group    text,
  phone          text,
  email          text,
  address        text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  allergies      text,
  notes          text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists patients_patient_id_idx on public.patients (patient_id);
create index if not exists patients_full_name_idx on public.patients using gin (to_tsvector('english', full_name));

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- Auto-generate human-readable patient_id
create or replace function public.generate_patient_id()
returns trigger
language plpgsql
as $$
declare
  next_seq int;
begin
  select coalesce(max(cast(substring(patient_id from 4) as int)), 0) + 1
    into next_seq
    from public.patients;
  new.patient_id = 'ZC-' || lpad(next_seq::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists patients_generate_id on public.patients;
create trigger patients_generate_id
  before insert on public.patients
  for each row execute function public.generate_patient_id();


-- ----------------------------------------------------------------------------
-- appointments
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients (id) on delete cascade,
  doctor_id       uuid not null references public.doctors (id) on delete cascade,
  receptionist_id uuid references public.receptionists (id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  type            text not null default 'consultation'
                    check (type in ('consultation', 'follow_up', 'emergency', 'procedure')),
  status          text not null default 'scheduled'
                    check (status in ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show')),
  chief_complaint text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists appointments_patient_id_idx on public.appointments (patient_id);
create index if not exists appointments_doctor_id_idx on public.appointments (doctor_id);
create index if not exists appointments_date_idx on public.appointments (appointment_date);

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- queue_entries (OPD live queue)
-- ----------------------------------------------------------------------------
create table if not exists public.queue_entries (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references public.appointments (id) on delete set null,
  patient_id      uuid not null references public.patients (id) on delete cascade,
  doctor_id       uuid not null references public.doctors (id) on delete cascade,
  queue_date      date not null default current_date,
  token_number    int not null,
  status          text not null default 'waiting'
                    check (status in ('waiting', 'called', 'in_progress', 'completed', 'skipped')),
  checked_in_at   timestamptz default now(),
  called_at       timestamptz,
  completed_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (doctor_id, queue_date, token_number)
);

create index if not exists queue_patient_id_idx on public.queue_entries (patient_id);
create index if not exists queue_doctor_date_idx on public.queue_entries (doctor_id, queue_date);

drop trigger if exists queue_set_updated_at on public.queue_entries;
create trigger queue_set_updated_at
  before update on public.queue_entries
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- prescriptions
-- ----------------------------------------------------------------------------
create table if not exists public.prescriptions (
  id              uuid primary key default gen_random_uuid(),
  prescription_no text unique not null,
  patient_id      uuid not null references public.patients (id) on delete cascade,
  doctor_id       uuid not null references public.doctors (id) on delete cascade,
  appointment_id  uuid references public.appointments (id) on delete set null,
  diagnosis       text,
  chief_complaint text,
  notes           text,
  follow_up_date  date,
  status          text not null default 'active'
                    check (status in ('active', 'completed', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists prescriptions_patient_id_idx on public.prescriptions (patient_id);
create index if not exists prescriptions_doctor_id_idx on public.prescriptions (doctor_id);

drop trigger if exists prescriptions_set_updated_at on public.prescriptions;
create trigger prescriptions_set_updated_at
  before update on public.prescriptions
  for each row execute function public.set_updated_at();

-- Auto-generate prescription number
create or replace function public.generate_prescription_no()
returns trigger
language plpgsql
as $$
declare
  next_seq int;
begin
  select coalesce(max(cast(substring(prescription_no from 4) as int)), 0) + 1
    into next_seq
    from public.prescriptions;
  new.prescription_no = 'RX-' || lpad(next_seq::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists prescriptions_generate_no on public.prescriptions;
create trigger prescriptions_generate_no
  before insert on public.prescriptions
  for each row execute function public.generate_prescription_no();


-- ----------------------------------------------------------------------------
-- prescription_items
-- ----------------------------------------------------------------------------
create table if not exists public.prescription_items (
  id              uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions (id) on delete cascade,
  medicine_name   text not null,
  dosage          text not null,          -- e.g. "500mg"
  frequency       text not null,          -- e.g. "twice daily"
  duration        text not null,          -- e.g. "7 days"
  route           text default 'oral'     -- oral, topical, injection, etc.
                    check (route in ('oral', 'topical', 'injection', 'inhaled', 'sublingual', 'other')),
  instructions    text,
  quantity        int,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists prescription_items_prescription_id_idx
  on public.prescription_items (prescription_id);


-- ----------------------------------------------------------------------------
-- billing_invoices
-- ----------------------------------------------------------------------------
create table if not exists public.billing_invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_no      text unique not null,
  patient_id      uuid not null references public.patients (id) on delete cascade,
  doctor_id       uuid references public.doctors (id) on delete set null,
  appointment_id  uuid references public.appointments (id) on delete set null,
  subtotal        numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  tax             numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  paid_amount     numeric(10,2) not null default 0,
  payment_method  text check (payment_method in ('cash', 'card', 'upi', 'insurance', 'other')),
  status          text not null default 'draft'
                    check (status in ('draft', 'issued', 'paid', 'partial', 'cancelled', 'refunded')),
  notes           text,
  issued_at       timestamptz,
  due_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists invoices_patient_id_idx on public.billing_invoices (patient_id);
create index if not exists invoices_doctor_id_idx on public.billing_invoices (doctor_id);

drop trigger if exists invoices_set_updated_at on public.billing_invoices;
create trigger invoices_set_updated_at
  before update on public.billing_invoices
  for each row execute function public.set_updated_at();

-- Auto-generate invoice number
create or replace function public.generate_invoice_no()
returns trigger
language plpgsql
as $$
declare
  next_seq int;
begin
  select coalesce(max(cast(substring(invoice_no from 5) as int)), 0) + 1
    into next_seq
    from public.billing_invoices;
  new.invoice_no = 'INV-' || lpad(next_seq::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists invoices_generate_no on public.billing_invoices;
create trigger invoices_generate_no
  before insert on public.billing_invoices
  for each row execute function public.generate_invoice_no();


-- ----------------------------------------------------------------------------
-- billing_invoice_items
-- ----------------------------------------------------------------------------
create table if not exists public.billing_invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.billing_invoices (id) on delete cascade,
  description text not null,
  category    text default 'service'
                check (category in ('consultation', 'procedure', 'medicine', 'lab', 'service', 'other')),
  quantity    int not null default 1,
  unit_price  numeric(10,2) not null,
  total_price numeric(10,2) not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists invoice_items_invoice_id_idx on public.billing_invoice_items (invoice_id);


-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ⚠️  DEV-ONLY permissive policies — replace before production
-- ----------------------------------------------------------------------------
alter table public.patients          enable row level security;
alter table public.appointments      enable row level security;
alter table public.queue_entries     enable row level security;
alter table public.prescriptions     enable row level security;
alter table public.prescription_items enable row level security;
alter table public.billing_invoices  enable row level security;
alter table public.billing_invoice_items enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'doctors', 'receptionists', 'patients', 'appointments',
    'queue_entries', 'prescriptions', 'prescription_items',
    'billing_invoices', 'billing_invoice_items'
  ] loop
    execute format('
      drop policy if exists "dev: %1$s full access" on public.%1$s;
      create policy "dev: %1$s full access"
        on public.%1$s for all using (true) with check (true);
    ', tbl);
  end loop;
end;
$$;
