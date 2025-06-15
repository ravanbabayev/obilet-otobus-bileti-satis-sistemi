import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firma_id = searchParams.get('firma_id');
    const firma_id_param = firma_id && firma_id !== 'TUMU' && firma_id !== '0' ? parseInt(firma_id) : 0;

    try {
      // Önce saklı yordam ile dene
      const storedProcResult = await executeStoredProcedure('sp_otobus_tumunu_getir', [firma_id_param]);
      
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
        o.koltuk_sayisi,
        o.aktif_mi,
        f.firma_id,
        f.firma_adi
      FROM otobus o
      INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
      WHERE o.aktif_mi = TRUE AND f.aktif_mi = TRUE
    `;

    const params: any[] = [];

    if (firma_id && firma_id !== 'TUMU') {
      query += ` AND f.firma_id = ?`;
      params.push(parseInt(firma_id));
    }

    query += ` ORDER BY f.firma_adi, o.plaka`;

    const results = await executeQuery(query, params);
    return NextResponse.json(results || []);

  } catch (error) {
    console.error('Otobüs listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Otobüs listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 