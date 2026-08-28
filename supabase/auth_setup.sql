-- ============================================================
-- ระบบล็อกอินจริง (Real Login)
-- เก็บรหัสผ่านแบบ hash (bcrypt) ด้วย pgcrypto — ไม่เก็บรหัสโต้งๆ
-- ล็อก RLS ไม่ให้ anon อ่านตารางรหัสตรงๆ เข้าถึงผ่านฟังก์ชันเท่านั้น
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > Run (รันครั้งเดียว)
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

-- ตารางผู้ใช้ (ผู้ดูแลที่ล็อกอิน)
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  created_at timestamptz default now()
);

-- เปิด RLS และไม่สร้าง policy ใดๆ = anon key เข้าถึงตารางตรงๆ ไม่ได้ (กัน hash รั่ว)
alter table app_users enable row level security;

-- ---------- สมัครสมาชิก ----------
create or replace function register_user(p_email text, p_password text, p_name text default null)
returns table(id uuid, email text, name text)
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
  insert into app_users(email, password_hash, name)
  values (lower(p_email), crypt(p_password, gen_salt('bf')), nullif(trim(coalesce(p_name, '')), ''))
  returning app_users.id into v_id;
  return query select u.id, u.email, u.name from app_users u where u.id = v_id;
end;
$$;

-- ---------- เข้าสู่ระบบ (คืนแถวถ้ารหัสถูก / ว่างถ้าผิด) ----------
create or replace function login_user(p_email text, p_password text)
returns table(id uuid, email text, name text)
language sql security definer set search_path = public, extensions
as $$
  select u.id, u.email, u.name
  from app_users u
  where lower(u.email) = lower(p_email)
    and u.password_hash = crypt(p_password, u.password_hash);
$$;

-- ให้ anon key (ที่แอปใช้) เรียกฟังก์ชันได้
grant execute on function register_user(text, text, text) to anon, authenticated;
grant execute on function login_user(text, text) to anon, authenticated;
