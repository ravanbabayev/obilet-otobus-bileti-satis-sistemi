import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
      notlar,
    } = body;

    if (!musteri_id || !sefer_id || !koltuk_no || !ucret || !satis_yapan_personel || !odeme_turu) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır.' },
        { status: 400 }
      );
    }

    const results = await executeStoredProcedure('sp_bilet_sat', [
      musteri_id,
      sefer_id,
      koltuk_no,
      ucret,
      satis_yapan_personel,
      odeme_turu,
      notlar || null,
    ]);

    if (Array.isArray(results) && results.length > 0) {
      const result = results[0];
      if (result.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          bilet_id: result.bilet_id,
          message: result.mesaj,
        });
      } else {
        return NextResponse.json(
          { error: result.mesaj || 'Bilet satışı başarısız.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Bilet satışı sırasında beklenmeyen bir hata oluştu.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Bilet satış hatası:', error);
    return NextResponse.json(
      { error: 'Bilet satışı sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

