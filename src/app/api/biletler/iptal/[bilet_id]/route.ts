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

    // Mock iptal işlemi - gerçek uygulamada veritabanından kontrol edilecek
    const mockBiletKontrol = {
      bilet_id,
      kullanici_id: 1, // Mock kullanıcı ID
      bilet_durumu: 'aktif',
      kalkis_zamani: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 saat sonra
    };

    // Bilet kontrolü
    if (mockBiletKontrol.kullanici_id !== kullanici_id) {
      return NextResponse.json(
        { success: false, message: 'Bu bilet size ait değil' },
        { status: 403 }
      );
    }

    if (mockBiletKontrol.bilet_durumu !== 'aktif') {
      return NextResponse.json(
        { success: false, message: 'Bu bilet zaten iptal edilmiş veya kullanılmış' },
        { status: 400 }
      );
    }

    // İptal süresi kontrolü (3 saat öncesine kadar)
    const now = new Date();
    const kalkisZamani = new Date(mockBiletKontrol.kalkis_zamani);
    const saatFarki = (kalkisZamani.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (saatFarki < 3) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bilet iptal süresi geçmiş. Hareket saatine 3 saatten az kaldığı için bilet iptal edilemez.' 
        },
        { status: 400 }
      );
    }

    // Mock başarılı iptal
    return NextResponse.json({
      success: true,
      message: 'Bilet başarıyla iptal edildi. İade işlemi 3-5 iş günü içinde tamamlanacak.'
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_bilet_iptal',
        [bilet_id, kullanici_id, iptal_nedeni]
      );

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Bilet iptal işlemi başarısız' },
          { status: 400 }
        );
      }

      const iptalSonucu = result[0];
      
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
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      
      // Özel hata mesajları
      if (dbError.message?.includes('Bu bilet size ait değil')) {
        return NextResponse.json(
          { success: false, message: 'Bu bilet size ait değil' },
          { status: 403 }
        );
      }
      
      if (dbError.message?.includes('iptal süresi geçmiş')) {
        return NextResponse.json(
          { success: false, message: 'Bilet iptal süresi geçmiş. Hareket saatine 3 saatten az kaldığı için bilet iptal edilemez.' },
          { status: 400 }
        );
      }
      
      if (dbError.message?.includes('zaten iptal')) {
        return NextResponse.json(
          { success: false, message: 'Bu bilet zaten iptal edilmiş veya kullanılmış' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Bilet iptal işlemi sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Bilet iptal API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 