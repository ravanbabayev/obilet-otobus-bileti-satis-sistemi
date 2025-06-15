import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// Otobüs detayı alma
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const otobusId = parseInt(id);

    if (isNaN(otobusId)) {
      return NextResponse.json(
        { error: 'Geçersiz otobüs ID.' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        o.otobus_id,
        o.plaka,
        o.model,
        o.koltuk_sayisi,
        o.aktif_mi,
        o.created_at,
        o.updated_at,
        f.firma_id,
        f.firma_adi,
        COUNT(CASE WHEN s.aktif_mi = TRUE AND s.kalkis_tarihi > NOW() THEN 1 END) as aktif_sefer_sayisi,
        COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as satilan_bilet_sayisi
      FROM otobus o
      INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
      LEFT JOIN sefer s ON o.otobus_id = s.otobus_id
      LEFT JOIN bilet b ON s.sefer_id = b.sefer_id
      WHERE o.otobus_id = ?
      GROUP BY o.otobus_id
    `;

    const results = await executeQuery(query, [otobusId]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Otobüs bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json(results[0]);

  } catch (error) {
    console.error('Otobüs detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Otobüs detayı alınamadı.' },
      { status: 500 }
    );
  }
}

// Otobüs güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const otobusId = parseInt(id);

    if (isNaN(otobusId)) {
      return NextResponse.json(
        { error: 'Geçersiz otobüs ID.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { plaka, model, koltuk_sayisi, firma_id, aktif_mi } = body;

    console.log('Otobüs güncelleme isteği:', { otobusId, ...body });

    // Validasyon
    if (!plaka || !model || !koltuk_sayisi || !firma_id) {
      return NextResponse.json(
        { error: 'Plaka, model, koltuk sayısı ve firma zorunludur' }, 
        { status: 400 }
      );
    }

    // Plaka formatı kontrolü
    const plakaRegex = /^(0[1-9]|[1-7][0-9]|8[01])\s?[A-Z]{1,3}\s?\d{2,4}$/;
    if (!plakaRegex.test(plaka.toUpperCase())) {
      return NextResponse.json(
        { error: 'Geçersiz plaka formatı (örn: 34 ABC 1234)' }, 
        { status: 400 }
      );
    }

    // Koltuk sayısı kontrolü
    const koltukSayisi = parseInt(koltuk_sayisi);
    if (isNaN(koltukSayisi) || koltukSayisi < 10 || koltukSayisi > 60) {
      return NextResponse.json(
        { error: 'Koltuk sayısı 10-60 arasında olmalıdır' }, 
        { status: 400 }
      );
    }

    // Otobüs var mı kontrol et
    const existingOtobus = await executeQuery(
      'SELECT otobus_id FROM otobus WHERE otobus_id = ?',
      [otobusId]
    );

    if (!Array.isArray(existingOtobus) || existingOtobus.length === 0) {
      return NextResponse.json(
        { error: 'Otobüs bulunamadı.' },
        { status: 404 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_otobus_guncelle', [
        otobusId, plaka.toUpperCase(), model, koltukSayisi, parseInt(firma_id), aktif_mi ? 1 : 0
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Otobüs güncellenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Aynı plakada başka otobüs var mı kontrol et (kendisi hariç)
      const duplicateOtobus = await executeQuery(
        `SELECT otobus_id FROM otobus 
         WHERE plaka = ? AND otobus_id != ? AND aktif_mi = TRUE`,
        [plaka.toUpperCase(), otobusId]
      );
      
      if (Array.isArray(duplicateOtobus) && duplicateOtobus.length > 0) {
        return NextResponse.json(
          { error: 'Bu plakada başka bir otobüs zaten kayıtlı.' }, 
          { status: 400 }
        );
      }

      // Firma var mı kontrol et
      const existingFirma = await executeQuery(
        `SELECT firma_id FROM otobus_firmasi WHERE firma_id = ? AND aktif_mi = TRUE`,
        [parseInt(firma_id)]
      );
      
      if (!Array.isArray(existingFirma) || existingFirma.length === 0) {
        return NextResponse.json(
          { error: 'Seçilen firma bulunamadı.' }, 
          { status: 400 }
        );
      }

      // Otobüsü güncelle
      await executeQuery(
        `UPDATE otobus 
         SET plaka = ?, model = ?, koltuk_sayisi = ?, firma_id = ?, aktif_mi = ?, updated_at = CURRENT_TIMESTAMP
         WHERE otobus_id = ?`,
        [plaka.toUpperCase(), model, koltukSayisi, parseInt(firma_id), aktif_mi ? 1 : 0, otobusId]
      );

      return NextResponse.json({
        success: true,
        message: 'Otobüs başarıyla güncellendi.'
      });
    }

  } catch (error) {
    console.error('Otobüs güncelleme hatası:', error);
    return NextResponse.json({ 
      error: 'Otobüs güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Otobüs silme (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const otobusId = parseInt(id);

    if (isNaN(otobusId)) {
      return NextResponse.json(
        { error: 'Geçersiz otobüs ID.' },
        { status: 400 }
      );
    }

    console.log('Otobüs silme isteği:', { otobusId });

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_otobus_sil', [otobusId]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Otobüs silinirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Otobüs var mı kontrol et
      const existingOtobus = await executeQuery(
        'SELECT otobus_id FROM otobus WHERE otobus_id = ?',
        [otobusId]
      );

      if (!Array.isArray(existingOtobus) || existingOtobus.length === 0) {
        return NextResponse.json(
          { error: 'Otobüs bulunamadı.' },
          { status: 404 }
        );
      }

      // Otobüsün aktif seferi var mı kontrol et
      const activeSeferler = await executeQuery(
        `SELECT COUNT(*) as count FROM sefer 
         WHERE otobus_id = ? AND aktif_mi = TRUE AND kalkis_tarihi > NOW()`,
        [otobusId]
      );

      const seferCount = Array.isArray(activeSeferler) && activeSeferler.length > 0 
        ? (activeSeferler[0] as any).count 
        : 0;

      if (seferCount > 0) {
        return NextResponse.json(
          { error: 'Bu otobüsün aktif seferleri bulunduğu için silinemez.' }, 
          { status: 400 }
        );
      }

      // Otobüsü pasif yap (soft delete)
      await executeQuery(
        `UPDATE otobus 
         SET aktif_mi = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE otobus_id = ?`,
        [otobusId]
      );

      return NextResponse.json({
        success: true,
        message: 'Otobüs başarıyla silindi.'
      });
    }

  } catch (error) {
    console.error('Otobüs silme hatası:', error);
    return NextResponse.json({ 
      error: 'Otobüs silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 