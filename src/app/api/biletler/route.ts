import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// Bilet listesi getirme
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const durum = searchParams.get('durum') || 'TUMU';
    const tarih = searchParams.get('tarih') || '';
    const firma_id = searchParams.get('firma_id') || 'TUMU';

    console.log('Bilet listesi istendi:', { search, durum, tarih, firma_id });

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_bilet_tumunu_getir', [
        search,
        durum,
        firma_id === 'TUMU' ? 0 : parseInt(firma_id),
        tarih || null
      ]);

      if (Array.isArray(storedProcResult)) {
        console.log('Saklı yordam ile bilet listesi alındı:', storedProcResult.length);
        return NextResponse.json(storedProcResult);
      }
    } catch (spError) {
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
    }

    // Fallback query
    let query = `
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
    `;

    const params: any[] = [];

    // Arama filtresi
    if (search && search.trim() !== '') {
      query += ` AND (
        m.ad LIKE CONCAT('%', ?, '%') OR
        m.soyad LIKE CONCAT('%', ?, '%') OR
        m.tc_kimlik_no LIKE CONCAT('%', ?, '%') OR
        o.plaka LIKE CONCAT('%', ?, '%') OR
        f.firma_adi LIKE CONCAT('%', ?, '%') OR
        ks.il LIKE CONCAT('%', ?, '%') OR
        vs.il LIKE CONCAT('%', ?, '%')
      )`;
      for (let i = 0; i < 7; i++) {
        params.push(search);
      }
    }

    // Durum filtresi
    if (durum && durum !== 'TUMU') {
      query += ` AND b.bilet_durumu = ?`;
      params.push(durum);
    }

    // Firma filtresi
    if (firma_id && firma_id !== 'TUMU') {
      query += ` AND f.firma_id = ?`;
      params.push(parseInt(firma_id));
    }

    // Tarih filtresi
    if (tarih && tarih.trim() !== '') {
      query += ` AND DATE(b.bilet_tarihi) = ?`;
      params.push(tarih);
    }

    query += ` ORDER BY b.bilet_tarihi DESC, b.bilet_id DESC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const results = await executeQuery(query, params);
    console.log('Query sonucu:', Array.isArray(results) ? results.length : 'Not array');
    return NextResponse.json(results || []);

  } catch (error) {
    console.error('Bilet listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Bilet listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Bilet ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      musteri_id,
      sefer_id,
      koltuk_no,
      ucret,
      satis_yapan_personel,
      odeme_turu,
      notlar
    } = body;

    console.log('Bilet ekleme isteği:', body);

    // Validasyon
    if (!musteri_id || !sefer_id || !koltuk_no || !ucret || !satis_yapan_personel || !odeme_turu) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır' }, 
        { status: 400 }
      );
    }

    // Ücret kontrolü
    if (parseFloat(ucret) <= 0) {
      return NextResponse.json(
        { error: 'Ücret 0\'dan büyük olmalıdır' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_bilet_sat', [
        musteri_id,
        sefer_id,
        koltuk_no,
        ucret,
        satis_yapan_personel,
        odeme_turu,
        notlar || null
      ]);

      if (Array.isArray(storedProcResult) && storedProcResult.length > 0 && (storedProcResult[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (storedProcResult[0] as any).mesaj,
          bilet_id: (storedProcResult[0] as any).bilet_id
        });
      } else {
        return NextResponse.json(
          { error: (storedProcResult as any)?.[0]?.mesaj || 'Bilet satışında hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Koltuk müsait mi kontrolü
      const existingTicket = await executeQuery(
        `SELECT bilet_id FROM bilet 
         WHERE sefer_id = ? AND koltuk_no = ? AND bilet_durumu = 'AKTIF'`,
        [sefer_id, koltuk_no]
      );

      if (Array.isArray(existingTicket) && existingTicket.length > 0) {
        return NextResponse.json(
          { error: 'Bu koltuk zaten satılmış.' }, 
          { status: 400 }
        );
      }

      // Sefer kontrolü
      const seferControl = await executeQuery(
        `SELECT s.sefer_id, s.aktif_mi, s.kalkis_tarihi, o.koltuk_sayisi 
         FROM sefer s 
         INNER JOIN otobus o ON s.otobus_id = o.otobus_id 
         WHERE s.sefer_id = ?`,
        [sefer_id]
      );

      if (!Array.isArray(seferControl) || seferControl.length === 0) {
        return NextResponse.json(
          { error: 'Sefer bulunamadı.' }, 
          { status: 400 }
        );
      }

      const sefer = seferControl[0] as any;
      if (!sefer.aktif_mi) {
        return NextResponse.json(
          { error: 'Sefer aktif değil.' }, 
          { status: 400 }
        );
      }

      // Kalkış zamanı kontrolü
      const kalkisZamani = new Date(sefer.kalkis_tarihi);
      const simdikiZaman = new Date();
      if (kalkisZamani <= simdikiZaman) {
        return NextResponse.json(
          { error: 'Geçmiş seferlere bilet satılamaz.' }, 
          { status: 400 }
        );
      }

      // Koltuk numarası kontrolü
      if (koltuk_no < 1 || koltuk_no > sefer.koltuk_sayisi) {
        return NextResponse.json(
          { error: `Koltuk numarası 1-${sefer.koltuk_sayisi} aralığında olmalıdır.` }, 
          { status: 400 }
        );
      }

      // Müşteri kontrolü
      const musteriControl = await executeQuery(
        'SELECT musteri_id FROM musteri WHERE musteri_id = ?',
        [musteri_id]
      );

      if (!Array.isArray(musteriControl) || musteriControl.length === 0) {
        return NextResponse.json(
          { error: 'Müşteri bulunamadı.' }, 
          { status: 400 }
        );
      }

      // Bilet ekleme
      console.log('Bilet ekleniyor...');
      const result: any = await executeQuery(
        `INSERT INTO bilet (
          musteri_id, sefer_id, koltuk_no, ucret, 
          satis_yapan_personel, notlar, bilet_durumu
        ) VALUES (?, ?, ?, ?, ?, ?, 'AKTIF')`,
        [musteri_id, sefer_id, koltuk_no, ucret, satis_yapan_personel, notlar || null]
      );

      const bilet_id = result.insertId;

      // Ödeme kaydı ekleme
      await executeQuery(
        `INSERT INTO odeme (
          bilet_id, tutar, odeme_turu, durum
        ) VALUES (?, ?, ?, 'BAŞARILI')`,
        [bilet_id, ucret, odeme_turu]
      );

      console.log('Bilet başarıyla satıldı, ID:', bilet_id);

      return NextResponse.json({
        success: true,
        message: 'Bilet başarıyla satıldı.',
        bilet_id: bilet_id
      });
    }

  } catch (error) {
    console.error('Bilet satışında hata:', error);
    return NextResponse.json({ 
      error: 'Bilet satılamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 