import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE HATASI: Environment variables eksik!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Var' : '❌ YOK');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Var' : '❌ YOK');
  throw new Error('Supabase bağlantı bilgileri eksik. Lütfen environment variables\'ı kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
