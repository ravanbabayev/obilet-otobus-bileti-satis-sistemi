import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Kayıt şeması
const kayitSchema = z.object({
  tc_kimlik_no: z
    .string()
    .min(1, 'TC Kimlik No gerekli')
    .length(11, 'TC Kimlik No 11 haneli olmalı')
    .regex(/^\d+$/, 'TC Kimlik No sadece rakam içermeli'),
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
  dogum_tarihi: z
    .string()
    .min(1, 'Doğum tarihi gerekli'),
  cinsiyet: z
    .enum(['E', 'K'], { required_error: 'Cinsiyet seçimi gerekli' }),
  telefon: z
    .string()
    .min(1, 'Telefon numarası gerekli')
    .regex(/^[0-9+() -]+$/, 'Geçerli bir telefon numarası girin'),
  email: z
    .string()
    .min(1, 'Email adresi gerekli')
    .email('Geçerli bir email adresi girin'),
  sifre: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
  kosullari_kabul: z
    .boolean()
    .refine(val => val === true, 'Kullanım koşullarını kabul etmelisiniz'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = kayitSchema.safeParse(body);
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

    const { tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet, telefon, email, sifre } = validationResult.data;

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // Mock kayıt işlemi - gerçek uygulamada veritabanına kaydedilecek
    const newUser = {
      kullanici_id: Math.floor(Math.random() * 1000) + 100, // Geçici ID
      tc_kimlik_no,
      ad,
      soyad,
      dogum_tarihi,
      cinsiyet,
      telefon,
      email,
      kayit_tarihi: new Date(),
      son_giris_tarihi: null,
      aktif_mi: true
    };

    // Başarılı kayıt yanıtı
    return NextResponse.json({
      success: true,
      message: 'Kayıt başarıyla tamamlandı',
      user: newUser
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_kullanici_kayit',
        [tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet, telefon, email, hashedPassword]
      );

      if (!result || result.length === 0 || !result[0].kullanici_id) {
        return NextResponse.json(
          { success: false, message: result[0]?.hata_mesaji || 'Kayıt işlemi başarısız' },
          { status: 400 }
        );
      }

      const user = result[0];
      return NextResponse.json({
        success: true,
        message: 'Kayıt başarıyla tamamlandı',
        user
      });
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      
      // Özel hata mesajları
      if (dbError.message?.includes('Duplicate entry')) {
        if (dbError.message.includes('tc_kimlik_no')) {
          return NextResponse.json(
            { success: false, message: 'Bu TC kimlik numarası zaten kayıtlı' },
            { status: 400 }
          );
        }
        if (dbError.message.includes('email')) {
          return NextResponse.json(
            { success: false, message: 'Bu email adresi zaten kayıtlı' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, message: 'Veritabanı hatası' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Kayıt API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 