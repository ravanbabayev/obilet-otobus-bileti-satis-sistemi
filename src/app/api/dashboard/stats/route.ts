import { NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

export async function GET() {
  try {
    console.log('Dashboard istatistikleri istendi');

    // Tüm istatistikleri stored procedure'lar ile paralel olarak al
    const [
      seferStats,
      biletStats, 
      musteriStats,
      firmaStats,
      istasyonStats,
      aracStats
    ] = await Promise.all([
      // Sefer istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_sefer_tumunu_getir', ['', 'TUMU', 0, null]),
      
      // Bilet istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_bilet_tumunu_getir', ['', 'TUMU', 0, null]),

      // Müşteri istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_musteri_tumunu_getir', ['']),

      // Firma istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_firma_tumunu_getir', ['', 'TUMU']),

      // İstasyon istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_istasyon_tumunu_getir', ['', '', 'TUMU']),

      // Araç istatistikleri için stored procedure kullan
      executeStoredProcedure('sp_otobus_tumunu_getir', [0])
    ]);

    // Sefer istatistiklerini hesapla
    const seferData = Array.isArray(seferStats) ? seferStats : [];
    const aktifSeferler = seferData.filter(s => s.aktif_mi === 1 || s.aktif_mi === true);
    const beklemedeSeferler = aktifSeferler.filter(s => {
      const kalkisZamani = new Date(s.kalkis_tarihi + ' ' + (s.kalkis_saati || '00:00:00'));
      const varisZamani = new Date(s.varis_tarihi + ' ' + (s.varis_saati || '23:59:59'));
      const simdi = new Date();
      return kalkisZamani > simdi;
    });

    // Bilet istatistiklerini hesapla
    const biletData = Array.isArray(biletStats) ? biletStats : [];
    const aktifBiletler = biletData.filter(b => b.bilet_durumu === 'AKTIF');
    const iptalBiletler = biletData.filter(b => b.bilet_durumu === 'IPTAL');
    const kullanildiBiletler = biletData.filter(b => b.bilet_durumu === 'KULLANILDI');

    // Diğer istatistikleri hesapla
    const musteriData = Array.isArray(musteriStats) ? musteriStats : [];
    const firmaData = Array.isArray(firmaStats) ? firmaStats : [];
    const istasyonData = Array.isArray(istasyonStats) ? istasyonStats : [];
    const aracData = Array.isArray(aracStats) ? aracStats : [];

    const aktifFirmalar = firmaData.filter(f => f.aktif_mi === 1 || f.aktif_mi === true);
    const aktifIstasyonlar = istasyonData.filter(i => i.aktif_mi === 1 || i.aktif_mi === true);
    const aktifAraclar = aracData.filter(a => a.aktif_mi === 1 || a.aktif_mi === true);

    const dashboardStats = {
      seferler: {
        toplam: seferData.length,
        aktif: aktifSeferler.length,
        beklemede: beklemedeSeferler.length
      },
      biletler: {
        toplam: biletData.length,
        aktif: aktifBiletler.length,
        iptal: iptalBiletler.length,
        kullanildi: kullanildiBiletler.length
      },
      musteriler: {
        toplam: musteriData.length
      },
      firmalar: {
        toplam: firmaData.length,
        aktif: aktifFirmalar.length
      },
      istasyonlar: {
        toplam: istasyonData.length,
        aktif: aktifIstasyonlar.length
      },
      araclar: {
        toplam: aracData.length,
        aktif: aktifAraclar.length
      }
    };

    console.log('Dashboard istatistikleri başarıyla alındı:', dashboardStats);
    return NextResponse.json(dashboardStats);

  } catch (error: any) {
    console.error('Dashboard istatistikleri hatası:', error);
    return NextResponse.json(
      { error: 'Dashboard istatistikleri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 