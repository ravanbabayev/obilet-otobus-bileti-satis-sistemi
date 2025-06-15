import { executeStoredProcedure } from '@/lib/db';
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

    const results = await executeStoredProcedure('sp_koltuk_durumları', [seferId]);

    return NextResponse.json(results || []);
  } catch (error: any) {
    console.error('Koltuk durumları yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Koltuk durumları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

