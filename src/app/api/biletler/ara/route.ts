import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// Bilet arama (TC Kimlik No veya telefon ile)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tc_kimlik_no = searchParams.get('tc_kimlik_no') || '';
    const telefon = searchParams.get('telefon') || '';
    const bilet_id = searchParams.get('bilet_id') || '';

    console.log('Bilet arama isteği:', { tc_kimlik_no, telefon, bilet_id });

    if (!tc_kimlik_no && !telefon && !bilet_id) {
      return NextResponse.json(
        { error: 'TC Kimlik No, telefon numarası veya bilet ID gereklidir' }, 
        { status: 400 }
      );
    }

    let query = `
      SELECT
        b.bilet_id,
        b.musteri_id,
        b.sefer_id,
        b.koltuk_no,
        DATE(b.bilet_tarihi) as bilet_tarihi,
        TIME(b.bilet_tarihi) as bilet_saati,
        b.bilet_durumu,
        b.ucret,
        b.satis_yapan_personel,
        b.notlar,
        m.ad as musteri_ad,
        m.soyad as musteri_soyad,
        m.tc_kimlik_no,
        m.telefon as musteri_telefon,
        m.email as musteri_email,
        DATE(s.kalkis_tarihi) as kalkis_tarihi,
        TIME(s.kalkis_tarihi) as kalkis_saati,
        DATE(s.varis_tarihi) as varis_tarihi,
        TIME(s.varis_tarihi) as varis_saati,
        o.plaka,
        f.firma_adi,
        ks.istasyon_adi as kalkis_istasyon,
        ks.il as kalkis_il,
        ks.ilce as kalkis_ilce,
        vs.istasyon_adi as varis_istasyon,
        vs.il as varis_il,
        vs.ilce as varis_ilce,
        od.odeme_turu,
        od.durum as odeme_durum
      FROM bilet b
      INNER JOIN musteri m ON b.musteri_id = m.musteri_id
      INNER JOIN sefer s ON b.sefer_id = s.sefer_id
      INNER JOIN otobus o ON s.otobus_id = o.otobus_id
      INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
      INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
      INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
      LEFT JOIN odeme od ON b.bilet_id = od.bilet_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (bilet_id && bilet_id.trim() !== '') {
      query += ` AND b.bilet_id = ?`;
      params.push(parseInt(bilet_id));
    } else if (tc_kimlik_no && tc_kimlik_no.trim() !== '') {
      query += ` AND m.tc_kimlik_no = ?`;
      params.push(tc_kimlik_no);
    } else if (telefon && telefon.trim() !== '') {
      // Telefon numarasını temizle
      const cleanPhone = telefon.replace(/[^\d]/g, '');
      query += ` AND (m.telefon LIKE CONCAT('%', ?, '%') OR REPLACE(REPLACE(m.telefon, '-', ''), ' ', '') LIKE CONCAT('%', ?, '%'))`;
      params.push(cleanPhone, cleanPhone);
    }

    query += ` ORDER BY b.bilet_tarihi DESC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const results = await executeQuery(query, params);

    if (!Array.isArray(results)) {
      return NextResponse.json([], { status: 200 });
    }

    console.log('Bulunan bilet sayısı:', results.length);
    return NextResponse.json(results);

  } catch (error) {
    console.error('Bilet arama hatası:', error);
    return NextResponse.json({ 
      error: 'Bilet arama yapılamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

