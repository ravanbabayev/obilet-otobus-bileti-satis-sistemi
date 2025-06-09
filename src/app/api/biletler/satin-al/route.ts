import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Bilet satın alma şeması
const biletSatinAlSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
  sefer_id: z.string().min(1, 'Sefer ID gerekli'),
  koltuk_no: z.string().min(1, 'Koltuk numarası gerekli'),
  ucret: z.number().positive('Ücret pozitif olmalı'),
  odeme_yontemi: z.enum(['kredi_karti', 'nakit', 'havale']),
  kart_no_son4: z.string().length(4, 'Kart numarası son 4 hanesi gerekli').optional(),
  odeme_bilgileri: z.object({
    kart_sahibi: z.string().optional(),
    fatura_adresi: z.string().optional(),
    sehir: z.string().optional(),
    posta_kodu: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = biletSatinAlSchema.safeParse(body);
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

    const { 
      kullanici_id, 
      sefer_id, 
      koltuk_no, 
      ucret, 
      odeme_yontemi, 
      kart_no_son4 
    } = validationResult.data;

    const result = await executeStoredProcedure(
      'sp_bilet_satin_al',
      [
        kullanici_id,
        parseInt(sefer_id),
        parseInt(koltuk_no),
        ucret,
        odeme_yontemi,
        kart_no_son4 || null
      ]
    ) as any[];

    // Stored procedure'dan gelen result array'in ilk elemanı actual data içerir
    const biletData = Array.isArray(result) && result.length > 0 ? result[0] : [];
    const firstRow = Array.isArray(biletData) && biletData.length > 0 ? biletData[0] : null;

    if (!firstRow || !firstRow.bilet_id) {
      return NextResponse.json(
        { success: false, message: firstRow?.hata_mesaji || 'Bilet satın alma işlemi başarısız' },
        { status: 400 }
      );
    }

    const bilet = firstRow;
    
    // E-bilet email gönderimi burada yapılabilir
    // await sendTicketEmail(bilet);

    return NextResponse.json({
      success: true,
      message: 'Bilet başarıyla satın alındı',
      bilet
    });

  } catch (error) {
    console.error('Bilet satın alma API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 