import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { kullanici_id: string } }
) {
  try {
    const kullanici_id = parseInt(params.kullanici_id);
    
    if (isNaN(kullanici_id)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz kullanıcı ID' },
        { status: 400 }
      );
    }

    // Kullanıcının biletlerini veritabanından getir
    const result = await executeStoredProcedure(
      'sp_kullanici_biletleri',
      [kullanici_id]
    ) as any[];

    // Stored procedure'dan gelen result array'in ilk elemanı actual data içerir
    const biletler = Array.isArray(result) && result.length > 0 ? result[0] : [];

    return NextResponse.json({
      success: true,
      biletler: Array.isArray(biletler) ? biletler : []
    });

  } catch (error: any) {
    console.error('Kullanıcı biletleri API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 