-- ============================================================================
-- zocare OPD — seed data
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- ============================================================================

-- UUID key:
--   doctors:       d1000000-...
--   receptionists: e1000000-...   (r is not valid hex)
--   patients:      f1000000-...   (p is not valid hex)
--   appointments:  a1000000-...
--   queue_entries: c1000000-...   (q is not valid hex)
--   billing:       b1000000-...

-- ----------------------------------------------------------------------------
-- doctors (7 records)
-- ----------------------------------------------------------------------------
INSERT INTO public.doctors (id, full_name, email, phone, specialization, registration_no, is_active)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Dr. Sarah Ahmed',    'sarah.ahmed@zocare.health',    '+91 98765 00001', 'Cardiologist',  'MH-SA001', true),
  ('d1000000-0000-0000-0000-000000000002', 'Dr. Faisal Qureshi', 'faisal.qureshi@zocare.health', '+91 98765 00002', 'Pediatrician',  'MH-FQ002', true),
  ('d1000000-0000-0000-0000-000000000003', 'Dr. Haris Ali',      'haris.ali@zocare.health',      '+91 98765 00003', 'Dermatologist', 'MH-HA003', true),
  ('d1000000-0000-0000-0000-000000000004', 'Dr. Mehreen Shah',   'mehreen.shah@zocare.health',   '+91 98765 00004', 'Gynecologist',  'MH-MS004', true),
  ('d1000000-0000-0000-0000-000000000005', 'Dr. Aisha Lee',      'aisha.lee@zocare.health',      '+91 98765 00005', 'Dermatologist', 'MH-AL005', true),
  ('d1000000-0000-0000-0000-000000000006', 'Dr. Kamran Baig',    'kamran.baig@zocare.health',    '+91 98765 00006', 'Orthopedic',    'MH-KB006', true),
  ('d1000000-0000-0000-0000-000000000007', 'Dr. Maria Sanchez',  'maria.sanchez@zocare.health',  '+91 98765 00007', 'Cardiologist',  'MH-MC007', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- receptionists (1 record)
-- ----------------------------------------------------------------------------
INSERT INTO public.receptionists (id, full_name, email, phone, is_active)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Mary Joseph', 'mary.joseph@zocare.health', '+91 98765 00010', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- patients (9 records) — patient_id auto-generated as ZC-0001..ZC-0009
-- ----------------------------------------------------------------------------
INSERT INTO public.patients (id, full_name, date_of_birth, gender, blood_group, phone, email, address, allergies, is_active)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Ahmed Khan',    '1979-03-15', 'male',   'A+',  '+92 300 1234567', 'ahmed.khan@email.com',    'House 12, Gulberg, Lahore',        'Penicillin,Sulfa',  true),
  ('f1000000-0000-0000-0000-000000000002', 'Zainab Bibi',   '1997-07-22', 'female', 'B-',  '+92 321 9876543', 'zainab.bibi@email.com',   'Flat 3B, Defence, Karachi',        'Latex',             true),
  ('f1000000-0000-0000-0000-000000000003', 'Muhammad Ali',  '2013-11-05', 'male',   'O+',  '+92 333 1112223', 'muhammad.ali@email.com',  'Street 7, Saddar, Rawalpindi',     null,                true),
  ('f1000000-0000-0000-0000-000000000004', 'Fatima Noor',   '1996-01-30', 'female', 'AB+', '+92 302 5551234', 'fatima.noor@email.com',   'Plot 45, Johar Town, Lahore',      'Aspirin,Ibuprofen', true),
  ('f1000000-0000-0000-0000-000000000005', 'Omar Farooq',   '1987-09-18', 'male',   'A-',  '+92 312 7778889', 'omar.farooq@email.com',   'House 88, F-8, Islamabad',         null,                true),
  ('f1000000-0000-0000-0000-000000000006', 'Aisha Lee',     '1994-05-12', 'female', 'O-',  '+92 345 9990001', 'aisha.lee@email.com',     'Apartment 9, Clifton, Karachi',    'Codeine',           true),
  ('f1000000-0000-0000-0000-000000000007', 'Kamran Baig',   '1973-12-08', 'male',   'B+',  '+92 301 4445556', 'kamran.baig@email.com',   'House 21, Model Town, Lahore',     null,                true),
  ('f1000000-0000-0000-0000-000000000008', 'Maria Sanchez', '2000-04-25', 'female', 'A+',  '+92 304 6667778', 'maria.sanchez@email.com', 'Flat 12, Bahria Town, Rawalpindi', 'Peanuts,Shellfish', true),
  ('f1000000-0000-0000-0000-000000000009', 'Ramesh Jha',    '1983-08-14', 'male',   'O+',  '+92 305 8889990', 'ramesh.jha@email.com',    'House 5, G-9, Islamabad',          null,                true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- appointments — today's date (current_date)
-- ----------------------------------------------------------------------------
INSERT INTO public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, type, status, chief_complaint)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', current_date, '09:00', 'follow_up',    'completed',   'Routine cardiac follow-up'),
  ('a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', current_date, '09:30', 'consultation', 'completed',   'Fever and cough since 3 days'),
  ('a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', current_date, '10:00', 'consultation', 'in_progress', 'Chest pain'),
  ('a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', current_date, '10:30', 'emergency',    'checked_in',  'Severe abdominal pain'),
  ('a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', current_date, '11:00', 'consultation', 'scheduled',   'Skin rash and itching'),
  ('a1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', current_date, '11:30', 'consultation', 'scheduled',   'Knee pain after accident'),
  ('a1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000006', current_date, '12:00', 'follow_up',    'scheduled',   'Post-surgery review'),
  ('a1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000007', current_date, '12:30', 'consultation', 'scheduled',   'Chest tightness'),
  ('a1000000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000001', current_date, '13:00', 'consultation', 'scheduled',   'Shortness of breath')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- queue_entries — today's live queue
-- ----------------------------------------------------------------------------
INSERT INTO public.queue_entries (id, appointment_id, patient_id, doctor_id, queue_date, token_number, status, checked_in_at, notes)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', current_date, 1, 'completed',   now() - interval '2 hours',    'Follow-up visit'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', current_date, 2, 'completed',   now() - interval '90 minutes', 'New patient'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', current_date, 3, 'in_progress', now() - interval '8 minutes',  'Chest pain evaluation'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', current_date, 4, 'waiting',     now() - interval '34 minutes', 'Emergency — abdominal pain'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', current_date, 5, 'waiting',     now() - interval '22 minutes', 'Skin consultation'),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', current_date, 6, 'waiting',     now() - interval '15 minutes', 'Knee pain'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000006', current_date, 7, 'in_progress', now() - interval '18 minutes', 'Post-surgery check'),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000007', current_date, 8, 'waiting',     now() - interval '5 minutes',  'Cardiac symptoms')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- billing_invoices — sample invoices
-- ----------------------------------------------------------------------------
INSERT INTO public.billing_invoices (id, patient_id, doctor_id, appointment_id, subtotal, tax, total, paid_amount, payment_method, status, issued_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 500, 0, 600, 600, 'cash',      'paid',   now() - interval '2 hours'),
  ('b1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 600, 0, 700, 700, 'card',      'paid',   now() - interval '90 minutes'),
  ('b1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 800, 0, 900, 0,   'insurance', 'issued', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;
