import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Hesap silme şeması
const hesapSilmeSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = hesapSilmeSchema.safeParse(body);
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

    const { kullanici_id } = validationResult.data;

    // Mock başarılı silme işlemi
    return NextResponse.json({
      success: true,
      message: 'Hesabınız başarıyla silindi'
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      // Önce kullanıcının aktif biletlerini kontrol et
      const aktiveBiletResult = await executeStoredProcedure(
        'sp_kullanici_aktif_bilet_kontrol',
        [kullanici_id]
      );

      if (aktiveBiletResult && aktiveBiletResult.length > 0 && aktiveBiletResult[0].aktif_bilet_sayisi > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Aktif biletleriniz bulunduğu için hesabınızı silemezsiniz. Önce aktif biletlerinizi iptal edin.' 
          },
          { status: 400 }
        );
      }

      // Hesabı sil (soft delete)
      const deleteResult = await executeStoredProcedure(
        'sp_kullanici_hesap_sil',
        [kullanici_id]
      );

      if (!deleteResult || deleteResult.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Hesap silinemedi' },
          { status: 400 }
        );
      }

      const silmeResult = deleteResult[0];
      
      if (silmeResult.basarili) {
        return NextResponse.json({
          success: true,
          message: 'Hesabınız başarıyla silindi'
        });
      } else {
        return NextResponse.json(
          { success: false, message: silmeResult.hata_mesaji || 'Hesap silinemedi' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      
      // Özel hata mesajları
      if (dbError.message?.includes('foreign key constraint')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Hesabınızla ilişkili veriler bulunduğu için hesap silinemiyor. Lütfen müşteri hizmetleri ile iletişime geçin.' 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Hesap silme sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Hesap silme API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 