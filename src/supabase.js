import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// ค่าจากโปรเจกต์ Supabase (Project Settings > API)
// anon/publishable key ปลอดภัยที่จะอยู่ในแอป client — ออกแบบมาให้เปิดเผยได้
// (ความปลอดภัยจริงควบคุมด้วย Row Level Security ฝั่ง DB เมื่อทำ login)
const SUPABASE_URL = 'https://xqycunwekdukttpljsfd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fvVDdeuxLbQ2IHfjkZ1deA_CPxjuRj8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,    // ยังไม่ทำ login จริง — ไม่ต้องเก็บ session
    autoRefreshToken: false,
  },
});
