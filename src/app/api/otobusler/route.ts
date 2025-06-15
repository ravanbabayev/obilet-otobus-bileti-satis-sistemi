import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const firma_id = searchParams.get('firma_id') || '';
    const durum = searchParams.get('durum') || 'AKTIF';

    console.log('Otobüs listesi istendi:', { search, firma_id, durum });

    const firma_id_param = firma_id && firma_id !== 'TUMU' && firma_id !== '0' ? parseInt(firma_id) : 0;

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_otobus_tumunu_getir', [
        search, firma_id_param, durum
      ]);
      
      if (Array.isArray(storedProcResult)) {
        return NextResponse.json(storedProcResult);
      }
    } catch (spError) {
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
    }

    let query = `
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
      WHERE 1=1
    `;

    const params: any[] = [];

    // Arama filtresi
    if (search && search.trim()) {
      query += ` AND (o.plaka LIKE ? OR f.firma_adi LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Firma filtresi
    if (firma_id && firma_id !== 'TUMU') {
      query += ` AND f.firma_id = ?`;
      params.push(parseInt(firma_id));
    }

    // Durum filtresi
    if (durum && durum !== 'TUMU') {
      if (durum === 'AKTIF') {
        query += ` AND o.aktif_mi = TRUE AND f.aktif_mi = TRUE`;
      } else if (durum === 'PASIF') {
        query += ` AND (o.aktif_mi = FALSE OR f.aktif_mi = FALSE)`;
      }
    }

    query += ` GROUP BY o.otobus_id ORDER BY f.firma_adi, o.plaka`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const results = await executeQuery(query, params);
    console.log('Query sonucu:', Array.isArray(results) ? results.length : 'Not array');
    return NextResponse.json(results || []);

  } catch (error) {
    console.error('Otobüs listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Otobüs listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

  // Otobüs ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plaka, koltuk_sayisi, firma_id, model } = body;

    console.log('Otobüs ekleme isteği:', body);

    // Validasyon
    if (!plaka || !koltuk_sayisi || !firma_id || !model) {
      return NextResponse.json(
        { error: 'Plaka, model, koltuk sayısı ve firma zorunludur' }, 
        { status: 400 }
      );
    }

    // Plaka formatı kontrolü (Türk plaka sistemi)
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

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_otobus_ekle', [
        plaka.toUpperCase(), model, koltukSayisi, parseInt(firma_id)
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          otobus_id: (results[0] as any).otobus_id
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Otobüs eklenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Aynı plakada otobüs var mı kontrol et
      const existingOtobus = await executeQuery(
        `SELECT otobus_id FROM otobus WHERE plaka = ? AND aktif_mi = TRUE`,
        [plaka.toUpperCase()]
      );
      
      if (Array.isArray(existingOtobus) && existingOtobus.length > 0) {
        return NextResponse.json(
          { error: 'Bu plakada bir otobüs zaten kayıtlı.' }, 
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

      // Yeni otobüs ekle
      const result: any = await executeQuery(
        `INSERT INTO otobus (plaka, model, koltuk_sayisi, firma_id, aktif_mi) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [plaka.toUpperCase(), model, koltukSayisi, parseInt(firma_id)]
      );

      return NextResponse.json({
        success: true,
        message: 'Otobüs başarıyla eklendi.',
        otobus_id: result.insertId
      });
    }

  } catch (error) {
    console.error('Otobüs ekleme hatası:', error);
    return NextResponse.json({ 
      error: 'Otobüs eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 