-- ============================================================
-- v2: บัญชีล็อกอิน = โปรไฟล์ผู้ดูแล (เพิ่มอายุ/เบอร์) + ผูกผู้ป่วยกับผู้ดูแล
-- รันใน SQL Editor ครั้งเดียว (ต้องรัน auth_setup.sql มาก่อน)
-- ============================================================
alter table app_users add column if not exists age int;
alter table app_users add column if not exists phone text;

-- สมัครสมาชิก (รับอายุ/เบอร์ด้วย)
drop function if exists register_user(text, text, text);
create or replace function register_user(
  p_email text, p_password text, p_name text default null,
  p_age int default null, p_phone text default null)
returns table(id uuid, email text, name text, age int, phone text)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'รหัสผ่านอย่างน้อย 6 ตัวอักษร';
  end if;
  if exists (select 1 from app_users u where lower(u.email) = lower(p_email)) then
    raise exception 'อีเมลนี้ถูกใช้แล้ว';
  end if;
  insert into app_users(email, password_hash, name, age, phone)
  values (lower(p_email), crypt(p_password, gen_salt('bf')),
          nullif(trim(coalesce(p_name, '')), ''), p_age,
          nullif(trim(coalesce(p_phone, '')), ''))
  returning app_users.id into v_id;
  return query select u.id, u.email, u.name, u.age, u.phone from app_users u where u.id = v_id;
end;
$$;

-- เข้าสู่ระบบ (คืนโปรไฟล์ครบ)
drop function if exists login_user(text, text);
create or replace function login_user(p_email text, p_password text)
returns table(id uuid, email text, name text, age int, phone text)
language sql security definer set search_path = public, extensions
as $$
  select u.id, u.email, u.name, u.age, u.phone
  from app_users u
  where lower(u.email) = lower(p_email)
    and u.password_hash = crypt(p_password, u.password_hash);
$$;

-- แก้ไขโปรไฟล์ผู้ดูแล
create or replace function update_user(
  p_id uuid, p_name text default null, p_age int default null, p_phone text default null)
returns table(id uuid, email text, name text, age int, phone text)
language sql security definer set search_path = public, extensions
as $$
  update app_users set
    name  = coalesce(nullif(trim(coalesce(p_name, '')), ''), name),
    age   = coalesce(p_age, age),
    phone = coalesce(nullif(trim(coalesce(p_phone, '')), ''), phone)
  where id = p_id
  returning id, email, name, age, phone;
$$;

grant execute on function register_user(text, text, text, int, text) to anon, authenticated;
grant execute on function login_user(text, text) to anon, authenticated;
grant execute on function update_user(uuid, text, int, text) to anon, authenticated;
