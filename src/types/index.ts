// Kullanıcı türleri
export interface Kullanici {
  kullanici_id: number;
  tc_kimlik_no: string;
  ad: string;
  soyad: string;
  dogum_tarihi: Date;
  cinsiyet: 'E' | 'K';
  telefon: string;
  email: string;
  sifre: string;
  kayit_tarihi: Date;
  son_giris_tarihi?: Date;
}

// Firma türleri
export interface Firma {
  firma_id: number;
  firma_adi: string;
  logo_url?: string;
  telefon: string;
  email: string;
  adres: string;
  website?: string;
  aktif_mi: boolean;
}

// İstasyon türleri
export interface Istasyon {
  istasyon_id: number;
  istasyon_adi: string;
  sehir: string;
  adres: string;
  telefon: string;
  aktif_mi: boolean;
}

// Otobüs türleri
export interface Otobus {
  otobus_id: number;
  firma_id: number;
  plaka: string;
  model: string;
  koltuk_sayisi: number;
  wifi_var_mi: boolean;
  tv_var_mi: boolean;
  klima_var_mi: boolean;
  aktif_mi: boolean;
}

// Sefer türleri
export interface Sefer {
  sefer_id: number;
  firma_id: number;
  otobus_id: number;
  kalkis_istasyon_id: number;
  varis_istasyon_id: number;
  kalkis_zamani: Date;
  varis_zamani: Date;
  mesafe: number;
  temel_ucret: number;
  aktif_mi: boolean;
  // Joined fields
  firma_adi?: string;
  kalkis_istasyon_adi?: string;
  varis_istasyon_adi?: string;
  kalkis_il?: string;
  varis_il?: string;
  plaka?: string;
}

// Koltuk türleri
export interface Koltuk {
  koltuk_id: number;
  sefer_id: number;
  koltuk_no: number;
  durum: 'boş' | 'dolu';
  cinsiyet?: 'E' | 'K';
}

// Bilet türleri
export interface Bilet {
  bilet_id: number;
  sefer_id: number;
  kullanici_id: number;
  koltuk_no: number;
  ucret: number;
  satin_alma_tarihi: Date;
  durum: 'aktif' | 'iptal' | 'kullanildi';
  iptal_tarihi?: Date;
  // Joined fields
  sefer?: Sefer;
  kullanici?: Kullanici;
}

// Ödeme türleri
export interface Odeme {
  odeme_id: number;
  bilet_id: number;
  kullanici_id: number;
  tutar: number;
  odeme_tarihi: Date;
  kart_no: string;
  durum: 'başarılı' | 'başarısız' | 'iade';
}

// Form türleri
export interface BiletAramaForm {
  kalkis_il: string;
  varis_il: string;
  tarih: string;
}

export interface KullaniciKayitForm {
  ad: string;
  soyad: string;
  tc_kimlik_no: string;
  dogum_tarihi: string;
  cinsiyet: 'E' | 'K';
  telefon: string;
  email: string;
  sifre: string;
  sifre_tekrar: string;
}

export interface KullaniciGirisForm {
  email: string;
  sifre: string;
}

export interface OdemeForm {
  kart_sahibi: string;
  kart_no: string;
  son_kullanma_tarihi: string;
  cvv: string;
}

// API Response türleri
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 