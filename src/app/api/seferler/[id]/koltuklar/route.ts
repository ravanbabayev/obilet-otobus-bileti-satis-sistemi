import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seferId = parseInt(id);

    if (isNaN(seferId)) {
      return NextResponse.json(
        { error: 'Geçersiz sefer ID.' },
        { status: 400 }
      );
    }

    try {
      // Önce stored procedure ile dene
      const results = await executeStoredProcedure('sp_koltuk_durumları', [seferId]);
      
      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results);
      }
    } catch (spError) {
      console.log('Stored procedure bulunamadı, alternatif sorgu kullanılıyor:', spError);
    }

    // Stored procedure yoksa alternatif sorgu kullan
    const biletResults = await executeStoredProcedure('sp_bilet_tumunu_getir', [
      '', 'AKTIF', 0, null
    ]);

    // Sefer ID'sine göre filtrele
    const seferBiletleri = Array.isArray(biletResults) ? 
      biletResults.filter((bilet: any) => bilet.sefer_id === seferId) : [];

    const koltukDurumlari = seferBiletleri.map((bilet: any) => ({
      koltuk_no: bilet.koltuk_no,
      yolcu_adi: bilet.yolcu_adi || `${bilet.musteri_ad || ''} ${bilet.musteri_soyad || ''}`.trim(),
      yolcu_soyadi: '',
      bilet_durumu: bilet.bilet_durumu,
      cinsiyet: bilet.tc_kimlik_no && bilet.tc_kimlik_no.slice(-1) % 2 === 1 ? 'E' : 'K'
    }));

    return NextResponse.json(koltukDurumlari);

  } catch (error: any) {
    console.error('Koltuk durumları yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Koltuk durumları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

