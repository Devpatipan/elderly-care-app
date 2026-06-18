-- ============================================================
-- เติมข้อมูลตัวอย่างให้ผู้ป่วย "ทุกคน" ที่ยังไม่มีข้อมูลในแต่ละตาราง
-- รันใน SQL Editor ได้เลย — รันซ้ำได้ ไม่เพิ่มข้อมูลซ้ำ (คนที่มีแล้วจะข้าม)
-- ============================================================

-- แผนการทานยา
insert into medication_records (patient_id, medication_name, dosage, frequency, time_of_day, notes)
select p.id, v.medication_name, v.dosage, v.frequency, v.time_of_day, v.notes
from patients p
cross join (values
  ('Paracetamol 500mg', '1 เม็ด', 'วันละ 3 ครั้ง', 'หลังอาหาร', 'ยาแก้ปวด/ลดไข้'),
  ('Vitamin B Complex', '1 เม็ด', 'วันละ 1 ครั้ง', 'หลังอาหารเช้า', 'วิตามินบำรุง')
) as v(medication_name, dosage, frequency, time_of_day, notes)
where not exists (select 1 from medication_records m where m.patient_id = p.id);

-- การแจ้งเตือนทานยา
insert into medication_notifications (patient_id, time, repeat, message)
select p.id, v.time, v.repeat, v.message
from patients p
cross join (values
  ('08:00', 'ทุกวัน', 'ทาน Paracetamol 500mg'),
  ('19:00', 'ทุกวัน', 'ทาน Vitamin B Complex')
) as v(time, repeat, message)
where not exists (select 1 from medication_notifications n where n.patient_id = p.id);

-- การนัดหมายแพทย์
insert into appointments (patient_id, doctor_name, hospital_name, location, datetime, notes)
select p.id, 'นพ. สมคิด ดีงาม', 'รพ.สุรินทร์', 'แผนกอายุรกรรม ชั้น 2', '2026-06-30 09:30', 'ตรวจสุขภาพประจำเดือน'
from patients p
where not exists (select 1 from appointments a where a.patient_id = p.id);

-- บันทึกความดันโลหิต
insert into blood_pressure_logs (patient_id, systolic, diastolic, created_at)
select p.id, v.systolic, v.diastolic, v.created_at::timestamptz
from patients p
cross join (values
  (125, 80, '2026-06-14'), (132, 84, '2026-06-16'), (128, 82, '2026-06-18')
) as v(systolic, diastolic, created_at)
where not exists (select 1 from blood_pressure_logs b where b.patient_id = p.id);

-- บันทึกระดับน้ำตาล
insert into blood_sugar_logs (patient_id, sugar_level, created_at)
select p.id, v.sugar_level, v.created_at::timestamptz
from patients p
cross join (values
  (95, '2026-06-14'), (108, '2026-06-16'), (99, '2026-06-18')
) as v(sugar_level, created_at)
where not exists (select 1 from blood_sugar_logs s where s.patient_id = p.id);

-- บันทึกอัตราการเต้นหัวใจ
insert into heart_rate_logs (patient_id, bpm, created_at)
select p.id, v.bpm, v.created_at::timestamptz
from patients p
cross join (values
  (76, '2026-06-14'), (80, '2026-06-16'), (78, '2026-06-18')
) as v(bpm, created_at)
where not exists (select 1 from heart_rate_logs h where h.patient_id = p.id);

-- ผู้ติดต่อฉุกเฉิน
insert into emergency_contacts (patient_id, contact_name, relationship, phone_number, note)
select p.id, v.contact_name, v.relationship, v.phone_number, v.note
from patients p
cross join (values
  ('ญาติผู้ดูแล', 'ญาติ', '0801112222', 'โทรได้ตลอด'),
  ('สายด่วนการแพทย์ฉุกเฉิน', 'หน่วยกู้ชีพ', '1669', 'โทรฟรีทั่วประเทศ')
) as v(contact_name, relationship, phone_number, note)
where not exists (select 1 from emergency_contacts e where e.patient_id = p.id);
