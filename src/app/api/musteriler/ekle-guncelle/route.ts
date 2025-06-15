import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad, soyad, tc_kimlik_no, telefon, email } = body;

    if (!ad || !soyad || !tc_kimlik_no || !telefon) {
      return NextResponse.json(
        { error: 'Ad, soyad, TC kimlik numarası ve telefon alanları zorunludur.' },
        { status: 400 }
      );
    }

    if (tc_kimlik_no.length !== 11) {
      return NextResponse.json(
        { error: 'TC kimlik numarası 11 haneli olmalıdır.' },
        { status: 400 }
      );
    }

    const results = await executeStoredProcedure('sp_musteri_ekle_guncelle', [
      ad,
      soyad,
      tc_kimlik_no,
      telefon,
      email || null,
    ]);

    if (Array.isArray(results) && results.length > 0) {
      return NextResponse.json(results[0]);
    } else {
      return NextResponse.json(results);
    }
  } catch (error: any) {
    console.error('Müşteri ekleme/güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Müşteri kaydı oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

