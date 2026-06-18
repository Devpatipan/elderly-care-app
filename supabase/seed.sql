-- ============================================================
-- ข้อมูลตัวอย่าง (seed) — ให้แอปมีข้อมูลโชว์เหมือนตอน mock
-- ผูกทุกอย่างกับ "ผู้ป่วยคนแรก" ที่ schema.sql สร้างไว้
-- วิธีใช้: SQL Editor > New query > วางทั้งไฟล์ > Run
-- (รันซ้ำได้ แต่จะเพิ่มข้อมูลซ้ำ — ถ้าอยากเริ่มใหม่ให้ลบข้อมูลเดิมก่อน)
-- ============================================================

-- แผนการทานยา
insert into medication_records (patient_id, medication_name, dosage, frequency, time_of_day, notes) values
  ((select id from patients order by created_at limit 1), 'Metformin 500mg', '1 เม็ด', 'วันละ 2 ครั้ง', 'หลังอาหารเช้า-เย็น', 'ยาเบาหวาน'),
  ((select id from patients order by created_at limit 1), 'Amlodipine 5mg', '1 เม็ด', 'วันละ 1 ครั้ง', 'หลังอาหารเช้า', 'ยาความดัน');

-- การแจ้งเตือนทานยา
insert into medication_notifications (patient_id, time, repeat, message) values
  ((select id from patients order by created_at limit 1), '07:30', 'ทุกวัน', 'ทาน Metformin 500mg'),
  ((select id from patients order by created_at limit 1), '16:30', 'ทุกวัน', 'ทาน Metformin 500mg'),
  ((select id from patients order by created_at limit 1), '07:30', 'ทุกวัน', 'ทาน Amlodipine 5mg');

-- การนัดหมายแพทย์
insert into appointments (patient_id, doctor_name, hospital_name, location, datetime, notes) values
  ((select id from patients order by created_at limit 1), 'นพ. วิชัย รักษาดี', 'รพ.สุรินทร์', 'อาคารผู้ป่วยนอก ชั้น 3', '2026-06-25 09:00', 'ตรวจระดับน้ำตาลสะสม (HbA1c)');

-- บันทึกความดันโลหิต
insert into blood_pressure_logs (patient_id, systolic, diastolic, created_at) values
  ((select id from patients order by created_at limit 1), 128, 82, '2026-06-12'),
  ((select id from patients order by created_at limit 1), 135, 85, '2026-06-14'),
  ((select id from patients order by created_at limit 1), 142, 91, '2026-06-16'),
  ((select id from patients order by created_at limit 1), 138, 88, '2026-06-18');

-- บันทึกระดับน้ำตาล
insert into blood_sugar_logs (patient_id, sugar_level, created_at) values
  ((select id from patients order by created_at limit 1), 98,  '2026-06-12'),
  ((select id from patients order by created_at limit 1), 115, '2026-06-14'),
  ((select id from patients order by created_at limit 1), 132, '2026-06-16'),
  ((select id from patients order by created_at limit 1), 120, '2026-06-18');

-- ผู้ติดต่อฉุกเฉิน
insert into emergency_contacts (patient_id, contact_name, relationship, phone_number) values
  ((select id from patients order by created_at limit 1), 'สมชาย ใจดี', 'บุตร', '0899991234'),
  ((select id from patients order by created_at limit 1), 'สายด่วนการแพทย์ฉุกเฉิน', 'หน่วยกู้ชีพ', '1669');
