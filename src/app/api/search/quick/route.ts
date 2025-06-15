import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const biletNo = searchParams.get('bilet_no');
    const tcKimlik = searchParams.get('tc_kimlik');
    const telefon = searchParams.get('telefon');

    console.log('Hızlı arama istendi:', { biletNo, tcKimlik, telefon });

    let results = [];

    if (biletNo) {
      // Bilet numarası ile arama
      results = await executeQuery(`
        SELECT 
          b.bilet_id,
          b.koltuk_no,
          b.bilet_durumu,
          b.ucret,
          DATE(b.bilet_tarihi) as bilet_tarihi,
          TIME(b.bilet_tarihi) as bilet_saati,
          CONCAT(m.ad, ' ', m.soyad) as musteri_adi,
          m.tc_kimlik_no,
          m.telefon as musteri_telefon,
          CONCAT(ks.il, ' → ', vs.il) as sefer_bilgisi,
          DATE(s.kalkis_tarihi) as kalkis_tarihi,
          TIME(s.kalkis_tarihi) as kalkis_saati,
          f.firma_adi,
          o.plaka
        FROM bilet b
        INNER JOIN musteri m ON b.musteri_id = m.musteri_id
        INNER JOIN sefer s ON b.sefer_id = s.sefer_id
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE b.bilet_id = ?
      `, [biletNo]);

    } else if (tcKimlik) {
      // TC Kimlik ile arama
      results = await executeQuery(`
        SELECT 
          b.bilet_id,
          b.koltuk_no,
          b.bilet_durumu,
          b.ucret,
          DATE(b.bilet_tarihi) as bilet_tarihi,
          TIME(b.bilet_tarihi) as bilet_saati,
          CONCAT(m.ad, ' ', m.soyad) as musteri_adi,
          m.tc_kimlik_no,
          m.telefon as musteri_telefon,
          CONCAT(ks.il, ' → ', vs.il) as sefer_bilgisi,
          DATE(s.kalkis_tarihi) as kalkis_tarihi,
          TIME(s.kalkis_tarihi) as kalkis_saati,
          f.firma_adi,
          o.plaka
        FROM bilet b
        INNER JOIN musteri m ON b.musteri_id = m.musteri_id
        INNER JOIN sefer s ON b.sefer_id = s.sefer_id
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE m.tc_kimlik_no = ?
        ORDER BY b.bilet_tarihi DESC
      `, [tcKimlik]);

    } else if (telefon) {
      // Telefon ile arama
      const cleanPhone = telefon.replace(/[^0-9]/g, '');
      results = await executeQuery(`
        SELECT 
          b.bilet_id,
          b.koltuk_no,
          b.bilet_durumu,
          b.ucret,
          DATE(b.bilet_tarihi) as bilet_tarihi,
          TIME(b.bilet_tarihi) as bilet_saati,
          CONCAT(m.ad, ' ', m.soyad) as musteri_adi,
          m.tc_kimlik_no,
          m.telefon as musteri_telefon,
          CONCAT(ks.il, ' → ', vs.il) as sefer_bilgisi,
          DATE(s.kalkis_tarihi) as kalkis_tarihi,
          TIME(s.kalkis_tarihi) as kalkis_saati,
          f.firma_adi,
          o.plaka
        FROM bilet b
        INNER JOIN musteri m ON b.musteri_id = m.musteri_id
        INNER JOIN sefer s ON b.sefer_id = s.sefer_id
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE REPLACE(REPLACE(REPLACE(m.telefon, ' ', ''), '-', ''), '(', '') LIKE ?
        ORDER BY b.bilet_tarihi DESC
      `, [`%${cleanPhone}%`]);
    }

    console.log(`Hızlı arama sonucu: ${results.length} kayıt bulundu`);

    return NextResponse.json({
      success: true,
      data: results,
      searchType: biletNo ? 'bilet' : tcKimlik ? 'tc' : 'telefon',
      searchValue: biletNo || tcKimlik || telefon
    });

  } catch (error) {
    console.error('Hızlı arama hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Arama yapılırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 