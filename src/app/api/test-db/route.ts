import { NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

export async function GET() {
  try {
    // Test bağlantısı
    const result = await executeQuery('SELECT COUNT(*) as count FROM otobus_firmasi WHERE aktif_mi = TRUE');
    const count = Array.isArray(result) && result.length > 0 ? (result[0] as any).count : 0;
    
    // Saklı yordamları test et
    let spTestResults = [];
    
    try {
      // sp_sefer_tumunu_getir test
      const seferResult = await executeStoredProcedure('sp_sefer_tumunu_getir', ['', 'TUMU', 0, null]);
      spTestResults.push({ name: 'sp_sefer_tumunu_getir', status: 'OK', count: Array.isArray(seferResult) ? seferResult.length : 0 });
    } catch (e) {
      spTestResults.push({ name: 'sp_sefer_tumunu_getir', status: 'NOT FOUND', error: (e as Error).message });
    }

    try {
      // sp_otobus_tumunu_getir test
      const otobusResult = await executeStoredProcedure('sp_otobus_tumunu_getir', [0]);
      spTestResults.push({ name: 'sp_otobus_tumunu_getir', status: 'OK', count: Array.isArray(otobusResult) ? otobusResult.length : 0 });
    } catch (e) {
      spTestResults.push({ name: 'sp_otobus_tumunu_getir', status: 'NOT FOUND', error: (e as Error).message });
    }

    try {
      // sp_firma_tumunu_getir test
      const firmaResult = await executeStoredProcedure('sp_firma_tumunu_getir', ['', 'AKTIF']);
      spTestResults.push({ name: 'sp_firma_tumunu_getir', status: 'OK', count: Array.isArray(firmaResult) ? firmaResult.length : 0 });
    } catch (e) {
      spTestResults.push({ name: 'sp_firma_tumunu_getir', status: 'NOT FOUND', error: (e as Error).message });
    }

    return NextResponse.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı',
      activeCompanies: count,
      storedProcedures: spTestResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Veritabanı testi hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Veritabanı bağlantısı başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Saklı yordamları oluşturmak için POST endpoint
export async function POST() {
  try {
    const procedures = [
      {
        name: 'sp_bilet_tumunu_getir',
        sql: `
          CREATE PROCEDURE sp_bilet_tumunu_getir(
              IN p_search VARCHAR(255),
              IN p_durum VARCHAR(20),
              IN p_firma_id INT,
              IN p_tarih DATE
          )
          BEGIN
              SELECT
                b.bilet_id,
                b.musteri_id,
                b.sefer_id,
                b.koltuk_no,
                DATE(b.bilet_tarihi) as bilet_tarihi,
                TIME(b.bilet_tarihi) as bilet_saati,
                b.bilet_durumu,
                b.ucret,
                b.satis_yapan_personel,
                b.notlar,
                b.created_at,
                b.updated_at,
                m.ad as musteri_ad,
                m.soyad as musteri_soyad,
                m.tc_kimlik_no,
                m.telefon as musteri_telefon,
                m.email as musteri_email,
                DATE(s.kalkis_tarihi) as kalkis_tarihi,
                TIME(s.kalkis_tarihi) as kalkis_saati,
                DATE(s.varis_tarihi) as varis_tarihi,
                TIME(s.varis_tarihi) as varis_saati,
                o.plaka,
                f.firma_adi,
                ks.istasyon_adi as kalkis_istasyon,
                ks.il as kalkis_il,
                ks.ilce as kalkis_ilce,
                vs.istasyon_adi as varis_istasyon,
                vs.il as varis_il,
                vs.ilce as varis_ilce
              FROM bilet b
              INNER JOIN musteri m ON b.musteri_id = m.musteri_id
              INNER JOIN sefer s ON b.sefer_id = s.sefer_id
              INNER JOIN otobus o ON s.otobus_id = o.otobus_id
              INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
              INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
              INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
              WHERE 1=1
                AND (p_search IS NULL OR p_search = '' OR 
                     m.ad LIKE CONCAT('%', p_search, '%') OR
                     m.soyad LIKE CONCAT('%', p_search, '%') OR
                     m.tc_kimlik_no LIKE CONCAT('%', p_search, '%') OR
                     o.plaka LIKE CONCAT('%', p_search, '%') OR
                     f.firma_adi LIKE CONCAT('%', p_search, '%') OR
                     ks.il LIKE CONCAT('%', p_search, '%') OR
                     vs.il LIKE CONCAT('%', p_search, '%'))
                AND (p_durum IS NULL OR p_durum = 'TUMU' OR b.bilet_durumu = p_durum)
                AND (p_firma_id IS NULL OR p_firma_id = 0 OR f.firma_id = p_firma_id)
                AND (p_tarih IS NULL OR DATE(b.bilet_tarihi) = p_tarih)
              ORDER BY b.bilet_tarihi DESC, b.bilet_id DESC;
          END`
      },
      {
        name: 'sp_bilet_detay',
        sql: `
          CREATE PROCEDURE sp_bilet_detay(
              IN p_bilet_id INT
          )
          BEGIN
              SELECT
                b.bilet_id,
                b.musteri_id,
                b.sefer_id,
                b.koltuk_no,
                b.bilet_tarihi,
                b.bilet_durumu,
                b.ucret,
                b.satis_yapan_personel,
                b.notlar,
                b.created_at,
                b.updated_at,
                m.ad as musteri_ad,
                m.soyad as musteri_soyad,
                m.tc_kimlik_no,
                m.telefon as musteri_telefon,
                m.email as musteri_email,
                s.kalkis_tarihi,
                s.varis_tarihi,
                s.ucret as sefer_ucret,
                o.plaka,
                o.model,
                o.koltuk_sayisi,
                f.firma_adi,
                f.telefon as firma_telefon,
                ks.istasyon_adi as kalkis_istasyon,
                ks.il as kalkis_il,
                ks.ilce as kalkis_ilce,
                ks.adres as kalkis_adres,
                vs.istasyon_adi as varis_istasyon,
                vs.il as varis_il,
                vs.ilce as varis_ilce,
                vs.adres as varis_adres,
                od.odeme_id,
                od.tutar as odeme_tutar,
                od.odeme_tarihi,
                od.odeme_turu,
                od.durum as odeme_durum
              FROM bilet b
              INNER JOIN musteri m ON b.musteri_id = m.musteri_id
              INNER JOIN sefer s ON b.sefer_id = s.sefer_id
              INNER JOIN otobus o ON s.otobus_id = o.otobus_id
              INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
              INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
              INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
              LEFT JOIN odeme od ON b.bilet_id = od.bilet_id
              WHERE b.bilet_id = p_bilet_id;
          END`
      },
      {
        name: 'sp_bilet_iptal',
        sql: `
          CREATE PROCEDURE sp_bilet_iptal(
              IN p_bilet_id INT
          )
          BEGIN
              DECLARE v_bilet_durumu VARCHAR(10);
              DECLARE v_sefer_tarihi DATETIME;
              DECLARE v_iptal_suresi INT;
              DECLARE v_ucret DECIMAL(10,2);
              DECLARE v_error_msg VARCHAR(255);
              
              DECLARE EXIT HANDLER FOR SQLEXCEPTION
              BEGIN
                  ROLLBACK;
                  GET DIAGNOSTICS CONDITION 1
                      v_error_msg = MESSAGE_TEXT;
                  SELECT 'HATA' AS durum, v_error_msg AS mesaj;
              END;
              
              START TRANSACTION;
              
              SELECT b.bilet_durumu, s.kalkis_tarihi, b.ucret
              INTO v_bilet_durumu, v_sefer_tarihi, v_ucret
              FROM bilet b
              JOIN sefer s ON b.sefer_id = s.sefer_id
              WHERE b.bilet_id = p_bilet_id;
              
              IF v_bilet_durumu IS NULL THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Bilet bulunamadı.';
              END IF;
              
              IF v_bilet_durumu != 'AKTIF' THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Bu bilet zaten iptal edilmiş veya kullanılmış.';
              END IF;
              
              SET v_iptal_suresi = TIMESTAMPDIFF(HOUR, NOW(), v_sefer_tarihi);
              
              IF v_iptal_suresi < 2 THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Kalkıştan 2 saat önceye kadar iptal edilebilir.';
              END IF;
              
              UPDATE bilet
              SET 
                  bilet_durumu = 'IPTAL',
                  notlar = CONCAT(IFNULL(notlar, ''), '\\nİPTAL EDİLDİ: ', NOW())
              WHERE bilet_id = p_bilet_id;
              
              INSERT INTO odeme (
                  bilet_id,
                  tutar,
                  odeme_turu,
                  durum,
                  aciklama
              ) VALUES (
                  p_bilet_id,
                  v_ucret,
                  'NAKİT',
                  'İADE',
                  'Bilet iptali nedeniyle iade'
              );
              
              COMMIT;
              
              SELECT 'BAŞARILI' AS durum, 'Bilet başarıyla iptal edildi.' AS mesaj;
          END`
      },
      {
        name: 'sp_sefer_tumunu_getir',
        sql: `
          CREATE PROCEDURE sp_sefer_tumunu_getir(
              IN p_search VARCHAR(255),
              IN p_durum VARCHAR(20),
              IN p_firma_id INT,
              IN p_tarih DATE
          )
          BEGIN
              SELECT
                s.sefer_id,
                DATE(s.kalkis_tarihi) as kalkis_tarihi,
                TIME(s.kalkis_tarihi) as kalkis_saati,
                DATE(s.varis_tarihi) as varis_tarihi,
                TIME(s.varis_tarihi) as varis_saati,
                s.ucret as fiyat,
                s.aktif_mi,
                s.created_at,
                s.updated_at,
                o.plaka,
                o.koltuk_sayisi,
                f.firma_adi,
                ks.il as kalkis_il,
                ks.ilce as kalkis_ilce,
                vs.il as varis_il,
                vs.ilce as varis_ilce,
                COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as satilan_koltuk,
                (o.koltuk_sayisi - COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END)) as bos_koltuk
              FROM sefer s
              INNER JOIN otobus o ON s.otobus_id = o.otobus_id
              INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
              INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
              INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
              LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND b.bilet_durumu != 'IPTAL'
              WHERE 1=1
                AND (p_search IS NULL OR p_search = '' OR 
                     f.firma_adi LIKE CONCAT('%', p_search, '%') OR
                     o.plaka LIKE CONCAT('%', p_search, '%') OR
                     ks.il LIKE CONCAT('%', p_search, '%') OR
                     vs.il LIKE CONCAT('%', p_search, '%'))
                AND (p_durum IS NULL OR p_durum = 'TUMU' OR 
                     (p_durum = 'AKTIF' AND s.aktif_mi = TRUE) OR
                     (p_durum = 'PASIF' AND s.aktif_mi = FALSE))
                AND (p_firma_id IS NULL OR p_firma_id = 0 OR o.firma_id = p_firma_id)
                AND (p_tarih IS NULL OR DATE(s.kalkis_tarihi) = p_tarih)
              GROUP BY s.sefer_id
              ORDER BY s.kalkis_tarihi DESC;
          END`
      },
      {
        name: 'sp_otobus_tumunu_getir',
        sql: `
          CREATE PROCEDURE sp_otobus_tumunu_getir(
              IN p_firma_id INT
          )
          BEGIN
              SELECT 
                  o.otobus_id,
                  o.plaka,
                  o.model,
                  o.koltuk_sayisi,
                  o.ozellikler,
                  o.aktif_mi,
                  f.firma_id,
                  f.firma_adi
              FROM otobus o
              INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
              WHERE (p_firma_id IS NULL OR p_firma_id = 0 OR o.firma_id = p_firma_id)
                AND o.aktif_mi = TRUE
              ORDER BY f.firma_adi, o.plaka;
          END`
      },
      {
        name: 'sp_sefer_guncelle',
        sql: `
          CREATE PROCEDURE sp_sefer_guncelle(
              IN p_sefer_id INT,
              IN p_otobus_id INT,
              IN p_kalkis_istasyon_id INT,
              IN p_varis_istasyon_id INT,
              IN p_kalkis_tarihi DATETIME,
              IN p_varis_tarihi DATETIME,
              IN p_ucret DECIMAL(10, 2)
          )
          BEGIN
              DECLARE v_error_msg VARCHAR(255);
              DECLARE v_affected_rows INT;
              
              DECLARE EXIT HANDLER FOR SQLEXCEPTION
              BEGIN
                  ROLLBACK;
                  GET DIAGNOSTICS CONDITION 1
                      v_error_msg = MESSAGE_TEXT;
                  SELECT 'HATA' AS durum, v_error_msg AS mesaj;
              END;
              
              START TRANSACTION;
              
              IF p_kalkis_istasyon_id = p_varis_istasyon_id THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Kalkış ve varış istasyonları aynı olamaz.';
              END IF;
              
              IF p_varis_tarihi <= p_kalkis_tarihi THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Varış tarihi kalkış tarihinden sonra olmalıdır.';
              END IF;
              
              IF NOT EXISTS (SELECT 1 FROM sefer WHERE sefer_id = p_sefer_id) THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Sefer bulunamadı.';
              END IF;
              
              UPDATE sefer SET
                  otobus_id = p_otobus_id,
                  kalkis_istasyon_id = p_kalkis_istasyon_id,
                  varis_istasyon_id = p_varis_istasyon_id,
                  kalkis_tarihi = p_kalkis_tarihi,
                  varis_tarihi = p_varis_tarihi,
                  ucret = p_ucret,
                  updated_at = CURRENT_TIMESTAMP
              WHERE sefer_id = p_sefer_id;
              
              SET v_affected_rows = ROW_COUNT();
              
              IF v_affected_rows = 0 THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Sefer güncellenemedi.';
              END IF;
              
              COMMIT;
              
              SELECT 'BAŞARILI' AS durum, 'Sefer başarıyla güncellendi.' AS mesaj;
          END`
      },
      {
        name: 'sp_sefer_sil',
        sql: `
          CREATE PROCEDURE sp_sefer_sil(
              IN p_sefer_id INT
          )
          BEGIN
              DECLARE v_error_msg VARCHAR(255);
              DECLARE v_bilet_sayisi INT;
              
              DECLARE EXIT HANDLER FOR SQLEXCEPTION
              BEGIN
                  ROLLBACK;
                  GET DIAGNOSTICS CONDITION 1
                      v_error_msg = MESSAGE_TEXT;
                  SELECT 'HATA' AS durum, v_error_msg AS mesaj;
              END;
              
              START TRANSACTION;
              
              IF NOT EXISTS (SELECT 1 FROM sefer WHERE sefer_id = p_sefer_id) THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Sefer bulunamadı.';
              END IF;
              
              SELECT COUNT(*) INTO v_bilet_sayisi
              FROM bilet
              WHERE sefer_id = p_sefer_id AND bilet_durumu = 'AKTIF';
              
              IF v_bilet_sayisi > 0 THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Bu sefere ait aktif biletler var. Önce biletleri iptal edin.';
              END IF;
              
              DELETE FROM sefer WHERE sefer_id = p_sefer_id;
              
              COMMIT;
              
              SELECT 'BAŞARILI' AS durum, 'Sefer başarıyla silindi.' AS mesaj;
          END`
      }
    ];

    const results = [];

    for (const proc of procedures) {
      try {
        // Önce mevcut prosedürü sil
        await executeQuery(`DROP PROCEDURE IF EXISTS ${proc.name}`);
        
        // Yeni prosedürü oluştur
        await executeQuery(proc.sql);
        
        results.push({ 
          name: proc.name, 
          status: 'CREATED',
          message: 'Başarıyla oluşturuldu'
        });
      } catch (error) {
        results.push({ 
          name: proc.name, 
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Saklı yordamlar oluşturuldu',
      results
    });
    
  } catch (error) {
    console.error('Saklı yordam oluşturma hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Saklı yordamlar oluşturulamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 