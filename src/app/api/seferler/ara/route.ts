import { executeStoredProcedure, executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kalkis_il = searchParams.get('kalkis_il');
    const varis_il = searchParams.get('varis_il');
    const tarih = searchParams.get('tarih');

    if (!kalkis_il || !varis_il || !tarih) {
      return NextResponse.json(
        { error: 'Kalkış ili, varış ili ve tarih parametreleri gereklidir.' },
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_ara', [
        kalkis_il,
        varis_il,
        tarih,
      ]);
      return NextResponse.json(results || []);
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
      const query = `
        SELECT 
          s.sefer_id,
          s.kalkis_tarihi,
          s.varis_tarihi,
          DATE(s.kalkis_tarihi) as kalkis_tarihi_date,
          TIME(s.kalkis_tarihi) as kalkis_saati,
          DATE(s.varis_tarihi) as varis_tarihi_date,
          TIME(s.varis_tarihi) as varis_saati,
          s.ucret,
          s.aktif_mi,
          o.plaka,
          o.koltuk_sayisi,
          f.firma_adi,
          ks.il as kalkis_il,
          ks.istasyon_adi as kalkis_istasyon_adi,
          vs.il as varis_il,
          vs.istasyon_adi as varis_istasyon_adi,
          COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END) as satilan_koltuk,
          (o.koltuk_sayisi - COUNT(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 1 END)) as bos_koltuk_sayisi,
          CASE 
            WHEN s.varis_tarihi < NOW() THEN 'TAMAMLANDI'
            WHEN s.kalkis_tarihi <= NOW() AND s.varis_tarihi > NOW() THEN 'DEVAM_EDIYOR'
            WHEN s.aktif_mi = FALSE THEN 'PASIF'
            ELSE 'BEKLEMEDE'
          END as sefer_durumu
        FROM sefer s
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND b.bilet_durumu != 'IPTAL'
        WHERE ks.il = ? AND vs.il = ? AND DATE(s.kalkis_tarihi) = ? 
        AND s.aktif_mi = TRUE
        AND s.kalkis_tarihi > NOW()
        GROUP BY s.sefer_id
        ORDER BY s.kalkis_tarihi ASC
      `;

      const results = await executeQuery(query, [kalkis_il, varis_il, tarih]);
      return NextResponse.json(results || []);
    }

  } catch (error: any) {
    console.error('Sefer arama hatası:', error);
    return NextResponse.json(
      { error: 'Seferler yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

