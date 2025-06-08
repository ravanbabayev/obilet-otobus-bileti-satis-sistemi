import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Profil güncelleme şeması
const profilGuncellemeSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
  ad: z
    .string()
    .min(1, 'Ad gerekli')
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  soyad: z
    .string()
    .min(1, 'Soyad gerekli')
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  telefon: z
    .string()
    .min(1, 'Telefon numarası gerekli')
    .regex(/^[0-9+() -]+$/, 'Geçerli bir telefon numarası girin'),
  email: z
    .string()
    .min(1, 'Email adresi gerekli')
    .email('Geçerli bir email adresi girin'),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = profilGuncellemeSchema.safeParse(body);
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

    const { kullanici_id, ad, soyad, telefon, email } = validationResult.data;

    // Mock güncelleme işlemi
    const updatedUser = {
      kullanici_id,
      ad,
      soyad,
      telefon,
      email,
      guncelleme_tarihi: new Date()
    };

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_kullanici_profil_guncelle',
        [kullanici_id, ad, soyad, telefon, email]
      );

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Profil güncellenemedi' },
          { status: 400 }
        );
      }

      const guncellenenKullanici = result[0];
      
      if (guncellenenKullanici.basarili) {
        return NextResponse.json({
          success: true,
          message: 'Profil başarıyla güncellendi',
          user: guncellenenKullanici
        });
      } else {
        return NextResponse.json(
          { success: false, message: guncellenenKullanici.hata_mesaji || 'Profil güncellenemedi' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      
      // Özel hata mesajları
      if (dbError.message?.includes('Duplicate entry')) {
        if (dbError.message.includes('email')) {
          return NextResponse.json(
            { success: false, message: 'Bu email adresi zaten kullanılıyor' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, message: 'Profil güncelleme sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Profil güncelleme API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 