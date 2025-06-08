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

    // Mock bilet satın alma işlemi
    const mockBilet = {
      bilet_id: Math.floor(Math.random() * 10000) + 1000,
      bilet_kodu: `OB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${sefer_id.padStart(4, '0')}${koltuk_no.padStart(2, '0')}`,
      sefer_id: parseInt(sefer_id),
      koltuk_no: parseInt(koltuk_no),
      ucret,
      satin_alma_tarihi: new Date(),
      kalkis_zamani: new Date(Date.now() + 24 * 60 * 60 * 1000), // Yarın
      varis_zamani: new Date(Date.now() + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // Yarın + 5 saat
      firma_adi: 'Metro Turizm',
      kalkis_istasyon_adi: 'Büyük İstanbul Otogarı',
      varis_istasyon_adi: 'Ankara AŞTİ',
      ad: 'Test',
      soyad: 'Kullanıcı',
      tc_kimlik_no: '12345678901'
    };

    return NextResponse.json({
      success: true,
      message: 'Bilet başarıyla satın alındı',
      bilet: mockBilet
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
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
      );

      if (!result || result.length === 0 || !result[0].bilet_id) {
        return NextResponse.json(
          { success: false, message: result[0]?.hata_mesaji || 'Bilet satın alma işlemi başarısız' },
          { status: 400 }
        );
      }

      const bilet = result[0];
      
      // E-bilet email gönderimi burada yapılabilir
      // await sendTicketEmail(bilet);

      return NextResponse.json({
        success: true,
        message: 'Bilet başarıyla satın alındı',
        bilet
      });
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      
      // Özel hata mesajları
      if (dbError.message?.includes('Bu koltuk zaten satılmış')) {
        return NextResponse.json(
          { success: false, message: 'Bu koltuk zaten satılmış veya rezerve edilmiş.' },
          { status: 400 }
        );
      }
      
      if (dbError.message?.includes('Sefer tarihi geçmiş')) {
        return NextResponse.json(
          { success: false, message: 'Bu sefer için bilet satın alınamaz. Sefer tarihi geçmiş.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Bilet satın alma işlemi sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Bilet satın alma API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 