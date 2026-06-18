-- ============================================================
-- ชุดกลาง: ตารางใหม่ตามเอกสาร (รันใน SQL Editor ครั้งเดียว)
-- R3: อัตราการเต้นของหัวใจ (โรคหัวใจ) / R1: โปรไฟล์ผู้ดูแล
-- ============================================================

-- R3: บันทึกอัตราการเต้นของหัวใจ
create table if not exists heart_rate_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  bpm int not null,
  created_at timestamptz default now()
);

-- R1: โปรไฟล์ผู้ดูแล (ผู้ใช้งานระบบ)
create table if not exists caregivers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  created_at timestamptz default now()
);

-- seed ผู้ดูแล 1 คน ถ้ายังไม่มี
insert into caregivers (name, phone)
select 'คุณผู้ดูแล', ''
where not exists (select 1 from caregivers);

-- seed ค่าหัวใจตัวอย่างให้ผู้ป่วยคนแรก
insert into heart_rate_logs (patient_id, bpm, created_at) values
  ((select id from patients order by created_at limit 1), 78, '2026-06-13'),
  ((select id from patients order by created_at limit 1), 82, '2026-06-15'),
  ((select id from patients order by created_at limit 1), 75, '2026-06-17');
