-- ============================================================================
-- zocare OPD — seed data
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor
-- Safe to re-run.
-- ============================================================================
--
-- LOGIN CREDENTIALS (the ONLY two accounts in the system for now):
--   Doctor        doctor@gmail.com / doctor123
--   Receptionist  harsh@gmail.com  / harsh123
--
-- Those two accounts live in Supabase Auth (auth.users) and are linked to the
-- staff rows below through `auth_user_id`. The auth accounts already exist in
-- this project; this file only links the profile rows to them. If you ever
-- recreate the project, run `node scripts/create-auth-users.mjs` first and
-- paste the new UUIDs below.
--
-- UUID key:
--   doctors:       d1000000-...
--   receptionists: e1000000-...   (r is not valid hex)
--   patients:      f1000000-...   (p is not valid hex)
--   appointments:  a1000000-...
--   queue_entries: c1000000-...   (q is not valid hex)
--   billing:       b1000000-...

-- ----------------------------------------------------------------------------
-- Staff — exactly two accounts
-- ----------------------------------------------------------------------------
INSERT INTO public.doctors (id, auth_user_id, full_name, email, phone, specialization, registration_no, is_active)
VALUES
  ('d1000000-0000-0000-0000-000000000001',
   '38c68b67-b8cd-41ee-9e75-6aac877dcd77',
   'Dr. Doctor', 'doctor@gmail.com', '+91 98765 00001', 'Cardiologist', 'MH-DR001', true)
ON CONFLICT (id) DO UPDATE
  SET auth_user_id    = excluded.auth_user_id,
      full_name       = excluded.full_name,
      email           = excluded.email,
      phone           = excluded.phone,
      specialization  = excluded.specialization,
      registration_no = excluded.registration_no,
      is_active       = true;

INSERT INTO public.receptionists (id, auth_user_id, full_name, email, phone, is_active)
VALUES
  ('e1000000-0000-0000-0000-000000000001',
   '0b4a61bb-e24a-4b64-85ab-7d5cf6a065d0',
   'Harsh', 'harsh@gmail.com', '+91 98765 00010', true)
ON CONFLICT (id) DO UPDATE
  SET auth_user_id = excluded.auth_user_id,
      full_name    = excluded.full_name,
      email        = excluded.email,
      phone        = excluded.phone,
      is_active    = true;

-- Unified `users` table mirrors the same two staff accounts.
INSERT INTO public.users (id, auth_user_id, full_name, email, phone, role, specialization, registration_no, is_active)
VALUES
  ('d1000000-0000-0000-0000-000000000001', '38c68b67-b8cd-41ee-9e75-6aac877dcd77',
   'Dr. Doctor', 'doctor@gmail.com', '+91 98765 00001', 'doctor', 'Cardiologist', 'MH-DR001', true),
  ('e1000000-0000-0000-0000-000000000001', '0b4a61bb-e24a-4b64-85ab-7d5cf6a065d0',
   'Harsh', 'harsh@gmail.com', '+91 98765 00010', 'receptionist', null, null, true)
ON CONFLICT (id) DO UPDATE
  SET auth_user_id = excluded.auth_user_id,
      full_name    = excluded.full_name,
      email        = excluded.email,
      role         = excluded.role,
      is_active    = true;

-- Remove staff left over from an earlier seed — only the two above may exist.
DELETE FROM public.doctors       WHERE id <> 'd1000000-0000-0000-0000-000000000001';
DELETE FROM public.receptionists WHERE id <> 'e1000000-0000-0000-0000-000000000001';
DELETE FROM public.users
  WHERE role IN ('doctor', 'receptionist', 'admin')
    AND id NOT IN ('d1000000-0000-0000-0000-000000000001',
                   'e1000000-0000-0000-0000-000000000001');

