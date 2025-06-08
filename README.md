# OBilet - Otobüs Bileti Satış Sistemi

Bu proje, Bartın Üniversitesi Bilgisayar Teknolojisi ve Bilişim Sistemleri Bölümü BTS304 - Veritabanı Yönetim Sistemleri II dersi için geliştirilmiş bir otobüs bileti satış sistemidir.

## 🎯 Proje Özeti

OBilet, kullanıcıların online olarak otobüs bileti araması, satın alması, iptal etmesi ve bilet geçmişini görüntülemesi için geliştirilmiş modern bir web uygulamasıdır.

## 🚀 Özellikler

### Kullanıcı İşlevleri
- ✅ Kullanıcı kaydı ve girişi
- ✅ Bilet arama (kalkış-varış noktası ve tarih seçerek)
- ✅ Sefer listeleme ve filtreleme
- ✅ Koltuk seçimi ve rezervasyon
- ✅ Kredi kartı ile ödeme
- ✅ Bilet iptal etme
- ✅ Bilet geçmişi görüntüleme
- ✅ Kullanıcı profil yönetimi

### Sistem Özellikleri
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Modern UI/UX (Tailwind CSS)
- ✅ Form validasyonu
- ✅ Loading states ve error handling
- ✅ RESTful API design
- ✅ TypeScript tip güvenliği
- ✅ Automated testing (Jest + React Testing Library)

## 🛠 Teknolojiler

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar
- **date-fns** - Tarih işlemleri
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Backend API
- **MySQL** - Veritabanı
- **mysql2** - MySQL driver
- **bcryptjs** - Şifre hashleme
- **NextAuth.js** - Authentication

### Testing
- **Jest** - Test framework
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM testing utilities

### Database Design
- **Stored Procedures** - Veritabanı işlemleri
- **User Defined Functions** - Özel fonksiyonlar
- **Triggers** - Otomatik tetikleyiciler
- **İlişkisel Veritabanı Tasarımı** - Normalizasyon

## 📁 Proje Yapısı

```
obilet-otobus-bileti-satis-sistemi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── seferler/      # Sefer API'leri
│   │   │   └── koltuklar/     # Koltuk API'leri
│   │   ├── seferler/          # Seferler sayfası
│   │   ├── koltuk-secimi/     # Koltuk seçimi sayfası
│   │   ├── page.tsx           # Ana sayfa
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React bileşenleri
│   │   ├── Header.tsx         # Header komponenti
│   │   ├── Footer.tsx         # Footer komponenti
│   │   ├── BiletAramaForm.tsx # Bilet arama formu
│   │   └── __tests__/         # Component testleri
│   ├── lib/                   # Utility fonksiyonları
│   │   └── db.ts             # Veritabanı bağlantıları
│   └── types/                 # TypeScript tip tanımları
│       └── index.ts          # Ana tip dosyası
├── jest.config.js            # Jest konfigürasyonu
├── jest.setup.js             # Jest setup dosyası
├── package.json              # Bağımlılıklar
└── README.md                 # Bu dosya
```

## 🗄 Veritabanı Yapısı

### Ana Tablolar
- **kullanicilar** - Kullanıcı bilgileri
- **firmalar** - Otobüs firmaları
- **istasyonlar** - Otobüs istasyonları
- **otobusler** - Otobüs bilgileri
- **seferler** - Sefer bilgileri
- **koltuklar** - Koltuk durumları
- **biletler** - Bilet kayıtları
- **odemeler** - Ödeme bilgileri

### Veritabanı Özellikleri
- Stored Procedures ile güvenli veri işlemleri
- Triggers ile otomatik koltuk durumu güncellemeleri
- User Defined Functions ile hesaplamalar
- Foreign Key kısıtları ile veri bütünlüğü

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone [repository-url]
cd obilet-otobus-bileti-satis-sistemi
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Veritabanını kurun**
- MySQL'de `obilet_db` adında bir veritabanı oluşturun
- Raporda verilen SQL scriptlerini çalıştırın

4. **Çevre değişkenlerini ayarlayın**
```bash
# .env.local dosyası oluşturun
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=obilet_db
```

5. **Uygulamayı çalıştırın**
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🧪 Testler

### Tüm testleri çalıştırma
```bash
npm test
```

### Watch modunda testler
```bash
npm run test:watch
```

### Coverage raporu
```bash
npm run test:coverage
```

### Test Yapısı
- **Component Tests** - React bileşenleri için unit testler
- **API Tests** - API route'ları için integration testler
- **Form Validation Tests** - Form validasyon testleri
- **Error Handling Tests** - Hata durumları testleri

## 📊 Test Coverage

Current test coverage:
- **Components**: Header, BiletAramaForm
- **API Routes**: Sefer arama endpoint'i
- **Validation**: Form validation logic
- **Error Handling**: Network ve validation hataları

## 🎨 UI/UX Özellikleri

### Design System
- **Renk Paleti**: Kırmızı (#DC2626) ana renk
- **Typography**: Modern, okunabilir fontlar
- **Spacing**: Tutarlı margin ve padding
- **Responsive**: Mobile-first yaklaşım

### User Experience
- Sezgisel navigasyon
- Hızlı bilet arama
- Görsel koltuk seçimi
- Anlaşılır fiyat gösterimi
- Loading states
- Error handling

## 🔒 Güvenlik

- SQL injection koruması (Prepared statements)
- XSS koruması (React built-in)
- Form validation (Client & Server)
- Şifre hashleme (bcrypt)
- Session management (NextAuth.js)

## 📱 Responsive Design

Uygulama tüm cihazlarda optimize edilmiştir:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)  
- **Mobile** (320px - 767px)

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Environment Variables (Production)
```
DB_HOST=production_host
DB_USER=production_user
DB_PASSWORD=production_password
DB_NAME=obilet_db
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com
```

## 📖 API Dokumentasyonu

### Seferler API
- `GET /api/seferler/ara` - Sefer arama
  - Query params: `kalkis_il`, `varis_il`, `tarih`
  - Response: Sefer listesi

### Koltuklar API  
- `GET /api/koltuklar/[sefer_id]` - Koltuk durumları
  - Params: `sefer_id`
  - Response: Sefer bilgileri ve koltuk durumları

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

**Proje**: OBilet Otobüs Bileti Satış Sistemi  
**Ders**: BTS304 - Veritabanı Yönetim Sistemleri II  
**Üniversite**: Bartın Üniversitesi  
**Bölüm**: Bilgisayar Teknolojisi ve Bilişim Sistemleri

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir ve gerçek ticari kullanım için değildir.

