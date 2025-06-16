# OBilet - Otobüs Bileti Satış Sistemi

OBilet, otobüs firmalarının bilet satış işlemlerini dijitalleştiren kapsamlı bir yazhane (bilet satış ofisi) yönetim sistemidir. Modern web teknolojileri kullanılarak geliştirilmiş bu sistem, otobüs biletlerinin satışından yönetimine kadar tüm süreçleri kolaylaştırır.

## 🚌 Sistem Özellikleri

### 📊 Dashboard ve Raporlama
- **Anlık İstatistikler**: Günlük satış, gelir ve sefer bilgileri
- **Hızlı Arama**: Bilet numarası, TC kimlik veya telefon ile bilet sorgulama
- **Gerçek Zamanlı Veriler**: Canlı satış takibi ve performans metrikleri

### 🎫 Bilet Satış Sistemi
- **Sefer Arama**: Kalkış-varış noktası ve tarih bazlı sefer sorgulama
- **Koltuk Seçimi**: Görsel otobüs şeması ile koltuk seçimi
- **Müşteri Yönetimi**: TC kimlik ile otomatik müşteri kaydı
- **Ödeme İşlemleri**: Nakit, kredi kartı ve banka havalesi seçenekleri
- **Bilet İptali**: Satılan biletlerin iptali ve iade işlemleri

### 🚍 Sefer Yönetimi
- **Sefer Planlama**: Yeni sefer oluşturma ve düzenleme
- **Doluluk Takibi**: Sefer bazlı koltuk doluluk oranları
- **Fiyat Yönetimi**: Dinamik fiyatlandırma sistemi
- **Sefer Durumu**: Aktif/pasif sefer kontrolü

### 🏢 Firma ve Araç Yönetimi
- **Firma Kayıtları**: Otobüs firmalarının detaylı bilgileri
- **Araç Filosu**: Otobüs plaka, model ve koltuk düzeni yönetimi
- **İstasyon Ağı**: Kalkış ve varış istasyonlarının yönetimi

### 👥 Müşteri ve Personel Yönetimi
- **Müşteri Profilleri**: Detaylı müşteri bilgileri ve bilet geçmişi
- **Personel Takibi**: Satış yapan personel bilgileri
- **Bilet Geçmişi**: Müşteri bazlı bilet satış raporları

### 📈 Raporlama ve Analiz
- **Satış Raporları**: Günlük, haftalık, aylık satış analizleri
- **Gelir Takibi**: Firma bazlı gelir raporları
- **Performans Metrikleri**: Sefer doluluk oranları ve verimlilik analizi

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Veritabanı**: MySQL 8.0+
- **Form Yönetimi**: React Hook Form, Zod
- **UI Kütüphanesi**: Lucide React Icons

## 📋 Sistem Gereksinimleri

- **Node.js**: 18.0 veya üzeri
- **MySQL**: 8.0 veya üzeri
- **npm/yarn/pnpm**: Paket yöneticisi

## 🚀 Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/ravanbabayev/obilet-otobus-bileti-satis-sistemi
cd obilet-otobus-bileti-satis-sistemi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

### 3. Veritabanını Kurun
```bash
# MySQL'e bağlanın
mysql -u root -p

# Veritabanı scriptini çalıştırın
source obilet_database_complete.sql
```

### 4. Ortam Değişkenlerini Ayarlayın
`.env.local` dosyası oluşturun:
```env
# Veritabanı Bağlantısı
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=obilet_db
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacaktır.

## 📱 Kullanım

### Ana Dashboard
- Sistem açıldığında ana dashboard ekranı görüntülenir
- Günlük satış istatistikleri ve hızlı arama özellikleri mevcuttur

### Bilet Satışı
1. **Sefer Arama**: Kalkış-varış noktası ve tarih seçin
2. **Sefer Seçimi**: Uygun seferi seçin
3. **Koltuk Seçimi**: Otobüs şemasından koltuk seçin
4. **Müşteri Bilgileri**: TC kimlik ile müşteri bilgilerini girin
5. **Ödeme**: Ödeme yöntemini seçin ve işlemi tamamlayın

### Yönetim Paneli
- **Seferler**: `/yonetim/seferler` - Sefer yönetimi
- **Araçlar**: `/yonetim/araclar` - Otobüs filosu yönetimi
- **Firmalar**: `/yonetim/firmalar` - Firma bilgileri
- **Müşteriler**: `/yonetim/musteriler` - Müşteri yönetimi
- **Raporlar**: `/yonetim/raporlar` - Detaylı raporlar

## 🔧 Geliştirme

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Production
```bash
npm run start
```

## 📊 Veritabanı Yapısı

Sistem aşağıdaki ana tablolardan oluşur:
- `otobus_firmasi`: Otobüs firması bilgileri
- `istasyon`: İstasyon ve şehir bilgileri
- `otobus`: Araç filosu bilgileri
- `sefer`: Sefer planlaması
- `musteri`: Müşteri bilgileri
- `bilet`: Bilet satış kayıtları
- `odeme`: Ödeme işlemleri
- `koltuk_duzeni`: Otobüs koltuk düzeni

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için:
- GitHub Issues kullanabilirsiniz
- Geliştirici ekibi ile iletişime geçebilirsiniz

---

**OBilet** - Modern otobüs bileti satış sistemi 🚌
