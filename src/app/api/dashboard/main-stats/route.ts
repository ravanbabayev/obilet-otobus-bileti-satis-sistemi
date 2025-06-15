import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Ana sayfa istatistikleri istendi');

    // Get all main page stats in parallel
    const [
      todayTicketStats,
      todayRevenueStats,
      activeTripStats,
      recentSalesStats
    ] = await Promise.all([
      // Bugün satılan bilet sayısı
      executeQuery(`
        SELECT COUNT(*) as bugun_satilan_bilet
        FROM bilet 
        WHERE DATE(bilet_tarihi) = CURDATE() 
        AND bilet_durumu = 'AKTIF'
      `, []),

      // Bugünkü gelir
      executeQuery(`
        SELECT COALESCE(SUM(ucret), 0) as bugun_gelir
        FROM bilet 
        WHERE DATE(bilet_tarihi) = CURDATE() 
        AND bilet_durumu = 'AKTIF'
      `, []),

      // Bugün için aktif sefer sayısı
      executeQuery(`
        SELECT COUNT(*) as aktif_sefer_sayisi
        FROM sefer 
        WHERE DATE(kalkis_tarihi) = CURDATE() 
        AND aktif_mi = TRUE
      `, []),

      // Son satışlar (son 10 satış)
      executeQuery(`
        SELECT 
          b.bilet_id,
          CONCAT(m.ad, ' ', m.soyad) as musteri_adi,
          CONCAT(ks.il, ' → ', vs.il) as sefer_bilgisi,
          b.ucret,
          TIME(b.bilet_tarihi) as satis_zamani,
          b.bilet_tarihi
        FROM bilet b
        INNER JOIN musteri m ON b.musteri_id = m.musteri_id
        INNER JOIN sefer s ON b.sefer_id = s.sefer_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE b.bilet_durumu = 'AKTIF'
        ORDER BY b.bilet_tarihi DESC
        LIMIT 10
      `, [])
    ]);

    const mainStats = {
      bugunSatilanBilet: todayTicketStats[0]?.bugun_satilan_bilet || 0,
      bugunGelir: todayRevenueStats[0]?.bugun_gelir || 0,
      aktifSeferSayisi: activeTripStats[0]?.aktif_sefer_sayisi || 0,
      bekleyenMusteriler: 0, // Bu statik kalabilir veya başka bir mantık eklenebilir
      recentSales: recentSalesStats || []
    };

    console.log('Ana sayfa istatistikleri başarıyla alındı:', {
      bilet: mainStats.bugunSatilanBilet,
      gelir: mainStats.bugunGelir,
      sefer: mainStats.aktifSeferSayisi,
      sonSatis: mainStats.recentSales.length
    });

    return NextResponse.json({
      success: true,
      data: mainStats
    });

  } catch (error) {
    console.error('Ana sayfa istatistikleri alınırken hata:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ana sayfa istatistikleri alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 