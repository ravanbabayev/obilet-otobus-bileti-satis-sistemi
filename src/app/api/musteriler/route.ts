import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

// Müşteri listesi getirme
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    console.log('Müşteri listesi istendi:', { search });

    // Stored procedure ile müşteri listesini al
    const results = await executeStoredProcedure('sp_musteri_tumunu_getir', [search]);

    console.log('Müşteri listesi başarıyla alındı:', Array.isArray(results) ? results.length : 0, 'kayıt');
    return NextResponse.json(results || []);

  } catch (error: any) {
    console.error('Müşteri listesi hatası:', error);
    return NextResponse.json(
      { error: 'Müşteri listesi yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Müşteri ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad, soyad, tc_kimlik_no, telefon, email } = body;

    console.log('Müşteri ekleme isteği:', body);

    // Validasyon
    if (!ad || !soyad || !tc_kimlik_no || !telefon) {
      return NextResponse.json(
        { error: 'Ad, soyad, TC kimlik numarası ve telefon alanları zorunludur' }, 
        { status: 400 }
      );
    }

    if (tc_kimlik_no.length !== 11) {
      return NextResponse.json(
        { error: 'TC kimlik numarası 11 haneli olmalıdır' }, 
        { status: 400 }
      );
    }

    // Stored procedure ile müşteri ekle/güncelle
    const results = await executeStoredProcedure('sp_musteri_ekle_guncelle', [
      ad, soyad, tc_kimlik_no, telefon, email || null
    ]);

    if (Array.isArray(results) && results.length > 0) {
      const result = results[0];
      return NextResponse.json({
        success: true,
        message: result.durum === 'EKLENDİ' ? 'Müşteri başarıyla eklendi' : 'Müşteri bilgileri güncellendi',
        musteri_id: result.musteri_id,
        durum: result.durum
      });
    } else {
      return NextResponse.json(
        { error: 'Müşteri kaydı oluşturulamadı' }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Müşteri ekleme hatası:', error);
    
    // MySQL duplicate key hatası kontrolü
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Bu TC kimlik numarası zaten kayıtlı' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Müşteri kaydı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 