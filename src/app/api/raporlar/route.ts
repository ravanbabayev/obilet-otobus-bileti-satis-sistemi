import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rapor_turu = searchParams.get('rapor_turu') || 'genel';
    const baslangic_tarihi = searchParams.get('baslangic_tarihi');
    const bitis_tarihi = searchParams.get('bitis_tarihi');
    const firma_id = searchParams.get('firma_id');

    console.log('Rapor istendi:', { rapor_turu, baslangic_tarihi, bitis_tarihi, firma_id });

    let results;

    switch (rapor_turu) {
      case 'genel':
        results = await getGenelRapor();
        break;
      case 'satis':
        results = await getSatisRaporu(baslangic_tarihi, bitis_tarihi, firma_id);
        break;
      case 'firma':
        results = await getFirmaRaporu();
        break;
      case 'sefer':
        results = await getSeferRaporu(baslangic_tarihi, bitis_tarihi, firma_id);
        break;
      case 'gunluk':
        results = await getGunlukRapor(baslangic_tarihi || new Date().toISOString().split('T')[0]);
        break;
      default:
        return NextResponse.json({ error: 'Geçersiz rapor türü' }, { status: 400 });
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('Rapor alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Rapor alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Genel Rapor - Dashboard özeti
async function getGenelRapor() {
  const queries = [
    // Toplam istatistikler
    `SELECT 
      COUNT(*) as toplam_bilet,
      COUNT(CASE WHEN bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet,
      COUNT(CASE WHEN bilet_durumu = 'IPTAL' THEN 1 END) as iptal_bilet,
      COUNT(CASE WHEN bilet_durumu = 'KULLANILDI' THEN 1 END) as kullanildi_bilet,
      SUM(CASE WHEN bilet_durumu = 'AKTIF' THEN ucret ELSE 0 END) as toplam_satis,
      AVG(CASE WHEN bilet_durumu = 'AKTIF' THEN ucret ELSE NULL END) as ortalama_bilet_fiyati
     FROM bilet`,

    // Firm istatistikleri
    `SELECT 
      COUNT(*) as toplam_firma,
      COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_firma
     FROM otobus_firmasi`,

    // Otobüs istatistikleri
    `SELECT 
      COUNT(*) as toplam_otobus,
      COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_otobus,
      SUM(koltuk_sayisi) as toplam_kapasite
     FROM otobus`,

    // Sefer istatistikleri
    `SELECT 
      COUNT(*) as toplam_sefer,
      COUNT(CASE WHEN aktif_mi = TRUE AND kalkis_tarihi > NOW() THEN 1 END) as gelecek_sefer,
      COUNT(CASE WHEN aktif_mi = TRUE AND kalkis_tarihi <= NOW() AND varis_tarihi > NOW() THEN 1 END) as devam_eden_sefer,
      COUNT(CASE WHEN aktif_mi = TRUE AND varis_tarihi <= NOW() THEN 1 END) as tamamlanan_sefer
     FROM sefer`,

    // İstasyon istatistikleri  
    `SELECT 
      COUNT(*) as toplam_istasyon,
      COUNT(CASE WHEN aktif_mi = TRUE THEN 1 END) as aktif_istasyon
     FROM istasyon`,

    // Müşteri istatistikleri
    `SELECT 
      COUNT(*) as toplam_musteri
     FROM musteri`
  ];

  const [biletStats, firmaStats, otobusStats, seferStats, istasyonStats, musteriStats] = await Promise.all(
    queries.map(query => executeQuery(query))
  );

  return {
    bilet: Array.isArray(biletStats) ? biletStats[0] : {},
    firma: Array.isArray(firmaStats) ? firmaStats[0] : {},
    otobus: Array.isArray(otobusStats) ? otobusStats[0] : {},
    sefer: Array.isArray(seferStats) ? seferStats[0] : {},
    istasyon: Array.isArray(istasyonStats) ? istasyonStats[0] : {},
    musteri: Array.isArray(musteriStats) ? musteriStats[0] : {}
  };
}

// Satış Raporu
async function getSatisRaporu(baslangicTarihi?: string | null, bitisTarihi?: string | null, firmaId?: string | null) {
  let query = `
    SELECT 
      DATE(b.bilet_tarihi) as tarih,
      COUNT(*) as bilet_sayisi,
      COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet,
      COUNT(CASE WHEN b.bilet_durumu = 'IPTAL' THEN 1 END) as iptal_bilet,
      SUM(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE 0 END) as toplam_satis,
      AVG(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE NULL END) as ortalama_fiyat,
      f.firma_adi
    FROM bilet b
    INNER JOIN sefer s ON b.sefer_id = s.sefer_id
    INNER JOIN otobus o ON s.otobus_id = o.otobus_id  
    INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (baslangicTarihi) {
    query += ` AND DATE(b.bilet_tarihi) >= ?`;
    params.push(baslangicTarihi);
  }

  if (bitisTarihi) {
    query += ` AND DATE(b.bilet_tarihi) <= ?`;
    params.push(bitisTarihi);
  }

  if (firmaId && firmaId !== 'TUMU') {
    query += ` AND f.firma_id = ?`;
    params.push(parseInt(firmaId));
  }

  query += ` GROUP BY DATE(b.bilet_tarihi), f.firma_id ORDER BY tarih DESC, f.firma_adi`;

  const results = await executeQuery(query, params);
  return Array.isArray(results) ? results : [];
}

// Firma Raporu
async function getFirmaRaporu() {
  const query = `
    SELECT 
      f.firma_id,
      f.firma_adi,
      f.aktif_mi,
      COUNT(DISTINCT o.otobus_id) as otobus_sayisi,
      COUNT(DISTINCT s.sefer_id) as sefer_sayisi,
      COUNT(CASE WHEN s.aktif_mi = TRUE AND s.kalkis_tarihi > NOW() THEN 1 END) as aktif_sefer_sayisi,
      COUNT(b.bilet_id) as toplam_bilet,
      COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet_sayisi,
      SUM(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE 0 END) as toplam_gelir,
      AVG(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE NULL END) as ortalama_bilet_fiyati
    FROM otobus_firmasi f
    LEFT JOIN otobus o ON f.firma_id = o.firma_id
    LEFT JOIN sefer s ON o.otobus_id = s.otobus_id  
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id
    GROUP BY f.firma_id
    ORDER BY toplam_gelir DESC
  `;

  const results = await executeQuery(query);
  return Array.isArray(results) ? results : [];
}

// Sefer Raporu
async function getSeferRaporu(baslangicTarihi?: string | null, bitisTarihi?: string | null, firmaId?: string | null) {
  let query = `
    SELECT 
      s.sefer_id,
      s.kalkis_tarihi,
      s.varis_tarihi,
      s.ucret as sefer_fiyati,
      s.aktif_mi,
      CASE 
        WHEN s.kalkis_tarihi > NOW() THEN 'BEKLEMEDE'
        WHEN s.kalkis_tarihi <= NOW() AND s.varis_tarihi > NOW() THEN 'DEVAM_EDIYOR'
        WHEN s.varis_tarihi <= NOW() THEN 'TAMAMLANDI'
        ELSE 'TANIMLANMAMIS'
      END as durum,
      f.firma_adi,
      o.plaka,
      o.koltuk_sayisi,
      i1.istasyon_adi as kalkis_istasyonu,
      i2.istasyon_adi as varis_istasyonu,
      COUNT(b.bilet_id) as satilan_bilet,
      COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet,
      SUM(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE 0 END) as toplam_gelir,
      (COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) * 100.0 / o.koltuk_sayisi) as doluluk_orani
    FROM sefer s
    INNER JOIN otobus o ON s.otobus_id = o.otobus_id
    INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    INNER JOIN istasyon i1 ON s.kalkis_istasyon_id = i1.istasyon_id
    INNER JOIN istasyon i2 ON s.varis_istasyon_id = i2.istasyon_id
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (baslangicTarihi) {
    query += ` AND DATE(s.kalkis_tarihi) >= ?`;
    params.push(baslangicTarihi);
  }

  if (bitisTarihi) {
    query += ` AND DATE(s.kalkis_tarihi) <= ?`;
    params.push(bitisTarihi);
  }

  if (firmaId && firmaId !== 'TUMU') {
    query += ` AND f.firma_id = ?`;
    params.push(parseInt(firmaId));
  }

  query += ` GROUP BY s.sefer_id ORDER BY s.kalkis_tarihi DESC`;

  const results = await executeQuery(query, params);
  return Array.isArray(results) ? results : [];
}

// Günlük Rapor
async function getGunlukRapor(tarih: string) {
  const queries = [
    // Günlük bilet satışları
    `SELECT 
      COUNT(*) as bilet_sayisi,
      COUNT(CASE WHEN bilet_durumu = 'AKTIF' THEN 1 END) as aktif_bilet,
      COUNT(CASE WHEN bilet_durumu = 'IPTAL' THEN 1 END) as iptal_bilet,
      SUM(CASE WHEN bilet_durumu = 'AKTIF' THEN ucret ELSE 0 END) as toplam_satis
     FROM bilet 
     WHERE DATE(bilet_tarihi) = ?`,

    // Günlük seferler
    `SELECT 
      COUNT(*) as sefer_sayisi,
      COUNT(CASE WHEN kalkis_tarihi > NOW() THEN 1 END) as gelecek_sefer,
      COUNT(CASE WHEN kalkis_tarihi <= NOW() AND varis_tarihi > NOW() THEN 1 END) as devam_eden_sefer,
      COUNT(CASE WHEN varis_tarihi <= NOW() THEN 1 END) as tamamlanan_sefer
     FROM sefer 
     WHERE DATE(kalkis_tarihi) = ? AND aktif_mi = TRUE`,

    // Saatlik satış dağılımı
    `SELECT 
      HOUR(bilet_tarihi) as saat,
      COUNT(*) as bilet_sayisi,
      SUM(CASE WHEN bilet_durumu = 'AKTIF' THEN ucret ELSE 0 END) as satis
     FROM bilet 
     WHERE DATE(bilet_tarihi) = ?
     GROUP BY HOUR(bilet_tarihi)
     ORDER BY saat`,

    // Firma bazında günlük satış
    `SELECT 
      f.firma_adi,
      COUNT(b.bilet_id) as bilet_sayisi,
      SUM(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE 0 END) as toplam_satis
     FROM bilet b
     INNER JOIN sefer s ON b.sefer_id = s.sefer_id
     INNER JOIN otobus o ON s.otobus_id = o.otobus_id
     INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
     WHERE DATE(b.bilet_tarihi) = ?
     GROUP BY f.firma_id
     ORDER BY toplam_satis DESC`
  ];

  const [biletStats, seferStats, saatlikSatis, firmaSatis] = await Promise.all(
    queries.map(query => executeQuery(query, [tarih]))
  );

  return {
    tarih,
    bilet: Array.isArray(biletStats) ? biletStats[0] : {},
    sefer: Array.isArray(seferStats) ? seferStats[0] : {},
    saatlik_satis: Array.isArray(saatlikSatis) ? saatlikSatis : [],
    firma_satis: Array.isArray(firmaSatis) ? firmaSatis : []
  };
} 