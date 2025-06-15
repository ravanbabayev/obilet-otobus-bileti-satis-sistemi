import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kriter = searchParams.get('kriter');

    if (!kriter) {
      return NextResponse.json(
        { error: 'Arama kriteri gereklidir.' },
        { status: 400 }
      );
    }

    const results = await executeStoredProcedure('sp_bilet_ara', [kriter]);

    return NextResponse.json(results || []);
  } catch (error: any) {
    console.error('Bilet arama hatası:', error);
    return NextResponse.json(
      { error: 'Biletler aranırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

