import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fesuyzmkrslqwknkgucq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3V5em1rcnNscXdrbmtndWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTExNTMsImV4cCI6MjA3Nzc2NzE1M30.gX_8VtyuQUDHuB5bl13bu6qdgZuKGvvhF8BsvwTIYS8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Supabase bağlantısı test ediliyor...\n');

  // Test 1: Buildings tablosunu kontrol et
  console.log('📊 Buildings tablosu kontrol ediliyor...');
  const { data: buildings, error: buildingsError } = await supabase
    .from('buildings')
    .select('*');
  
  if (buildingsError) {
    console.error('❌ Buildings hatası:', buildingsError);
  } else {
    console.log('✅ Buildings sayısı:', buildings?.length || 0);
    console.log('Buildings:', buildings);
  }

  // Test 2: Yeni bina eklemeyi dene
  console.log('\n🏢 Yeni bina ekleme testi...');
  const { data: newBuilding, error: insertError } = await supabase
    .from('buildings')
    .insert([{ name: 'Test Binası', color: 'bg-blue-500' }])
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Insert hatası:', insertError);
    console.error('Hata detayı:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✅ Bina eklendi:', newBuilding);
  }

  // Test 3: Cameras tablosunu kontrol et
  console.log('\n📷 Cameras tablosu kontrol ediliyor...');
  const { data: cameras, error: camerasError } = await supabase
    .from('cameras')
    .select('*');
  
  if (camerasError) {
    console.error('❌ Cameras hatası:', camerasError);
  } else {
    console.log('✅ Cameras sayısı:', cameras?.length || 0);
  }

  // Test 4: Tabloların varlığını kontrol et
  console.log('\n🗄️ Tüm tablolar listeleniyor...');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (tablesError) {
    console.error('❌ Tablo listesi alınamadı:', tablesError);
  } else {
    console.log('✅ Bulunan tablolar:', tables);
  }
}

testDatabase().catch(console.error);
