import { executeStoredProcedure, executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seferId = parseInt(id);

    if (isNaN(seferId)) {
      return NextResponse.json(
        { error: 'Geçersiz sefer ID.' },
        { status: 400 }
      );
    }

    // Direkt SQL sorgusu kullan (stored procedure çalışmıyor)
    const results = await executeQuery(`
      SELECT 
        b.koltuk_no,
        m.ad as yolcu_adi,
        m.soyad as yolcu_soyadi,
        b.bilet_durumu,
        CASE 
          WHEN m.tc_kimlik_no LIKE '%1' OR m.tc_kimlik_no LIKE '%3' OR m.tc_kimlik_no LIKE '%5' OR m.tc_kimlik_no LIKE '%7' OR m.tc_kimlik_no LIKE '%9' THEN 'E'
          ELSE 'K'
        END as cinsiyet
      FROM bilet b
      INNER JOIN musteri m ON b.musteri_id = m.musteri_id
      WHERE b.sefer_id = ? AND b.bilet_durumu = 'AKTIF'
      ORDER BY b.koltuk_no
    `, [seferId]);

    return NextResponse.json(results || []);
  } catch (error: any) {
    console.error('Koltuk durumları yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Koltuk durumları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

