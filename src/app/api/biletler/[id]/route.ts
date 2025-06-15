import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// Bilet detayı getirme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const biletId = parseInt(id);

    if (isNaN(biletId)) {
      return NextResponse.json(
        { error: 'Geçersiz bilet ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_bilet_detay', [biletId]);

      if (Array.isArray(storedProcResult) && storedProcResult.length > 0) {
        return NextResponse.json(storedProcResult[0]);
      }
    } catch (spError) {
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
    }

    // Fallback query
    const query = `
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
        m.adres as musteri_adres,
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
      WHERE b.bilet_id = ?
    `;

    const results = await executeQuery(query, [biletId]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Bilet bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(results[0]);

  } catch (error) {
    console.error('Bilet detayı alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Bilet detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Bilet güncelleme (notlar, koltuk değişikliği vs.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const biletId = parseInt(id);
    const body = await request.json();
    const { notlar, koltuk_no } = body;

    if (isNaN(biletId)) {
      return NextResponse.json(
        { error: 'Geçersiz bilet ID' }, 
        { status: 400 }
      );
    }

    // Bilet varlığı kontrolü
    const existingBilet = await executeQuery(
      'SELECT bilet_id, bilet_durumu, sefer_id FROM bilet WHERE bilet_id = ?',
      [biletId]
    );

    if (!Array.isArray(existingBilet) || existingBilet.length === 0) {
      return NextResponse.json(
        { error: 'Bilet bulunamadı.' }, 
        { status: 404 }
      );
    }

    const bilet = existingBilet[0] as any;
    if (bilet.bilet_durumu === 'IPTAL') {
      return NextResponse.json(
        { error: 'İptal edilmiş bilet güncellenemez.' }, 
        { status: 400 }
      );
    }

    // Koltuk değişikliği varsa kontrol et
    if (koltuk_no && koltuk_no !== '') {
      const conflictingTicket = await executeQuery(
        `SELECT bilet_id FROM bilet 
         WHERE sefer_id = ? AND koltuk_no = ? AND bilet_durumu = 'AKTIF' AND bilet_id != ?`,
        [bilet.sefer_id, koltuk_no, biletId]
      );

      if (Array.isArray(conflictingTicket) && conflictingTicket.length > 0) {
        return NextResponse.json(
          { error: 'Bu koltuk zaten başka bir müşteriye satılmış.' }, 
          { status: 400 }
        );
      }
    }

    // Güncelleme
    let updateQuery = 'UPDATE bilet SET updated_at = CURRENT_TIMESTAMP';
    const updateParams: any[] = [];

    if (notlar !== undefined) {
      updateQuery += ', notlar = ?';
      updateParams.push(notlar);
    }

    if (koltuk_no && koltuk_no !== '') {
      updateQuery += ', koltuk_no = ?';
      updateParams.push(parseInt(koltuk_no));
    }

    updateQuery += ' WHERE bilet_id = ?';
    updateParams.push(biletId);

    await executeQuery(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      message: 'Bilet başarıyla güncellendi.'
    });

  } catch (error) {
    console.error('Bilet güncellenirken hata:', error);
    return NextResponse.json({ 
      error: 'Bilet güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Bilet iptal etme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const biletId = parseInt(id);

    if (isNaN(biletId)) {
      return NextResponse.json(
        { error: 'Geçersiz bilet ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_bilet_iptal', [biletId]);

      if (Array.isArray(storedProcResult) && storedProcResult.length > 0 && (storedProcResult[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (storedProcResult[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (storedProcResult as any)?.[0]?.mesaj || 'Bilet iptal edilirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Bilet varlığı kontrolü
      const existingBilet = await executeQuery(
        'SELECT bilet_id, bilet_durumu, sefer_id FROM bilet WHERE bilet_id = ?',
        [biletId]
      );

      if (!Array.isArray(existingBilet) || existingBilet.length === 0) {
        return NextResponse.json(
          { error: 'Bilet bulunamadı.' }, 
          { status: 404 }
        );
      }

      const bilet = existingBilet[0] as any;
      if (bilet.bilet_durumu === 'IPTAL') {
        return NextResponse.json(
          { error: 'Bilet zaten iptal edilmiş.' }, 
          { status: 400 }
        );
      }

      // Sefer zamanı kontrolü (örneğin kalkıştan 2 saat önce iptal edilebilir)
      const seferControl = await executeQuery(
        'SELECT kalkis_tarihi FROM sefer WHERE sefer_id = ?',
        [bilet.sefer_id]
      );

      if (Array.isArray(seferControl) && seferControl.length > 0) {
        const kalkisZamani = new Date((seferControl[0] as any).kalkis_tarihi);
        const simdikiZaman = new Date();
        const saatFarki = (kalkisZamani.getTime() - simdikiZaman.getTime()) / (1000 * 60 * 60);

        if (saatFarki < 2) {
          return NextResponse.json(
            { error: 'Kalkıştan 2 saat önceye kadar iptal edilebilir.' }, 
            { status: 400 }
          );
        }
      }

      // Bilet iptal et
      await executeQuery(
        `UPDATE bilet 
         SET bilet_durumu = 'IPTAL', 
             notlar = CONCAT(IFNULL(notlar, ''), '\nİPTAL EDİLDİ: ', NOW()),
             updated_at = CURRENT_TIMESTAMP
         WHERE bilet_id = ?`,
        [biletId]
      );

      // Ödeme durumunu da güncelle
      await executeQuery(
        `UPDATE odeme 
         SET durum = 'İADE', 
             aciklama = 'Bilet iptali nedeniyle iade'
         WHERE bilet_id = ?`,
        [biletId]
      );

      return NextResponse.json({
        success: true,
        message: 'Bilet başarıyla iptal edildi.'
      });
    }

  } catch (error) {
    console.error('Bilet iptal edilirken hata:', error);
    return NextResponse.json({ 
      error: 'Bilet iptal edilemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 