# 🔍 Supabase Veritabanı Kontrol

## Sorun: Binalar eklenemiyor ve görünmüyor

### Adım 1: Supabase Dashboard'a Girin
1. https://supabase.com/dashboard adresine gidin
2. `fesuyzmkrslqwknkgucq` projesini açın

### Adım 2: SQL Editor'da Tabloları Kontrol Edin

**SQL Editor** → **New Query** diyerek şu komutları tek tek çalıştırın:

#### 1️⃣ Buildings tablosunu kontrol et:
```sql
SELECT * FROM buildings;
```

#### 2️⃣ Eğer tablo boşsa, buildings tablosunu yeniden oluştur:
```sql
-- Önce mevcut tabloyu sil (varsa)
DROP TABLE IF EXISTS buildings CASCADE;

-- Yeni tabloyu oluştur
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'bg-blue-500',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını ayarla
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilsin
CREATE POLICY "Buildings are viewable by everyone"
ON buildings FOR SELECT
TO public
USING (true);

-- Herkes ekleyebilsin
CREATE POLICY "Buildings are insertable by everyone"
ON buildings FOR INSERT
TO public
WITH CHECK (true);

-- Herkes güncelleyebilsin
CREATE POLICY "Buildings are updatable by everyone"
ON buildings FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Herkes silebilsin
CREATE POLICY "Buildings are deletable by everyone"
ON buildings FOR DELETE
TO public
USING (true);
```

#### 3️⃣ Varsayılan binaları ekle:
```sql
INSERT INTO buildings (name, color) VALUES
('Abdurrahman Gazi Kız Yurdu', 'bg-blue-500'),
('Şehit Ömer Halisdemir Erkek Yurdu', 'bg-purple-500'),
('Fatih Sultan Mehmet Gençlik Merkezi', 'bg-green-500'),
('Yunus Emre Kültür Merkezi', 'bg-orange-500'),
('Spor Kompleksi', 'bg-red-500'),
('Mimar Sinan Sosyal Tesisleri', 'bg-teal-500'),
('Atatürk Gençlik Kampı', 'bg-indigo-500'),
('İdari Bina', 'bg-pink-500'),
('Eğitim ve Kültür Merkezi', 'bg-cyan-500'),
('Diğer Binalar', 'bg-gray-500');
```

#### 4️⃣ Kontrol et:
```sql
SELECT COUNT(*) as bina_sayisi FROM buildings;
SELECT * FROM buildings ORDER BY name;
```

#### 5️⃣ Cameras tablosunu da kontrol et:
```sql
SELECT * FROM cameras LIMIT 5;
```

### Adım 3: RLS Politikalarını Kontrol Et

**Table Editor** → **buildings** → **⚙️ (Settings)** → **Policies**

Şu politikalar olmalı:
- ✅ SELECT policy (herkes okuyabilir)
- ✅ INSERT policy (herkes ekleyebilir)
- ✅ UPDATE policy (herkes güncelleyebilir)
- ✅ DELETE policy (herkes silebilir)

### Adım 4: API Settings Kontrol

**Project Settings** → **API** → **Project API keys**

Şunların doğru olduğundan emin olun:
- URL: `https://fesuyzmkrslqwknkgucq.supabase.co`
- anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ⚠️ Bu adımları tamamladıktan sonra:

1. Yukarıdaki SQL komutlarını çalıştırın
2. Hangi adımda hata aldığınızı bana bildirin
3. Console'da gördüğünüz hata mesajlarını gönderin