-- ----------------------------------------------------------------------------
-- patients (9 records) — patient_id auto-generated as ZC-0001..ZC-0009
-- ----------------------------------------------------------------------------
INSERT INTO public.patients (id, full_name, date_of_birth, gender, blood_group, phone, email, address, allergies, is_active)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Ahmed Khan',    '1979-03-15', 'male',   'A+',  '+91 90000 10001', 'ahmed.khan@email.com',    'House 12, Gulberg, Lahore',        'Penicillin,Sulfa',  true),
  ('f1000000-0000-0000-0000-000000000002', 'Zainab Bibi',   '1997-07-22', 'female', 'B-',  '+91 90000 10002', 'zainab.bibi@email.com',   'Flat 3B, Defence, Karachi',        'Latex',             true),
  ('f1000000-0000-0000-0000-000000000003', 'Muhammad Ali',  '2013-11-05', 'male',   'O+',  '+91 90000 10003', 'muhammad.ali@email.com',  'Street 7, Saddar, Rawalpindi',     null,                true),
  ('f1000000-0000-0000-0000-000000000004', 'Fatima Noor',   '1996-01-30', 'female', 'AB+', '+91 90000 10004', 'fatima.noor@email.com',   'Plot 45, Johar Town, Lahore',      'Aspirin,Ibuprofen', true),
  ('f1000000-0000-0000-0000-000000000005', 'Omar Farooq',   '1987-09-18', 'male',   'A-',  '+91 90000 10005', 'omar.farooq@email.com',   'House 88, F-8, Islamabad',         null,                true),
  ('f1000000-0000-0000-0000-000000000006', 'Aisha Lee',     '1994-05-12', 'female', 'O-',  '+91 90000 10006', 'aisha.lee@email.com',     'Apartment 9, Clifton, Karachi',    'Codeine',           true),
  ('f1000000-0000-0000-0000-000000000007', 'Kamran Baig',   '1973-12-08', 'male',   'B+',  '+91 90000 10007', 'kamran.baig@email.com',   'House 21, Model Town, Lahore',     null,                true),
  ('f1000000-0000-0000-0000-000000000008', 'Maria Sanchez', '2000-04-25', 'female', 'A+',  '+91 90000 10008', 'maria.sanchez@email.com', 'Flat 12, Bahria Town, Rawalpindi', 'Peanuts,Shellfish', true),
  ('f1000000-0000-0000-0000-000000000009', 'Ramesh Jha',    '1983-08-14', 'male',   'O+',  '+91 90000 10009', 'ramesh.jha@email.com',    'House 5, G-9, Islamabad',          null,                true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- appointments — today (current_date), all under the single seeded doctor
-- ----------------------------------------------------------------------------
INSERT INTO public.appointments (id, patient_id, doctor_id, receptionist_id, appointment_date, appointment_time, type, status, chief_complaint)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '09:00', 'follow_up',    'completed',   'Routine cardiac follow-up'),
  ('a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '09:30', 'consultation', 'completed',   'Fever and cough since 3 days'),
  ('a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '10:00', 'consultation', 'in_progress', 'Chest pain'),
  ('a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '10:30', 'emergency',    'checked_in',  'Severe abdominal pain'),
  ('a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '11:00', 'consultation', 'scheduled',   'Skin rash and itching'),
  ('a1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '11:30', 'consultation', 'scheduled',   'Knee pain after accident'),
  ('a1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '12:00', 'follow_up',    'scheduled',   'Post-surgery review'),
  ('a1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '12:30', 'consultation', 'scheduled',   'Chest tightness'),
  ('a1000000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', current_date, '13:00', 'consultation', 'scheduled',   'Shortness of breath')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- queue_entries — today's live queue
-- ----------------------------------------------------------------------------
INSERT INTO public.queue_entries (id, appointment_id, patient_id, doctor_id, queue_date, token_number, status, checked_in_at, notes)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', current_date, 1, 'completed',   now() - interval '2 hours',    'Follow-up visit'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', current_date, 2, 'completed',   now() - interval '90 minutes', 'New patient'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', current_date, 3, 'in_progress', now() - interval '8 minutes',  'Chest pain evaluation'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', current_date, 4, 'waiting',     now() - interval '34 minutes', 'Emergency — abdominal pain'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', current_date, 5, 'waiting',     now() - interval '22 minutes', 'Skin consultation'),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', current_date, 6, 'waiting',     now() - interval '15 minutes', 'Knee pain'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000001', current_date, 7, 'waiting',     now() - interval '18 minutes', 'Post-surgery check'),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000001', current_date, 8, 'waiting',     now() - interval '5 minutes',  'Cardiac symptoms')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- prescriptions — two completed consultations with medicines
-- ----------------------------------------------------------------------------
INSERT INTO public.prescriptions (id, patient_id, doctor_id, appointment_id, diagnosis, chief_complaint, notes, follow_up_date, status)
VALUES
  ('11000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Stable angina', 'Routine cardiac follow-up', 'Continue low-salt diet, 30 min walk daily.', current_date + 30, 'active'),
  ('11000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
   'Acute viral pharyngitis', 'Fever and cough since 3 days', 'Plenty of fluids and rest.', current_date + 7, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, route, instructions, quantity, sort_order)
VALUES
  ('12000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Aspirin',      '75mg',  'once daily',  '30 days', 'oral', 'After breakfast',      30, 0),
  ('12000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'Atorvastatin', '20mg',  'once daily',  '30 days', 'oral', 'At bedtime',           30, 1),
  ('12000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'Paracetamol',  '500mg', 'twice daily', '5 days',  'oral', 'After meals',          10, 0),
  ('12000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002', 'Cetirizine',   '10mg',  'once daily',  '5 days',  'oral', 'May cause drowsiness',  5, 1)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- billing_invoices — sample invoices
-- ----------------------------------------------------------------------------
INSERT INTO public.billing_invoices (id, patient_id, doctor_id, appointment_id, subtotal, tax, total, paid_amount, payment_method, status, issued_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 500, 0, 600, 600, 'cash',      'paid',   now() - interval '2 hours'),
  ('b1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 600, 0, 700, 700, 'card',      'paid',   now() - interval '90 minutes'),
  ('b1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 800, 0, 900, 0,   'insurance', 'issued', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.billing_invoice_items (id, invoice_id, description, category, quantity, unit_price, total_price, sort_order)
VALUES
  ('13000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Cardiology follow-up consultation', 'consultation', 1, 500, 500, 0),
  ('13000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'ECG',                                'procedure',    1, 100, 100, 1),
  ('13000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'General consultation',               'consultation', 1, 600, 600, 0),
  ('13000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Rapid antigen test',                 'lab',          1, 100, 100, 1),
  ('13000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Emergency consultation',             'consultation', 1, 800, 800, 0),
  ('13000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'Abdominal ultrasound',               'procedure',    1, 100, 100, 1)
ON CONFLICT (id) DO NOTHING;
