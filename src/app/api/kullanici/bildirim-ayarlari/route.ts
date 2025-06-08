import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Bildirim ayarları şeması
const bildirimAyarlariSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
  email_bildirimleri: z.boolean(),
  sms_bildirimleri: z.boolean(),
  pazarlama_bildirimleri: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = bildirimAyarlariSchema.safeParse(body);
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

    const { kullanici_id, email_bildirimleri, sms_bildirimleri, pazarlama_bildirimleri } = validationResult.data;

    // Mock başarılı güncelleme
    return NextResponse.json({
      success: true,
      message: 'Bildirim ayarları başarıyla kaydedildi',
      ayarlar: {
        kullanici_id,
        email_bildirimleri,
        sms_bildirimleri,
        pazarlama_bildirimleri,
        guncelleme_tarihi: new Date()
      }
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_kullanici_bildirim_ayarlari_guncelle',
        [kullanici_id, email_bildirimleri, sms_bildirimleri, pazarlama_bildirimleri]
      );

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Bildirim ayarları güncellenemedi' },
          { status: 400 }
        );
      }

      const guncellemeResult = result[0];
      
      if (guncellemeResult.basarili) {
        return NextResponse.json({
          success: true,
          message: 'Bildirim ayarları başarıyla kaydedildi',
          ayarlar: guncellemeResult
        });
      } else {
        return NextResponse.json(
          { success: false, message: guncellemeResult.hata_mesaji || 'Bildirim ayarları güncellenemedi' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json(
        { success: false, message: 'Bildirim ayarları güncelleme sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Bildirim ayarları API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kullanici_id = searchParams.get('kullanici_id');

    if (!kullanici_id) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Mock ayarlar
    const mockAyarlar = {
      kullanici_id: parseInt(kullanici_id),
      email_bildirimleri: true,
      sms_bildirimleri: false,
      pazarlama_bildirimleri: true,
    };

    return NextResponse.json({
      success: true,
      ayarlar: mockAyarlar
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_kullanici_bildirim_ayarlari_getir',
        [parseInt(kullanici_id)]
      );

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Bildirim ayarları bulunamadı' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ayarlar: result[0]
      });
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json(
        { success: false, message: 'Bildirim ayarları getirilirken hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Bildirim ayarları getirme API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 