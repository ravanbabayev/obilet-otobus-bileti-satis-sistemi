import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Bilet iptal şeması
const biletIptalSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
  iptal_nedeni: z.string().min(1, 'İptal nedeni gerekli').min(10, 'İptal nedeni en az 10 karakter olmalı'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { bilet_id: string } }
) {
  try {
    const bilet_id = parseInt(params.bilet_id);
    
    if (isNaN(bilet_id)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz bilet ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = biletIptalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz veriler',
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { kullanici_id, iptal_nedeni } = validationResult.data;

    const result = await executeStoredProcedure(
      'sp_bilet_iptal',
      [bilet_id, kullanici_id, iptal_nedeni]
    ) as any[];

    // Stored procedure'dan gelen result array'in ilk elemanı actual data içerir
    const iptalData = Array.isArray(result) && result.length > 0 ? result[0] : [];
    const firstRow = Array.isArray(iptalData) && iptalData.length > 0 ? iptalData[0] : null;

    if (!firstRow) {
      return NextResponse.json(
        { success: false, message: 'Bilet iptal işlemi başarısız' },
        { status: 400 }
      );
    }

    const iptalSonucu = firstRow;
    
    if (iptalSonucu.basarili) {
      return NextResponse.json({
        success: true,
        message: iptalSonucu.mesaj || 'Bilet başarıyla iptal edildi'
      });
    } else {
      return NextResponse.json(
        { success: false, message: iptalSonucu.hata_mesaji || 'Bilet iptal edilemedi' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Bilet iptal API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 