-- ============================================================
-- เพิ่มผู้ป่วยตัวอย่าง 5 คน + ข้อมูลสุขภาพ
-- ผูกกับบัญชีผู้ใช้ที่ "สมัครล่าสุด" (คือบัญชีคุณ)
-- * ถ้าอยากเจาะจงอีเมลเอง: แทนที่ทุกจุดที่เขียน
--   (select id from app_users order by created_at desc limit 1)
--   ด้วย (select id from app_users where email = 'อีเมลคุณ')
-- รันใน SQL Editor ได้เลย — รันซ้ำได้ ไม่เพิ่มข้อมูลซ้ำ
-- ============================================================

-- 0) กันพลาด: ให้แน่ใจว่าคอลัมน์/ตารางที่ใช้มีครบ (idempotent)
alter table patients add column if not exists gender text;
alter table emergency_contacts add column if not exists note text;
create table if not exists heart_rate_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  bpm int not null,
  created_at timestamptz default now()
);

-- 1) ผู้ป่วย 5 คน (owner = บัญชีคุณ)
insert into patients (owner_id, name, age, gender, blood_type, weight, height, congenital_disease, allergies, phone)
select (select id from app_users order by created_at desc limit 1),
       v.name, v.age, v.gender, v.blood_type, v.weight, v.height, v.congenital_disease, v.allergies, v.phone
from (values
  ('สมหญิง ใจดี',      68, 'หญิง', 'O',  62, 158, 'เบาหวาน, ความดันโลหิตสูง', 'แพ้ยาเพนิซิลลิน', '081-234-5678'),
  ('บุญมา รักษ์ไทย',    74, 'ชาย',  'B',  68, 165, 'ความดันโลหิตสูง',          '-',               '082-345-6789'),
  ('สมศักดิ์ มั่นคง',    71, 'ชาย',  'A',  70, 170, 'โรคหัวใจ',                 'แพ้อาหารทะเล',     '083-456-7890'),
  ('จันทร์เพ็ญ ศรีสุข',  66, 'หญิง', 'AB', 58, 155, 'เบาหวาน',                  '-',               '084-567-8901'),
  ('ประยงค์ ทองดี',     79, 'ชาย',  'O',  64, 168, 'ความดันสูง, ไขมันในเลือดสูง','แพ้ยาซัลฟา',      '085-678-9012')
) as v(name, age, gender, blood_type, weight, height, congenital_disease, allergies, phone)
where not exists (select 1 from patients p where p.name = v.name);

-- 2) แผนการทานยา (2 ตัว/คน)
insert into medication_records (patient_id, medication_name, dosage, frequency, time_of_day, notes)
select p.id, x.medication_name, x.dosage, x.frequency, x.time_of_day, x.notes
from patients p
cross join (values
  ('Metformin 500mg', '1 เม็ด', 'วันละ 2 ครั้ง', 'หลังอาหารเช้า-เย็น', 'ยาเบาหวาน'),
  ('Amlodipine 5mg',  '1 เม็ด', 'วันละ 1 ครั้ง', 'หลังอาหารเช้า',      'ยาความดัน')
) as x(medication_name, dosage, frequency, time_of_day, notes)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from medication_records m where m.patient_id = p.id);

-- 3) แจ้งเตือนทานยา
insert into medication_notifications (patient_id, time, repeat, message)
select p.id, x.time, x.repeat, x.message
from patients p
cross join (values
  ('07:30', 'ทุกวัน', 'ทาน Metformin 500mg'),
  ('19:00', 'ทุกวัน', 'ทาน Amlodipine 5mg')
) as x(time, repeat, message)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from medication_notifications n where n.patient_id = p.id);

-- 4) นัดหมายแพทย์ (1/คน)
insert into appointments (patient_id, doctor_name, hospital_name, location, datetime, notes)
select p.id, 'นพ. วิชัย รักษาดี', 'รพ.สุรินทร์', 'อาคารผู้ป่วยนอก ชั้น 3', '2026-09-15 09:00', 'ตรวจสุขภาพประจำเดือน'
from patients p
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from appointments a where a.patient_id = p.id);

-- 5) ความดันโลหิต (3 ครั้ง/คน)
insert into blood_pressure_logs (patient_id, systolic, diastolic, created_at)
select p.id, x.systolic, x.diastolic, x.created_at::timestamptz
from patients p
cross join (values (128, 82, '2026-08-20'), (135, 85, '2026-08-23'), (142, 91, '2026-08-26')) as x(systolic, diastolic, created_at)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from blood_pressure_logs b where b.patient_id = p.id);

-- 6) ระดับน้ำตาล (3 ครั้ง/คน)
insert into blood_sugar_logs (patient_id, sugar_level, created_at)
select p.id, x.sugar_level, x.created_at::timestamptz
from patients p
cross join (values (98, '2026-08-20'), (115, '2026-08-23'), (132, '2026-08-26')) as x(sugar_level, created_at)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from blood_sugar_logs s where s.patient_id = p.id);

-- 7) อัตราการเต้นหัวใจ (3 ครั้ง/คน)
insert into heart_rate_logs (patient_id, bpm, created_at)
select p.id, x.bpm, x.created_at::timestamptz
from patients p
cross join (values (76, '2026-08-20'), (80, '2026-08-23'), (78, '2026-08-26')) as x(bpm, created_at)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from heart_rate_logs h where h.patient_id = p.id);

-- 8) ผู้ติดต่อฉุกเฉิน (2/คน)
insert into emergency_contacts (patient_id, contact_name, relationship, phone_number, note)
select p.id, x.contact_name, x.relationship, x.phone_number, x.note
from patients p
cross join (values
  ('ญาติผู้ดูแล', 'ญาติ', '0801112222', 'โทรได้ตลอด'),
  ('สายด่วนการแพทย์ฉุกเฉิน', 'หน่วยกู้ชีพ', '1669', 'โทรฟรีทั่วประเทศ')
) as x(contact_name, relationship, phone_number, note)
where p.owner_id = (select id from app_users order by created_at desc limit 1)
  and not exists (select 1 from emergency_contacts e where e.patient_id = p.id);
