import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kalkis_il = searchParams.get('kalkis_il');
    const varis_il = searchParams.get('varis_il');
    const tarih = searchParams.get('tarih');

    if (!kalkis_il || !varis_il || !tarih) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kalkış ili, varış ili ve tarih parametreleri gereklidir.' 
        },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tarih)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.' 
        },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const selectedDate = new Date(tarih);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçmiş tarih seçilemez.' 
        },
        { status: 400 }
      );
    }

    try {
      const results = await executeStoredProcedure('sp_sefer_ara', [
        kalkis_il,
        varis_il,
        tarih,
      ]);

      return NextResponse.json({
        success: true,
        data: results
      });
    } catch (dbError: any) {
      console.error('Veritabanı hatası:', dbError);
      
      // Check if it's a stored procedure not found error
      if (dbError.code === 'ER_SP_DOES_NOT_EXIST') {
        // Return mock data for development
        const mockData = [
          {
            sefer_id: 1,
            otobus_id: 1,
            plaka: '34 ABC 123',
            firma_adi: 'Metro Turizm',
            kalkis_istasyon_id: 1,
            kalkis_istasyon_adi: 'Büyük Otogar',
            kalkis_il: kalkis_il,
            varis_istasyon_id: 2,
            varis_istasyon_adi: 'AŞTİ',
            varis_il: varis_il,
            kalkis_zamani: `${tarih} 08:00:00`,
            varis_zamani: `${tarih} 13:00:00`,
            ucret: 150.00
          },
          {
            sefer_id: 2,
            otobus_id: 2,
            plaka: '06 DEF 456',
            firma_adi: 'Ulusoy',
            kalkis_istasyon_id: 1,
            kalkis_istasyon_adi: 'Büyük Otogar',
            kalkis_il: kalkis_il,
            varis_istasyon_id: 2,
            varis_istasyon_adi: 'AŞTİ',
            varis_il: varis_il,
            kalkis_zamani: `${tarih} 10:30:00`,
            varis_zamani: `${tarih} 15:30:00`,
            ucret: 180.00
          },
          {
            sefer_id: 3,
            otobus_id: 3,
            plaka: '35 GHI 789',
            firma_adi: 'Kamil Koç',
            kalkis_istasyon_id: 1,
            kalkis_istasyon_adi: 'Büyük Otogar',
            kalkis_il: kalkis_il,
            varis_istasyon_id: 2,
            varis_istasyon_adi: 'AŞTİ',
            varis_il: varis_il,
            kalkis_zamani: `${tarih} 14:00:00`,
            varis_zamani: `${tarih} 19:00:00`,
            ucret: 160.00
          }
        ];

        return NextResponse.json({
          success: true,
          data: mockData,
          mock: true
        });
      }
      
      throw dbError;
    }

  } catch (error: any) {
    console.error('Sefer arama hatası:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Seferler yüklenirken bir hata oluştu.' 
      },
      { status: 500 }
    );
  }
} 