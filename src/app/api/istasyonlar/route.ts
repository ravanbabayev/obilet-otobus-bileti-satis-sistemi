import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// İstasyonları listeleme API endpoint'i
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const il = searchParams.get('il');

    let query = `
      SELECT 
        istasyon_id,
        istasyon_adi,
        il,
        ilce,
        adres,
        aktif_mi
      FROM istasyon
      WHERE aktif_mi = TRUE
    `;

    const params: any[] = [];

    if (il && il !== 'TUMU') {
      query += ` AND il = ?`;
      params.push(il);
    }

    query += ` ORDER BY il, ilce, istasyon_adi`;

    const results = await executeQuery(query, params);
    return NextResponse.json(results || []);

  } catch (error) {
    console.error('İstasyon listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'İstasyon listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

