import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { sefer_id: string } }) {
  try {
    const { sefer_id } = params;

    if (!sefer_id || isNaN(Number(sefer_id))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Geçerli bir sefer ID\'si gereklidir.' 
        },
        { status: 400 }
      );
    }

    try {
      // Get bus layout for the trip
      const query = `
        SELECT 
          k.koltuk_no,
          k.durum,
          k.cinsiyet,
          o.koltuk_sayisi,
          s.sefer_id,
          s.kalkis_zamani,
          s.varis_zamani,
          s.temel_ucret,
          f.firma_adi,
          o.plaka,
          ki.istasyon_adi as kalkis_istasyon_adi,
          ki.sehir as kalkis_il,
          vi.istasyon_adi as varis_istasyon_adi,
          vi.sehir as varis_il
        FROM seferler s
        JOIN otobusler o ON s.otobus_id = o.otobus_id
        JOIN firmalar f ON o.firma_id = f.firma_id
        JOIN istasyonlar ki ON s.kalkis_istasyon_id = ki.istasyon_id
        JOIN istasyonlar vi ON s.varis_istasyon_id = vi.istasyon_id
        LEFT JOIN koltuklar k ON s.sefer_id = k.sefer_id
        WHERE s.sefer_id = ?
        ORDER BY k.koltuk_no
      `;

      const results = await executeQuery(query, [sefer_id]) as any[];

      if (results.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Sefer bulunamadı.' 
          },
          { status: 404 }
        );
      }

      // Extract trip info and seats
      const tripInfo = {
        sefer_id: results[0].sefer_id,
        kalkis_zamani: results[0].kalkis_zamani,
        varis_zamani: results[0].varis_zamani,
        temel_ucret: results[0].temel_ucret,
        firma_adi: results[0].firma_adi,
        plaka: results[0].plaka,
        kalkis_istasyon_adi: results[0].kalkis_istasyon_adi,
        kalkis_il: results[0].kalkis_il,
        varis_istasyon_adi: results[0].varis_istasyon_adi,
        varis_il: results[0].varis_il,
        koltuk_sayisi: results[0].koltuk_sayisi
      };

      // Create seat layout
      const seats = [];
      for (let i = 1; i <= results[0].koltuk_sayisi; i++) {
        const seatData = results.find(r => r.koltuk_no === i);
        seats.push({
          koltuk_no: i,
          durum: seatData?.durum || 'boş',
          cinsiyet: seatData?.cinsiyet || null
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          trip: tripInfo,
          seats: seats
        }
      });

    } catch (dbError: any) {
      console.error('Veritabanı hatası:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Veritabanı bağlantısı sırasında hata oluştu.' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Koltuk bilgileri yüklenirken hata:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Koltuk bilgileri yüklenirken bir hata oluştu.' 
      },
      { status: 500 }
    );
  }
} 