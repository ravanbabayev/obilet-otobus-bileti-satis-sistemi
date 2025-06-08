import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { executeStoredProcedure } from '@/lib/db';

// Giriş şeması
const girisSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  sifre: z.string().min(1, 'Şifre gerekli'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validationResult = girisSchema.safeParse(body);
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

    const { email, sifre } = validationResult.data;

    // Mock data kullanarak test
    const mockUsers = [
      {
        kullanici_id: 1,
        tc_kimlik_no: '12345678901',
        ad: 'Test',
        soyad: 'Kullanıcı',
        dogum_tarihi: '1990-01-01',
        cinsiyet: 'E',
        telefon: '05551234567',
        email: 'test@test.com',
        sifre: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        kayit_tarihi: new Date(),
        son_giris_tarihi: null,
        aktif_mi: true
      }
    ];

    // Kullanıcı ara
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || !user.aktif_mi) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    const sifreDogruMu = await bcrypt.compare(sifre, user.sifre);
    
    if (!sifreDogruMu) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Başarılı giriş
    const { sifre: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        ...userWithoutPassword,
        son_giris_tarihi: new Date()
      }
    });

    // Gerçek veritabanı kullanımı için (şu an comment):
    /*
    try {
      const result = await executeStoredProcedure(
        'sp_kullanici_giris',
        [email, sifre]
      );

      if (!result || result.length === 0 || !result[0].kullanici_id) {
        return NextResponse.json(
          { success: false, message: result[0]?.hata_mesaji || 'Geçersiz email veya şifre' },
          { status: 401 }
        );
      }

      const user = result[0];
      return NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        user
      });
    } catch (dbError) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json(
        { success: false, message: 'Veritabanı hatası' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('Giriş API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 