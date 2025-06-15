import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const durum = searchParams.get('durum') || '';

    console.log('Firma listesi istendi:', { search, durum });

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_firma_tumunu_getir', [search, durum]);
      return NextResponse.json(results || []);
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
      let query = `
        SELECT 
          f.firma_id,
          f.firma_adi,
          f.telefon,
          f.email,
          f.vergi_no,
          f.merkez_adres,
          f.aktif_mi,
          f.created_at,
          f.updated_at,
          COUNT(o.otobus_id) AS otobus_sayisi,
          COUNT(DISTINCT s.sefer_id) AS toplam_sefer_sayisi,
          4.5 AS ortalama_puan
        FROM otobus_firmasi f
        LEFT JOIN otobus o ON f.firma_id = o.firma_id AND o.aktif_mi = TRUE
        LEFT JOIN sefer s ON o.otobus_id = s.otobus_id AND s.aktif_mi = TRUE
        WHERE 1=1
      `;

      const params: any[] = [];

      if (search && search.trim()) {
        query += ` AND (f.firma_adi LIKE ? OR f.telefon LIKE ? OR f.email LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (durum && durum !== 'TUMU') {
        if (durum === 'AKTIF') {
          query += ` AND f.aktif_mi = TRUE`;
        } else if (durum === 'PASIF') {
          query += ` AND f.aktif_mi = FALSE`;
        }
      }

      query += ` GROUP BY f.firma_id ORDER BY f.firma_adi`;

      console.log('Executing query:', query);
      console.log('With params:', params);

      const results = await executeQuery(query, params);
      console.log('Query sonucu:', Array.isArray(results) ? results.length : 'Not array');
      return NextResponse.json(results || []);
    }

  } catch (error) {
    console.error('Firma listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Firma listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firma_adi, telefon, email, vergi_no, merkez_adres } = body;

    console.log('Firma ekleme isteği:', { firma_adi, telefon, email, vergi_no });

    // Validasyon
    if (!firma_adi || !telefon || !email || !vergi_no || !merkez_adres) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' }, 
        { status: 400 }
      );
    }

    // Vergi numarası formatı kontrolü
    if (vergi_no.length !== 10 || !/^\d{10}$/.test(vergi_no)) {
      return NextResponse.json(
        { error: 'Vergi numarası 10 haneli sayı olmalıdır' }, 
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' }, 
        { status: 400 }
      );
    }

    // Telefon formatı kontrolü - tire ve boşlukları temizle
    const cleanTelefon = telefon?.toString().replace(/[-\s]/g, '').trim();
    const telefonRegex = /^0\d{10}$/;
    if (!cleanTelefon || !telefonRegex.test(cleanTelefon)) {
      return NextResponse.json(
        { error: `Telefon numarası 0 ile başlayan 11 haneli olmalıdır. Girilen: "${telefon}" (temizlenmiş: "${cleanTelefon}")` }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_firma_ekle', [
        firma_adi,
        telefon,
        email,
        vergi_no,
        merkez_adres
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          firma_id: (results[0] as any).firma_id
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Firma eklenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Vergi numarası kontrolü
      const existingVergi = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE vergi_no = ?',
        [vergi_no]
      );
      
      if (Array.isArray(existingVergi) && existingVergi.length > 0) {
        return NextResponse.json(
          { error: 'Bu vergi numarası zaten kayıtlı.' }, 
          { status: 400 }
        );
      }

      // Firma adı kontrolü
      const existingFirma = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE firma_adi = ? AND aktif_mi = TRUE',
        [firma_adi]
      );
      
      if (Array.isArray(existingFirma) && existingFirma.length > 0) {
        return NextResponse.json(
          { error: 'Bu firma adı zaten kayıtlı.' }, 
          { status: 400 }
        );
      }

      // Email kontrolü
      const existingEmail = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE email = ? AND aktif_mi = TRUE',
        [email]
      );
      
      if (Array.isArray(existingEmail) && existingEmail.length > 0) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı.' }, 
          { status: 400 }
        );
      }

      // Firma ekle
      console.log('Firma ekleniyor...');
      const result: any = await executeQuery(
        `INSERT INTO otobus_firmasi (firma_adi, telefon, email, vergi_no, merkez_adres, aktif_mi) 
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [firma_adi, cleanTelefon, email, vergi_no, merkez_adres]
      );

      console.log('Firma başarıyla eklendi, ID:', result.insertId);

      return NextResponse.json({
        success: true,
        message: 'Firma başarıyla eklendi.',
        firma_id: result.insertId
      });
    }

  } catch (error) {
    console.error('Firma eklenirken hata:', error);
    return NextResponse.json({ 
      error: 'Firma eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

