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

    const result = await executeStoredProcedure(
      'sp_kullanici_giris',
      [email, sifre]
    ) as any[];

    // Stored procedure'dan gelen result array'in ilk elemanı actual data içerir
    const userData = Array.isArray(result) && result.length > 0 ? result[0] : [];
    const firstRow = Array.isArray(userData) && userData.length > 0 ? userData[0] : null;

    if (!firstRow || !firstRow.kullanici_id) {
      return NextResponse.json(
        { success: false, message: firstRow?.hata_mesaji || 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const user = firstRow;
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user
    });

  } catch (error) {
    console.error('Giriş API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 