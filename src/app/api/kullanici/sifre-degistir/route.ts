import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Şifre değiştirme şeması
const sifreDegistirmeSchema = z.object({
  kullanici_id: z.number().positive('Geçerli kullanıcı ID gerekli'),
  mevcut_sifre: z.string().min(1, 'Mevcut şifre gerekli'),
  yeni_sifre: z
    .string()
    .min(1, 'Yeni şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = sifreDegistirmeSchema.safeParse(body);
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

    const { kullanici_id, mevcut_sifre, yeni_sifre } = validationResult.data;

    // Mock kullanıcı verileri - gerçek uygulamada veritabanından gelecek
    const mockUser = {
      kullanici_id: 1,
      email: 'test@test.com',
      sifre: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    };

    // Kullanıcı kontrolü
    if (mockUser.kullanici_id !== kullanici_id) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz kullanıcı' },
        { status: 403 }
      );
    }

    // Mevcut şifre kontrolü
    const sifreDogruMu = await bcrypt.compare(mevcut_sifre, mockUser.sifre);
    
    if (!sifreDogruMu) {
      return NextResponse.json(
        { success: false, message: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hash'le
    const hashedNewPassword = await bcrypt.hash(yeni_sifre, 10);

    // Mock başarılı güncelleme
    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      // Önce mevcut şifreyi kontrol et
      const userResult = await executeStoredProcedure(
        'sp_kullanici_sifre_kontrol',
        [kullanici_id]
      );

      if (!userResult || userResult.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Kullanıcı bulunamadı' },
          { status: 404 }
        );
      }

      const user = userResult[0];
      
      // Mevcut şifre kontrolü
      const sifreDogruMu = await bcrypt.compare(mevcut_sifre, user.sifre);
      
      if (!sifreDogruMu) {
        return NextResponse.json(
          { success: false, message: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Yeni şifreyi hash'le
      const hashedNewPassword = await bcrypt.hash(yeni_sifre, 10);

      // Şifreyi güncelle
      const updateResult = await executeStoredProcedure(
        'sp_kullanici_sifre_guncelle',
        [kullanici_id, hashedNewPassword]
      );

      if (!updateResult || updateResult.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Şifre güncellenemedi' },
          { status: 400 }
        );
      }

      const guncellemeResult = updateResult[0];
      
      if (guncellemeResult.basarili) {
        return NextResponse.json({
          success: true,
          message: 'Şifre başarıyla değiştirildi'
        });
      } else {
        return NextResponse.json(
          { success: false, message: guncellemeResult.hata_mesaji || 'Şifre güncellenemedi' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json(
        { success: false, message: 'Şifre güncelleme sırasında hata oluştu' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Şifre değiştirme API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 