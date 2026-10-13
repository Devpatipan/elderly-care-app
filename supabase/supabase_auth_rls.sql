-- ============================================================
-- Supabase Auth + RLS for real email/password login
-- Run in Supabase SQL Editor after switching the app to Supabase Auth.
-- ============================================================

-- Keep patient owner tied to the logged-in Supabase Auth user.
alter table patients alter column owner_id set default auth.uid();

-- Enable RLS on every patient-owned table.
alter table patients enable row level security;
alter table medication_records enable row level security;
alter table medication_log enable row level security;
alter table medication_notifications enable row level security;
alter table appointments enable row level security;
alter table blood_pressure_logs enable row level security;
alter table blood_sugar_logs enable row level security;
alter table heart_rate_logs enable row level security;
alter table emergency_contacts enable row level security;

-- Reset old policies so this file can be re-run safely.
drop policy if exists "owner can manage own patients" on patients;
drop policy if exists "owner can manage own medication_records" on medication_records;
drop policy if exists "owner can manage own medication_log" on medication_log;
drop policy if exists "owner can manage own medication_notifications" on medication_notifications;
drop policy if exists "owner can manage own appointments" on appointments;
drop policy if exists "owner can manage own blood_pressure_logs" on blood_pressure_logs;
drop policy if exists "owner can manage own blood_sugar_logs" on blood_sugar_logs;
drop policy if exists "owner can manage own heart_rate_logs" on heart_rate_logs;
drop policy if exists "owner can manage own emergency_contacts" on emergency_contacts;

create policy "owner can manage own patients"
  on patients for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owner can manage own medication_records"
  on medication_records for all
  using (exists (
    select 1 from patients p
    where p.id = medication_records.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = medication_records.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own medication_log"
  on medication_log for all
  using (exists (
    select 1 from patients p
    where p.id = medication_log.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = medication_log.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own medication_notifications"
  on medication_notifications for all
  using (exists (
    select 1 from patients p
    where p.id = medication_notifications.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = medication_notifications.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own appointments"
  on appointments for all
  using (exists (
    select 1 from patients p
    where p.id = appointments.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = appointments.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own blood_pressure_logs"
  on blood_pressure_logs for all
  using (exists (
    select 1 from patients p
    where p.id = blood_pressure_logs.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = blood_pressure_logs.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own blood_sugar_logs"
  on blood_sugar_logs for all
  using (exists (
    select 1 from patients p
    where p.id = blood_sugar_logs.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = blood_sugar_logs.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own heart_rate_logs"
  on heart_rate_logs for all
  using (exists (
    select 1 from patients p
    where p.id = heart_rate_logs.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = heart_rate_logs.patient_id
      and p.owner_id = auth.uid()
  ));

create policy "owner can manage own emergency_contacts"
  on emergency_contacts for all
  using (exists (
    select 1 from patients p
    where p.id = emergency_contacts.patient_id
      and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from patients p
    where p.id = emergency_contacts.patient_id
      and p.owner_id = auth.uid()
  ));

-- Optional migration for existing demo patients:
-- 1) Open Authentication > Users and copy the new user's UUID.
-- 2) Replace the UUID below and run it once if you want old demo patients to belong to that account.
--
-- update patients
-- set owner_id = 'PASTE_AUTH_USER_UUID_HERE'
-- where owner_id is null
--    or owner_id not in (select id from auth.users);
