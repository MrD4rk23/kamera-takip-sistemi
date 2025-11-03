# Teknik Servis - Arıza Kayıt Defteri

Teknik servis, bakım-onarım veya bilişim birimlerine gelen arızalı cihazların kaydını tutmak, yapılan işlemleri belgelemek ve bu kayıtları dışa aktarabilmek için tasarlanmış mobil uygulama.

## 🎯 Özellikler

- ✅ **Arıza Kayıt Yönetimi**: Detaylı cihaz ve arıza bilgilerini kaydedin
- 📱 **Mobil-First Tasarım**: iOS ve Android için optimize edilmiş arayüz
- 💾 **Otomatik Kaydetme**: Tüm değişiklikler anında kaydedilir
- 🔍 **Gelişmiş Arama**: Cihaz, marka, model veya birime göre hızlıca filtreleyin
- 📊 **Excel Export**: Tüm kayıtları Excel dosyası olarak dışa aktarın
- 🌐 **Offline Çalışma**: İnternet bağlantısı olmadan da kullanılabilir
- 📲 **Native Paylaşım**: Mobilde Excel dosyalarını direkt paylaşın

## 📱 Native Mobil Uygulama Kurulumu

Bu uygulama Capacitor kullanarak iOS ve Android'de çalışır.

### Gereksinimler

- Node.js & npm
- iOS geliştirme için: macOS + Xcode
- Android geliştirme için: Android Studio

### Kurulum Adımları

1. **Projeyi GitHub'a aktarın**
   - Lovable arayüzünden "Export to Github" butonuna tıklayın
   - Kendi GitHub reponuzdan projeyi klonlayın

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Platform ekleyin**
   ```bash
   # iOS için (sadece macOS'ta)
   npx cap add ios
   
   # Android için
   npx cap add android
   ```

4. **Projeyi build edin**
   ```bash
   npm run build
   ```

5. **Platform bağımlılıklarını güncelleyin**
   ```bash
   # iOS için
   npx cap update ios
   
   # Android için
   npx cap update android
   ```

6. **Projeyi senkronize edin**
   ```bash
   npx cap sync
   ```

7. **Uygulamayı çalıştırın**
   ```bash
   # iOS için (Xcode'da açılır)
   npx cap run ios
   
   # Android için (Android Studio'da açılır veya emulator'de çalışır)
   npx cap run android
   ```

### Hot Reload Geliştirme

Geliştirme sırasında hot reload özelliği aktiftir. `capacitor.config.ts` dosyasında yapılandırılmıştır:

```typescript
server: {
  url: 'https://[your-project-url].lovableproject.com',
  cleartext: true
}
```

Bu sayede kodunuzu her değiştirdiğinizde, mobil cihazda veya emulator'de otomatik olarak güncellenecektir.

### Production Build

Production için deploy etmeden önce `capacitor.config.ts` dosyasındaki `server` ayarını kaldırın veya yorum satırı yapın:

```typescript
// server: {
//   url: '...',
//   cleartext: true
// },
```

## 🚀 Web Sürümünü Çalıştırma

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build
```

## 📖 Kullanım

1. **Yeni Kayıt**: Ana ekranda sağ alttaki + butonuna tıklayın
2. **Kayıt Görüntüleme**: Listeden bir kayda tıklayarak detaylarını görün
3. **Kayıt Düzenleme**: Detay ekranında alanları düzenleyin (otomatik kaydedilir)
4. **Arama**: Üstteki arama kutusunu kullanarak kayıtları filtreleyin
5. **Excel Export**: Sağ üstteki "Excel'e Aktar" butonuna tıklayın

## 🎨 Teknoloji Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Mobile**: Capacitor (iOS & Android)
- **Storage**: LocalStorage (Web) + Capacitor Storage (Mobile)
- **Excel**: XLSX library
- **Routing**: React Router
- **Form**: React Hook Form + Zod

## 📝 Veri Alanları

Her arıza kaydı şu bilgileri içerir:

- Tarih
- Sıra No
- Cihazın Adı
- Marka
- Model
- Seri No
- Geldiği Birim
- Arıza Sebebi
- Yapılan İşlem
- Sonuç (Arıza Giderildi, Parça Bekleniyor, İade Edildi, vb.)

## 🔒 Güvenlik ve Veri

- Tüm veriler cihazda yerel olarak saklanır
- İnternet bağlantısı gerektirmez
- Kişisel verileriniz hiçbir sunucuya gönderilmez

## 📞 Destek

Sorularınız veya önerileriniz için issue açabilirsiniz.

---

**Not**: Bu proje Lovable platformunda geliştirilmiştir.

Daha fazla bilgi: [Capacitor Mobil Geliştirme Blog Post](https://docs.lovable.dev)
