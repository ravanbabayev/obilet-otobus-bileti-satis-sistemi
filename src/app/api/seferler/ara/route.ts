import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kalkis_il = searchParams.get('kalkis_il');
    const varis_il = searchParams.get('varis_il');
    const tarih = searchParams.get('tarih');

    if (!kalkis_il || !varis_il || !tarih) {
      return NextResponse.json(
        { error: 'Kalkış ili, varış ili ve tarih parametreleri gereklidir.' },
        { status: 400 }
      );
    }

    const results = await executeStoredProcedure('sp_sefer_ara', [
      kalkis_il,
      varis_il,
      tarih,
    ]);

    return NextResponse.json(results || []);
  } catch (error: any) {
    console.error('Sefer arama hatası:', error);
    return NextResponse.json(
      { error: 'Seferler yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

