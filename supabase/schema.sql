-- ============================================================
-- Elderly Care Assistant — Supabase (PostgreSQL) schema
-- โครงตามดีไซน์ฐานข้อมูลบทที่ 3 (9 ตาราง)
-- + เพิ่ม patient_id เพื่อรองรับผู้ป่วยหลายคน (G6 ใน ROADMAP.md)
-- วิธีใช้: เปิด Supabase > โปรเจกต์ > SQL Editor > วางทั้งไฟล์นี้ > กด Run
-- ============================================================

-- 1) patients (profiles) — ข้อมูลผู้ป่วย
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),          -- ผู้ดูแลที่เป็นเจ้าของข้อมูล (อ้างอิง auth.users)
  name text not null,
  age int,
  blood_type text,
  weight numeric,
  height numeric,
  congenital_disease text,
  allergies text,
  phone text,
  created_at timestamptz default now()
);

-- 2) medication_records — แผนการทานยา
create table if not exists medication_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  medication_name text not null,
  dosage text,
  frequency text,
  time_of_day text,
  notes text,
  created_at timestamptz default now()
);

-- 3) medication_log — ประวัติการทานยาจริง
create table if not exists medication_log (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  medication_record_id uuid references medication_records(id) on delete set null,
  medication_name text,
  taken_at timestamptz default now()
);

-- 4) medication_notifications — การตั้งแจ้งเตือนทานยา
create table if not exists medication_notifications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  medication_record_id uuid references medication_records(id) on delete set null,
  time text,            -- รูปแบบ 'HH:MM' เช่น '07:30'
  repeat text,          -- เช่น 'ทุกวัน'
  message text,
  created_at timestamptz default now()
);

-- 5) appointments — การนัดหมายพบแพทย์
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  doctor_name text,
  hospital_name text,
  location text,
  datetime timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- 6) blood_pressure_logs — บันทึกความดันโลหิต
create table if not exists blood_pressure_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  systolic int not null,
  diastolic int not null,
  created_at timestamptz default now()
);

-- 7) blood_sugar_logs — บันทึกระดับน้ำตาล
create table if not exists blood_sugar_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  sugar_level int not null,
  created_at timestamptz default now()
);

-- 8) emergency_contacts — ผู้ติดต่อฉุกเฉิน
create table if not exists emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  contact_name text,
  relationship text,
  phone_number text,
  created_at timestamptz default now()
);

-- 9) health_thresholds — เกณฑ์แปลผลค่าสุขภาพ (บทที่ 2: 2.8.4 / 2.9.3)
create table if not exists health_thresholds (
  id uuid primary key default gen_random_uuid(),
  metric text not null,        -- 'bp' | 'sugar'
  level text not null,         -- 'success' | 'warning' | 'danger'
  min_value numeric,
  max_value numeric,
  label text
);

-- ============================================================
-- ข้อมูลเริ่มต้น (seed) — ค่าเกณฑ์ + ผู้ป่วยตัวอย่าง 1 คน
-- ============================================================

insert into health_thresholds (metric, level, min_value, max_value, label) values
  ('sugar',   'success', 70,  99,  'ปกติ'),
  ('sugar',   'warning', 100, 125, 'มีภาวะเสี่ยง'),
  ('sugar',   'danger',  126, 999, 'เสี่ยงเป็นเบาหวาน'),
  ('bp',      'success', 0,   119, 'ปกติ'),
  ('bp',      'warning', 120, 139, 'ค่อนข้างสูง'),
  ('bp',      'danger',  140, 999, 'สูง');

-- ผู้ป่วยตัวอย่าง (ดึง id ไปใช้ผูกข้อมูลตัวอย่างอื่น ๆ ได้ภายหลัง)
insert into patients (name, age, blood_type, weight, height, congenital_disease, allergies, phone)
values ('สมหญิง ใจดี', 68, 'O', 62, 158, 'เบาหวาน, ความดันโลหิตสูง', 'แพ้ยาเพนิซิลลิน', '081-234-5678');

-- ============================================================
-- ความปลอดภัย (Row Level Security)
-- ------------------------------------------------------------
-- ตอนพัฒนา/ทดสอบช่วงแรก: ปล่อย RLS ปิดไว้ก่อนได้ (เข้าถึงได้ด้วย anon key)
-- ตอนทำ login จริง ค่อยเปิด RLS แล้วใช้นโยบายด้านล่าง (จำกัดให้เห็นเฉพาะข้อมูลของผู้ดูแลคนนั้น)
-- คอมเมนต์ไว้ก่อน — เปิดใช้เมื่อพร้อมทำ auth
-- ============================================================

-- alter table patients enable row level security;
-- create policy "owner can manage own patients"
--   on patients for all
--   using (owner_id = auth.uid())
--   with check (owner_id = auth.uid());
