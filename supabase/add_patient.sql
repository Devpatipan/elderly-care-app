-- ============================================================
-- เพิ่มผู้ป่วยใหม่ 1 คน พร้อมข้อมูลครบทุกตาราง
-- วิธีใช้: SQL Editor > New query > วางทั้งไฟล์ > Run
-- (แต่ละคำสั่งอ้างผู้ป่วยล่าสุดที่เพิ่งเพิ่มด้วย order by created_at desc limit 1)
-- ============================================================

-- 1) ผู้ป่วย
insert into patients (name, age, blood_type, weight, height, congenital_disease, allergies, phone)
values ('ประยุทธ์ มั่นคง', 72, 'B', 70, 165, 'ความดันโลหิตสูง, ไขมันในเลือดสูง', 'แพ้อาหารทะเล', '082-555-1212');

-- 2) แผนการทานยา
insert into medication_records (patient_id, medication_name, dosage, frequency, time_of_day, notes) values
  ((select id from patients order by created_at desc limit 1), 'Losartan 50mg', '1 เม็ด', 'วันละ 1 ครั้ง', 'หลังอาหารเช้า', 'ยาความดัน'),
  ((select id from patients order by created_at desc limit 1), 'Simvastatin 20mg', '1 เม็ด', 'วันละ 1 ครั้ง', 'ก่อนนอน', 'ยาลดไขมัน');

-- 3) แจ้งเตือนทานยา
insert into medication_notifications (patient_id, time, repeat, message) values
  ((select id from patients order by created_at desc limit 1), '07:00', 'ทุกวัน', 'ทาน Losartan 50mg'),
  ((select id from patients order by created_at desc limit 1), '21:00', 'ทุกวัน', 'ทาน Simvastatin 20mg');

-- 4) นัดหมายแพทย์
insert into appointments (patient_id, doctor_name, hospital_name, location, datetime, notes) values
  ((select id from patients order by created_at desc limit 1), 'พญ. มาลี ใจงาม', 'รพ.สุรินทร์', 'คลินิกอายุรกรรม ชั้น 2', '2026-07-02 10:30', 'ตรวจไขมันในเลือด');

-- 5) บันทึกความดันโลหิต
insert into blood_pressure_logs (patient_id, systolic, diastolic, created_at) values
  ((select id from patients order by created_at desc limit 1), 145, 92, '2026-06-13'),
  ((select id from patients order by created_at desc limit 1), 150, 95, '2026-06-15'),
  ((select id from patients order by created_at desc limit 1), 138, 88, '2026-06-17');

-- 6) บันทึกระดับน้ำตาล
insert into blood_sugar_logs (patient_id, sugar_level, created_at) values
  ((select id from patients order by created_at desc limit 1), 92,  '2026-06-13'),
  ((select id from patients order by created_at desc limit 1), 105, '2026-06-15'),
  ((select id from patients order by created_at desc limit 1), 99,  '2026-06-17');

-- 7) ผู้ติดต่อฉุกเฉิน
insert into emergency_contacts (patient_id, contact_name, relationship, phone_number) values
  ((select id from patients order by created_at desc limit 1), 'ปรีดา มั่นคง', 'บุตรสาว', '0866667777'),
  ((select id from patients order by created_at desc limit 1), 'สายด่วนการแพทย์ฉุกเฉิน', 'หน่วยกู้ชีพ', '1669');
