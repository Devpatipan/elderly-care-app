-- ============================================================
-- เพิ่ม "โรค" ให้แผนการรักษาด้วยยา (เพื่อแยกยาตามแต่ละโรค)
-- รันใน SQL Editor ครั้งเดียว
-- ============================================================
alter table medication_records add column if not exists disease text;

-- ตั้งโรคให้ยาตัวอย่างที่มีอยู่ (ให้เห็นการแยกกลุ่มชัด)
update medication_records set disease = 'เบาหวาน'          where medication_name ilike 'Metformin%'  and disease is null;
update medication_records set disease = 'ความดันโลหิตสูง'  where medication_name ilike 'Amlodipine%'  and disease is null;
