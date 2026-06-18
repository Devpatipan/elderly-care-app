-- ============================================================
-- เพิ่มคอลัมน์ตาม requirement ในเอกสาร (รันใน SQL Editor ครั้งเดียว)
-- R2: เพศของผู้ป่วย / R4: หมายเหตุของผู้ติดต่อฉุกเฉิน
-- ============================================================
alter table patients add column if not exists gender text;
alter table emergency_contacts add column if not exists note text;
