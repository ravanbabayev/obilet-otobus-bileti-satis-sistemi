import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// Bilet satın alma işlemi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Bilet satın alma isteği:', body);

    // Frontend'den gelen format
    const { 
      sefer_id,
      koltuk_no,
      musteri_ad,
      musteri_soyad,
      musteri_tc,
      musteri_telefon,
      musteri_email,
      cinsiyet,
      odeme_turu,
      personel_adi,
      notlar
    } = body;

    // Validasyon
    if (!sefer_id || !koltuk_no || !musteri_ad || !musteri_soyad || !musteri_tc || !musteri_telefon || !odeme_turu) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır' }, 
        { status: 400 }
      );
    }

    // Koltuk numarasını array'e çevir
    const secili_koltuklar = [koltuk_no];
    
    // Müşteri bilgilerini düzenle
    const ad = musteri_ad;
    const soyad = musteri_soyad;
    const tc_kimlik_no = musteri_tc;
    const telefon = musteri_telefon;
    const email = musteri_email;

    // TC Kimlik No validasyonu
    if (!/^[1-9][0-9]{10}$/.test(tc_kimlik_no)) {
      return NextResponse.json(
        { error: 'Geçersiz TC Kimlik No' }, 
        { status: 400 }
      );
    }

    // Telefon validasyonu
    const cleanPhone = telefon.replace(/[^\d]/g, '');
    if (!/^(5\d{9}|0[0-9]{10})$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Geçersiz telefon numarası' }, 
        { status: 400 }
      );
    }

    // Sefer bilgilerini al
    const seferQuery = `
      SELECT s.sefer_id, s.kalkis_tarihi, s.varis_tarihi, s.ucret, s.aktif_mi,
             o.koltuk_sayisi, f.firma_adi,
             CASE 
               WHEN s.varis_tarihi < NOW() THEN 'TAMAMLANDI'
               WHEN s.kalkis_tarihi <= NOW() AND s.varis_tarihi > NOW() THEN 'DEVAM_EDIYOR'
               WHEN s.aktif_mi = FALSE THEN 'PASIF'
               ELSE 'BEKLEMEDE'
             END as sefer_durumu
      FROM sefer s
      INNER JOIN otobus o ON s.otobus_id = o.otobus_id
      INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
      WHERE s.sefer_id = ?
    `;

    const seferResult = await executeQuery(seferQuery, [sefer_id]);

    if (!Array.isArray(seferResult) || seferResult.length === 0) {
      return NextResponse.json(
        { error: 'Sefer bulunamadı' }, 
        { status: 400 }
      );
    }

    const sefer = seferResult[0] as any;

    if (!sefer.aktif_mi) {
      return NextResponse.json(
        { error: 'Sefer aktif değil' }, 
        { status: 400 }
      );
    }

    // Sefer durumu kontrolü
    if (sefer.sefer_durumu === 'TAMAMLANDI') {
      return NextResponse.json(
        { error: 'Tamamlanan seferlere bilet satılamaz' }, 
        { status: 400 }
      );
    }

    if (sefer.sefer_durumu === 'DEVAM_EDIYOR') {
      return NextResponse.json(
        { error: 'Devam eden seferlere bilet satılamaz' }, 
        { status: 400 }
      );
    }

    // Geçmiş sefer kontrolü (ek güvenlik)
    const kalkisZamani = new Date(sefer.kalkis_tarihi);
    const simdikiZaman = new Date();
    if (kalkisZamani <= simdikiZaman) {
      return NextResponse.json(
        { error: 'Geçmiş seferlere bilet satılamaz' }, 
        { status: 400 }
      );
    }

    // Koltuk validasyonu
    for (const koltukNo of secili_koltuklar) {
      if (koltukNo < 1 || koltukNo > sefer.koltuk_sayisi) {
        return NextResponse.json(
          { error: `Koltuk numarası 1-${sefer.koltuk_sayisi} aralığında olmalıdır` }, 
          { status: 400 }
        );
      }
    }

    // Koltuk müsaitlik kontrolü
    const doluKoltuklar = await executeQuery(
      `SELECT koltuk_no FROM bilet 
       WHERE sefer_id = ? AND koltuk_no IN (${secili_koltuklar.map(() => '?').join(',')}) 
       AND bilet_durumu = 'AKTIF'`,
      [sefer_id, ...secili_koltuklar]
    );

    if (Array.isArray(doluKoltuklar) && doluKoltuklar.length > 0) {
      const doluKoltukNoları = doluKoltuklar.map((k: any) => k.koltuk_no);
      return NextResponse.json(
        { error: `Bu koltuklar zaten satılmış: ${doluKoltukNoları.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Müşteri var mı kontrol et, yoksa ekle
    let musteri_id;
    const existingMusteri = await executeQuery(
      'SELECT musteri_id FROM musteri WHERE tc_kimlik_no = ?',
      [tc_kimlik_no]
    );

    if (Array.isArray(existingMusteri) && existingMusteri.length > 0) {
      musteri_id = (existingMusteri[0] as any).musteri_id;

      // Müşteri bilgilerini güncelle
      await executeQuery(
        `UPDATE musteri 
         SET ad = ?, soyad = ?, telefon = ?, email = ?
         WHERE musteri_id = ?`,
        [ad, soyad, telefon, email || null, musteri_id]
      );
    } else {
      // Yeni müşteri ekle
      const musteriResult: any = await executeQuery(
        `INSERT INTO musteri (ad, soyad, tc_kimlik_no, telefon, email) 
         VALUES (?, ?, ?, ?, ?)`,
        [ad, soyad, tc_kimlik_no, telefon, email || null]
      );
      musteri_id = musteriResult.insertId;
    }

    // Biletleri sat
    const satilan_biletler = [];
    const toplam_ucret = sefer.ucret * secili_koltuklar.length;

    for (const koltukNo of secili_koltuklar) {
      const biletResult: any = await executeQuery(
        `INSERT INTO bilet (
          musteri_id, sefer_id, koltuk_no, ucret, 
          satis_yapan_personel, notlar, bilet_durumu
        ) VALUES (?, ?, ?, ?, ?, ?, 'AKTIF')`,
        [musteri_id, sefer_id, koltukNo, sefer.ucret, personel_adi || 'Yazıhane Personeli', notlar || null]
      );

      const bilet_id = biletResult.insertId;

      // Ödeme kaydı ekle
      await executeQuery(
        `INSERT INTO odeme (
          bilet_id, tutar, odeme_turu, durum
        ) VALUES (?, ?, ?, 'BAŞARILI')`,
        [bilet_id, sefer.ucret, odeme_turu]
      );

      satilan_biletler.push({
        bilet_id: bilet_id,
        koltuk_no: koltukNo,
        ucret: sefer.ucret
      });
    }

    console.log('Biletler başarıyla satıldı:', satilan_biletler);

    return NextResponse.json({
      success: true,
      message: `${secili_koltuklar.length} adet bilet başarıyla satıldı.`,
      musteri_id: musteri_id,
      satilan_biletler: satilan_biletler,
      toplam_ucret: toplam_ucret
    });

  } catch (error) {
    console.error('Bilet satın alma hatası:', error);
    return NextResponse.json({ 
      error: 'Bilet satın alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

