import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Environment Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE HATASI: Environment variables eksik!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Var ama gizli' : 'YOK');
  throw new Error('Supabase bağlantı bilgileri eksik. Lütfen Vercel environment variables\'ı kontrol edin.');
}

console.log('✅ Supabase client başlatılıyor...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Supabase bağlantısı kuruldu!');
