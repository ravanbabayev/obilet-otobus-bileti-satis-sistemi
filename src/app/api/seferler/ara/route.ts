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
        { 
          success: false,
          error: 'Kalkış ili, varış ili ve tarih parametreleri gereklidir.' 
        },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tarih)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.' 
        },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const selectedDate = new Date(tarih);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçmiş tarih seçilemez.' 
        },
        { status: 400 }
      );
    }

    try {
      const results = await executeStoredProcedure('sp_sefer_ara', [
        kalkis_il,
        varis_il,
        tarih,
      ]) as any[];

      // Stored procedure'dan gelen result array'in ilk elemanı actual data içerir
      const seferData = Array.isArray(results) && results.length > 0 ? results[0] : [];

      return NextResponse.json({
        success: true,
        data: Array.isArray(seferData) ? seferData : []
      });
    } catch (dbError: any) {
      console.error('Veritabanı hatası:', dbError);
      throw dbError;
    }

  } catch (error: any) {
    console.error('Sefer arama hatası:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Seferler yüklenirken bir hata oluştu.' 
      },
      { status: 500 }
    );
  }
} 