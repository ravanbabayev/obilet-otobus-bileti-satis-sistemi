import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const firma_id = searchParams.get('firma_id') || '';
    const durum = searchParams.get('durum') || 'AKTIF';

    console.log('Otobüs listesi istendi:', { search, firma_id, durum });

    const firma_id_param = firma_id && firma_id !== 'TUMU' && firma_id !== '0' ? parseInt(firma_id) : 0;

    // Stored procedure ile otobüs listesini al
    const results = await executeStoredProcedure('sp_otobus_tumunu_getir_detayli', [
      search, firma_id_param, durum
    ]);

    console.log('Otobüs listesi başarıyla alındı:', Array.isArray(results) ? results.length : 0, 'kayıt');
    return NextResponse.json(results || []);

  } catch (error: any) {
    console.error('Otobüs listesi hatası:', error);
    return NextResponse.json(
      { error: 'Otobüs listesi yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Otobüs ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firma_id, plaka, model, koltuk_sayisi, ozellikler } = body;

    console.log('Otobüs ekleme isteği:', body);

    // Validasyon
    if (!firma_id || !plaka || !model || !koltuk_sayisi) {
      return NextResponse.json(
        { error: 'Firma, plaka, model ve koltuk sayısı alanları zorunludur' }, 
        { status: 400 }
      );
    }

    if (koltuk_sayisi < 1 || koltuk_sayisi > 60) {
      return NextResponse.json(
        { error: 'Koltuk sayısı 1-60 arasında olmalıdır' }, 
        { status: 400 }
      );
    }

    // Plaka format kontrolü
    if (!/^[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$/.test(plaka.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Geçersiz plaka formatı (örn: 34ABC123)' }, 
        { status: 400 }
      );
    }

    try {
      // Stored procedure ile otobüs ekle (eğer varsa)
      const results = await executeStoredProcedure('sp_otobus_ekle', [
        firma_id, plaka, model, koltuk_sayisi, ozellikler || null
      ]);

      if (Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          otobus_id: (results[0] as any).otobus_id
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Otobüs eklenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Stored procedure yoksa basit ekleme yap
      console.log('Stored procedure bulunamadı, basit ekleme yapılıyor:', spError);
      
      // Firma kontrolü
      const firmaResults = await executeStoredProcedure('sp_firma_tumunu_getir', ['', 'AKTIF']);
      const firma = Array.isArray(firmaResults) ? firmaResults.find(f => f.firma_id === parseInt(firma_id)) : null;
      
      if (!firma) {
        return NextResponse.json(
          { error: 'Geçersiz firma seçimi' }, 
          { status: 400 }
        );
      }

      // Plaka tekrarı kontrolü
      const otobusResults = await executeStoredProcedure('sp_otobus_tumunu_getir_detayli', [
        plaka, 0, 'TUMU'
      ]);
      
      const existingOtobus = Array.isArray(otobusResults) ? otobusResults.find(o => o.plaka === plaka) : null;
      
      if (existingOtobus) {
        return NextResponse.json(
          { error: 'Bu plaka zaten kayıtlı' }, 
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Otobüs ekleme stored procedure\'ü bulunamadı' }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Otobüs ekleme hatası:', error);
    
    // MySQL duplicate key hatası kontrolü
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Bu plaka zaten kayıtlı' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Otobüs kaydı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 