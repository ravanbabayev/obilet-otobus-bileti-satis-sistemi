import { NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Dashboard istatistikleri istendi');

    // Get all stats in parallel for better performance
    const [
      seferStats,
      biletStats, 
      musteriStats,
      firmaStats,
      istasyonStats,
      aracStats
    ] = await Promise.all([
      // Sefer istatistikleri
      executeQuery(`
        SELECT 
          COUNT(*) as toplam_sefer,
          COUNT(CASE WHEN aktif_mi = TRUE AND kalkis_tarihi > NOW() THEN 1 END) as aktif_sefer,
          COUNT(CASE WHEN 
            CASE
              WHEN varis_tarihi < NOW() THEN 'TAMAMLANDI'
              WHEN kalkis_tarihi <= NOW() AND varis_tarihi > NOW() THEN 'DEVAM_EDIYOR'
              WHEN aktif_mi = FALSE THEN 'PASIF'
              ELSE 'BEKLEMEDE'
            END = 'BEKLEMEDE' THEN 1 END) as beklemede_sefer
        FROM sefer
      `, []),

      // Bilet istatistikleri
      executeQuery(`
        SELECT 
          COUNT(*) as toplam_bilet,
          COUNT(CASE WHEN bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet,
          COUNT(CASE WHEN bilet_durumu = 'IPTAL' THEN 1 END) as iptal_bilet,
          COUNT(CASE WHEN bilet_durumu = 'KULLANILDI' THEN 1 END) as kullanildi_bilet
        FROM bilet
      `, []),

      // Müşteri istatistikleri  
      executeQuery(`
        SELECT COUNT(*) as toplam_musteri
        FROM musteri
      `, []),

      // Firma istatistikleri
      executeQuery(`
        SELECT 
          COUNT(*) as toplam_firma,
          COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_firma
        FROM otobus_firmasi
      `, []),

      // İstasyon istatistikleri
      executeQuery(`
        SELECT 
          COUNT(*) as toplam_istasyon,
          COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_istasyon
        FROM istasyon
      `, []),

      // Araç istatistikleri
      executeQuery(`
        SELECT 
          COUNT(*) as toplam_arac,
          COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_arac
        FROM otobus
      `, [])
    ]);

    const dashboardStats = {
      seferler: {
        toplam: seferStats[0]?.toplam_sefer || 0,
        aktif: seferStats[0]?.aktif_sefer || 0,
        beklemede: seferStats[0]?.beklemede_sefer || 0
      },
      biletler: {
        toplam: biletStats[0]?.toplam_bilet || 0,
        aktif: biletStats[0]?.aktif_bilet || 0,
        iptal: biletStats[0]?.iptal_bilet || 0,
        kullanildi: biletStats[0]?.kullanildi_bilet || 0
      },
      musteriler: {
        toplam: musteriStats[0]?.toplam_musteri || 0
      },
      firmalar: {
        toplam: firmaStats[0]?.toplam_firma || 0,
        aktif: firmaStats[0]?.aktif_firma || 0
      },
      istasyonlar: {
        toplam: istasyonStats[0]?.toplam_istasyon || 0,
        aktif: istasyonStats[0]?.aktif_istasyon || 0
      },
      araclar: {
        toplam: aracStats[0]?.toplam_arac || 0,
        aktif: aracStats[0]?.aktif_arac || 0
      }
    };

    console.log('Dashboard istatistikleri başarıyla alındı:', dashboardStats);

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Dashboard istatistikleri alınırken hata:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Dashboard istatistikleri alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 