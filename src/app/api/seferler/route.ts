import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const durum = searchParams.get('durum') || '';
    const firma_id_param = searchParams.get('firma_id') || '';
    const tarih = searchParams.get('tarih') || '';

    // Firma ID'yi integer'a çevir, boş ise 0 yap
    const firma_id = firma_id_param && firma_id_param !== 'TUMU' && firma_id_param !== '' ? parseInt(firma_id_param) : 0;

    console.log('Sefer listesi istendi:', { search, durum, firma_id, tarih });

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_tumunu_getir', [
        search, durum, firma_id, tarih || null
      ]);
      return NextResponse.json(results || []);
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
             let query = `
         SELECT 
           s.sefer_id,
           s.kalkis_tarihi,
           s.varis_tarihi,
           DATE(s.kalkis_tarihi) as kalkis_tarihi_date,
           TIME(s.kalkis_tarihi) as kalkis_saati,
           DATE(s.varis_tarihi) as varis_tarihi_date,
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
           (o.koltuk_sayisi - COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END)) as bos_koltuk,
           CASE 
             WHEN s.varis_tarihi < NOW() THEN 'TAMAMLANDI'
             WHEN s.kalkis_tarihi <= NOW() AND s.varis_tarihi > NOW() THEN 'DEVAM_EDIYOR'
             WHEN s.aktif_mi = FALSE THEN 'PASIF'
             ELSE 'BEKLEMEDE'
           END as sefer_durumu
         FROM sefer s
         INNER JOIN otobus o ON s.otobus_id = o.otobus_id
         INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
         INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
         INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
         LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND b.bilet_durumu != 'IPTAL'
         WHERE 1=1
       `;

      const params: any[] = [];

             // Arama filtresi
       if (search && search.trim()) {
         query += ` AND (f.firma_adi LIKE ? OR o.plaka LIKE ? OR ks.il LIKE ? OR vs.il LIKE ?)`;
         const searchPattern = `%${search}%`;
         params.push(searchPattern, searchPattern, searchPattern, searchPattern);
       }

      // Durum filtresi
      if (durum && durum !== 'TUMU') {
        if (durum === 'AKTIF') {
          query += ` AND s.aktif_mi = TRUE`;
        } else if (durum === 'PASIF') {
          query += ` AND s.aktif_mi = FALSE`;
        }
      }

      // Firma filtresi
      if (firma_id && firma_id !== 'TUMU') {
        query += ` AND f.firma_id = ?`;
        params.push(parseInt(firma_id));
      }

      // Tarih filtresi
      if (tarih) {
        query += ` AND DATE(s.kalkis_tarihi) = ?`;
        params.push(tarih);
      }

             query += ` 
         GROUP BY s.sefer_id
         ORDER BY s.kalkis_tarihi DESC
       `;

      console.log('Executing query:', query);
      console.log('With params:', params);

      const results = await executeQuery(query, params);
      console.log('Query sonucu:', Array.isArray(results) ? results.length : 'Not array');
      return NextResponse.json(results || []);
    }

  } catch (error) {
    console.error('Sefer listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Sefer listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      otobus_id,
      kalkis_istasyon_id,
      varis_istasyon_id,
      kalkis_tarihi,
      kalkis_saati,
      varis_tarihi,
      varis_saati,
      fiyat
    } = body;

    console.log('Sefer ekleme isteği:', body);

    // Validasyon
    if (!otobus_id || !kalkis_istasyon_id || !varis_istasyon_id || 
        !kalkis_tarihi || !kalkis_saati || !varis_tarihi || !varis_saati || !fiyat) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' }, 
        { status: 400 }
      );
    }

    // Fiyat kontrolü
    if (parseFloat(fiyat) <= 0) {
      return NextResponse.json(
        { error: 'Fiyat 0\'dan büyük olmalıdır' }, 
        { status: 400 }
      );
    }

    // Tarih ve saat kontrolü
    const kalkisDateTime = new Date(`${kalkis_tarihi}T${kalkis_saati}`);
    const varisDateTime = new Date(`${varis_tarihi}T${varis_saati}`);
    const now = new Date();

    if (kalkisDateTime <= now) {
      return NextResponse.json(
        { error: 'Kalkış tarihi ve saati gelecekte olmalıdır' }, 
        { status: 400 }
      );
    }

    if (varisDateTime <= kalkisDateTime) {
      return NextResponse.json(
        { error: 'Varış tarihi ve saati kalkış tarihinden sonra olmalıdır' }, 
        { status: 400 }
      );
    }

    try {
      // Tarih ve saati birleştir
      const kalkisDateTime = `${kalkis_tarihi} ${kalkis_saati}:00`;
      const varisDateTime = `${varis_tarihi} ${varis_saati}:00`;

      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_ekle', [
        otobus_id,
        kalkis_istasyon_id,
        varis_istasyon_id,
        kalkisDateTime,
        varisDateTime,
        fiyat
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          sefer_id: (results[0] as any).sefer_id
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Sefer eklenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

             // Aynı otobüsün aynı tarih ve saatte başka seferi var mı kontrol et
       const existingSefer = await executeQuery(
         `SELECT sefer_id FROM sefer 
          WHERE otobus_id = ? AND DATE(kalkis_tarihi) = ? AND TIME(kalkis_tarihi) = ? AND aktif_mi = TRUE`,
         [otobus_id, kalkis_tarihi, kalkis_saati]
       );
      
      if (Array.isArray(existingSefer) && existingSefer.length > 0) {
        return NextResponse.json(
          { error: 'Bu otobüsün belirtilen tarih ve saatte zaten bir seferi var.' }, 
          { status: 400 }
        );
      }

      // Otobüs varlığı ve aktiflik kontrolü
      const otobusControl = await executeQuery(
        `SELECT o.otobus_id, o.aktif_mi, f.firma_adi 
         FROM otobus o 
         INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id 
         WHERE o.otobus_id = ?`,
        [otobus_id]
      );
      
      if (!Array.isArray(otobusControl) || otobusControl.length === 0) {
        return NextResponse.json(
          { error: 'Otobüs bulunamadı.' }, 
          { status: 400 }
        );
      }

      if (!(otobusControl[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Pasif otobüse sefer tanımlanamaz.' }, 
          { status: 400 }
        );
      }

      // İstasyon kontrolleri
      const kalkisIstasyon = await executeQuery(
        'SELECT istasyon_id, aktif_mi FROM istasyon WHERE istasyon_id = ?',
        [kalkis_istasyon_id]
      );
      
      if (!Array.isArray(kalkisIstasyon) || kalkisIstasyon.length === 0 || !(kalkisIstasyon[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Kalkış istasyonu bulunamadı veya aktif değil.' }, 
          { status: 400 }
        );
      }

      const varisIstasyon = await executeQuery(
        'SELECT istasyon_id, aktif_mi FROM istasyon WHERE istasyon_id = ?',
        [varis_istasyon_id]
      );
      
      if (!Array.isArray(varisIstasyon) || varisIstasyon.length === 0 || !(varisIstasyon[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Varış istasyonu bulunamadı veya aktif değil.' }, 
          { status: 400 }
        );
      }

      if (kalkis_istasyon_id === varis_istasyon_id) {
        return NextResponse.json(
          { error: 'Kalkış ve varış istasyonu aynı olamaz.' }, 
          { status: 400 }
        );
      }

             // Sefer ekle
       console.log('Sefer ekleniyor...');
       const kalkisDateTime = `${kalkis_tarihi} ${kalkis_saati}:00`;
       const varisDateTime = `${varis_tarihi} ${varis_saati}:00`;
       
       const result: any = await executeQuery(
         `INSERT INTO sefer (
           otobus_id, kalkis_istasyon_id, varis_istasyon_id, 
           kalkis_tarihi, varis_tarihi, 
           ucret, aktif_mi
         ) VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
         [otobus_id, kalkis_istasyon_id, varis_istasyon_id, 
          kalkisDateTime, varisDateTime, fiyat]
       );

      console.log('Sefer başarıyla eklendi, ID:', result.insertId);

      return NextResponse.json({
        success: true,
        message: 'Sefer başarıyla eklendi.',
        sefer_id: result.insertId
      });
    }

  } catch (error) {
    console.error('Sefer eklenirken hata:', error);
    return NextResponse.json({ 
      error: 'Sefer eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 