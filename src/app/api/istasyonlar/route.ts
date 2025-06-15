import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// İstasyonları listeleme API endpoint'i
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const il = searchParams.get('il') || '';
    const durum = searchParams.get('durum') || 'AKTIF';

    console.log('İstasyon listesi istendi:', { search, il, durum });

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_istasyon_tumunu_getir', [
        search, il, durum
      ]);
      return NextResponse.json(results || []);
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
      let query = `
        SELECT 
          istasyon_id,
          istasyon_adi,
          il,
          ilce,
          adres,
          aktif_mi,
          created_at,
          updated_at
        FROM istasyon
        WHERE 1=1
      `;

      const params: any[] = [];

      // Arama filtresi
      if (search && search.trim()) {
        query += ` AND (istasyon_adi LIKE ? OR il LIKE ? OR ilce LIKE ? OR adres LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // İl filtresi
      if (il && il !== 'TUMU') {
        query += ` AND il = ?`;
        params.push(il);
      }

      // Durum filtresi
      if (durum && durum !== 'TUMU') {
        if (durum === 'AKTIF') {
          query += ` AND aktif_mi = TRUE`;
        } else if (durum === 'PASIF') {
          query += ` AND aktif_mi = FALSE`;
        }
      }

      query += ` ORDER BY il, ilce, istasyon_adi`;

      console.log('Executing query:', query);
      console.log('With params:', params);

      const results = await executeQuery(query, params);
      console.log('Query sonucu:', Array.isArray(results) ? results.length : 'Not array');
      return NextResponse.json(results || []);
    }

  } catch (error) {
    console.error('İstasyon listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'İstasyon listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// İstasyon ekleme API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { istasyon_adi, il, ilce, adres } = body;

    console.log('İstasyon ekleme isteği:', body);

    // Validasyon
    if (!istasyon_adi || !il || !ilce) {
      return NextResponse.json(
        { error: 'İstasyon adı, il ve ilçe zorunludur' }, 
        { status: 400 }
      );
    }

    // İstasyon adı uzunluk kontrolü
    if (istasyon_adi.length < 2 || istasyon_adi.length > 100) {
      return NextResponse.json(
        { error: 'İstasyon adı 2-100 karakter arasında olmalıdır' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_istasyon_ekle', [
        istasyon_adi, il, ilce, adres || null
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          istasyon_id: (results[0] as any).istasyon_id
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'İstasyon eklenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Aynı isimde istasyon var mı kontrol et
      const existingIstasyon = await executeQuery(
        `SELECT istasyon_id FROM istasyon 
         WHERE istasyon_adi = ? AND il = ? AND ilce = ? AND aktif_mi = TRUE`,
        [istasyon_adi, il, ilce]
      );
      
      if (Array.isArray(existingIstasyon) && existingIstasyon.length > 0) {
        return NextResponse.json(
          { error: 'Bu isimde bir istasyon zaten mevcut.' }, 
          { status: 400 }
        );
      }

      // Yeni istasyon ekle
      const result: any = await executeQuery(
        `INSERT INTO istasyon (istasyon_adi, il, ilce, adres, aktif_mi) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [istasyon_adi, il, ilce, adres || null]
      );

      return NextResponse.json({
        success: true,
        message: 'İstasyon başarıyla eklendi.',
        istasyon_id: result.insertId
      });
    }

  } catch (error) {
    console.error('İstasyon ekleme hatası:', error);
    return NextResponse.json({ 
      error: 'İstasyon eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

