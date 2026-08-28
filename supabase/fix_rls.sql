-- ============================================================
-- ปิด Row Level Security บนตารางข้อมูล
-- เหตุ: โปรเจคเปิด "automatic RLS" ทำให้ตารางถูกล็อก anon อ่านไม่ได้ (คืนค่าว่างเงียบๆ)
-- แอปนี้ใช้ anon key อ่าน/เขียนตรง (ยังไม่ทำ auth ระดับ DB) จึงต้องปิด RLS
-- *** ห้ามปิด RLS ของ app_users — ต้องคงไว้เพื่อกันรหัสผ่านรั่ว ***
-- ============================================================
alter table if exists patients                 disable row level security;
alter table if exists caregivers               disable row level security;
alter table if exists medication_records       disable row level security;
alter table if exists medication_log           disable row level security;
alter table if exists medication_notifications disable row level security;
alter table if exists appointments             disable row level security;
alter table if exists blood_pressure_logs      disable row level security;
alter table if exists blood_sugar_logs         disable row level security;
alter table if exists heart_rate_logs          disable row level security;
alter table if exists emergency_contacts       disable row level security;
alter table if exists health_thresholds        disable row level security;
