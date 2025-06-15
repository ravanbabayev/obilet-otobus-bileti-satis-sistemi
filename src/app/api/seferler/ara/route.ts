import { executeStoredProcedure, executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let kalkis_il = searchParams.get('kalkis_il');
    let varis_il = searchParams.get('varis_il');
    const tarih = searchParams.get('tarih');

    // URL decoding sorunu çöz
    if (kalkis_il) {
      kalkis_il = decodeURIComponent(kalkis_il);
      // Özel karakter düzeltmeleri
      kalkis_il = kalkis_il.replace('Ä°', 'İ').replace('Ã¼', 'ü').replace('Ã§', 'ç').replace('Ä±', 'ı').replace('Ã¶', 'ö').replace('ÅŸ', 'Ş').replace('ÄŸ', 'ğ');
    }
    if (varis_il) {
      varis_il = decodeURIComponent(varis_il);
      varis_il = varis_il.replace('Ä°', 'İ').replace('Ã¼', 'ü').replace('Ã§', 'ç').replace('Ä±', 'ı').replace('Ã¶', 'ö').replace('ÅŸ', 'Ş').replace('ÄŸ', 'ğ');
    }

    console.log('Sefer arama parametreleri (düzeltilmiş):', { kalkis_il, varis_il, tarih });

    if (!kalkis_il || !varis_il || !tarih) {
      return NextResponse.json(
        { error: 'Kalkış ili, varış ili ve tarih parametreleri gereklidir.' },
        { status: 400 }
      );
    }

    // Gerçek sefer arama query'si
    const query = `
      SELECT 
        s.sefer_id,
        s.kalkis_tarihi as kalkis_zamani,
        s.varis_tarihi as varis_zamani,
        s.ucret,
        s.aktif_mi,
        o.plaka,
        o.koltuk_sayisi as toplam_koltuk_sayisi,
        f.firma_adi,
        ks.il as kalkis_il,
        ks.istasyon_adi as kalkis_yeri,
        vs.il as varis_il,
        vs.istasyon_adi as varis_yeri,
        (
          SELECT COUNT(*) 
          FROM bilet b 
          WHERE b.sefer_id = s.sefer_id AND b.bilet_durumu = 'AKTIF'
        ) as satilan_koltuk,
        (
          o.koltuk_sayisi - (
            SELECT COUNT(*) 
            FROM bilet b 
            WHERE b.sefer_id = s.sefer_id AND b.bilet_durumu = 'AKTIF'
          )
        ) as bos_koltuk_sayisi,
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
      WHERE ks.il = ? AND vs.il = ? AND DATE(s.kalkis_tarihi) = ? 
      AND s.aktif_mi = TRUE
      AND s.kalkis_tarihi > NOW()
      ORDER BY s.kalkis_tarihi ASC
    `;

    console.log('Query çalıştırılıyor:', query);
    console.log('Parametreler:', [kalkis_il, varis_il, tarih]);
    
    const results = await executeQuery(query, [kalkis_il, varis_il, tarih]);
    console.log('Query sonucu:', results);
    console.log('Sonuç sayısı:', Array.isArray(results) ? results.length : 'Not array');
    
    return NextResponse.json(results || []);

  } catch (error: any) {
    console.error('Sefer arama hatası:', error);
    return NextResponse.json(
      { error: 'Seferler yüklenirken bir hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}

