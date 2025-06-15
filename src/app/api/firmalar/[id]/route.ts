import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

// Firma detayı getirme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const firmaId = parseInt(resolvedParams.id);
    
    if (isNaN(firmaId)) {
      return NextResponse.json(
        { error: 'Geçersiz firma ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_firma_detay', [firmaId]);
      
      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json(
          { error: 'Firma bulunamadı' }, 
          { status: 404 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
      const query = `
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
          COUNT(DISTINCT s.sefer_id) AS toplam_sefer_sayisi
        FROM otobus_firmasi f
        LEFT JOIN otobus o ON f.firma_id = o.firma_id AND o.aktif_mi = TRUE
        LEFT JOIN sefer s ON o.otobus_id = s.otobus_id AND s.aktif_mi = TRUE
        WHERE f.firma_id = ?
        GROUP BY f.firma_id
      `;
      
      const results: any = await executeQuery(query, [firmaId]);
      
      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json(
          { error: 'Firma bulunamadı' }, 
          { status: 404 }
        );
      }
    }

  } catch (error) {
    console.error('Firma detayı alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Firma detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Firma güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const firmaId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { firma_adi, telefon, email, vergi_no, merkez_adres } = body;

    if (isNaN(firmaId)) {
      return NextResponse.json(
        { error: 'Geçersiz firma ID' }, 
        { status: 400 }
      );
    }

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
      const results = await executeStoredProcedure('sp_firma_guncelle', [
        firmaId,
        firma_adi,
        telefon,
        email,
        vergi_no,
        merkez_adres
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Firma güncellenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Firma varlığı kontrolü
      const existingFirma = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE firma_id = ?',
        [firmaId]
      );
      
      if (!Array.isArray(existingFirma) || existingFirma.length === 0) {
        return NextResponse.json(
          { error: 'Firma bulunamadı.' }, 
          { status: 404 }
        );
      }

      // Vergi numarası kontrolü (başka firma için)
      const existingVergi = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE vergi_no = ? AND firma_id != ?',
        [vergi_no, firmaId]
      );
      
      if (Array.isArray(existingVergi) && existingVergi.length > 0) {
        return NextResponse.json(
          { error: 'Bu vergi numarası başka bir firma tarafından kullanılıyor.' }, 
          { status: 400 }
        );
      }

      // Firma adı kontrolü (başka firma için)
      const existingFirmaAdi = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE firma_adi = ? AND firma_id != ? AND aktif_mi = TRUE',
        [firma_adi, firmaId]
      );
      
      if (Array.isArray(existingFirmaAdi) && existingFirmaAdi.length > 0) {
        return NextResponse.json(
          { error: 'Bu firma adı başka bir firma tarafından kullanılıyor.' }, 
          { status: 400 }
        );
      }

      // Email kontrolü (başka firma için)
      const existingEmail = await executeQuery(
        'SELECT firma_id FROM otobus_firmasi WHERE email = ? AND firma_id != ? AND aktif_mi = TRUE',
        [email, firmaId]
      );
      
      if (Array.isArray(existingEmail) && existingEmail.length > 0) {
        return NextResponse.json(
          { error: 'Bu email adresi başka bir firma tarafından kullanılıyor.' }, 
          { status: 400 }
        );
      }

      // Firmayı güncelle
      await executeQuery(
        `UPDATE otobus_firmasi 
         SET firma_adi = ?, telefon = ?, email = ?, vergi_no = ?, merkez_adres = ?, updated_at = CURRENT_TIMESTAMP
         WHERE firma_id = ?`,
        [firma_adi, cleanTelefon, email, vergi_no, merkez_adres, firmaId]
      );

      return NextResponse.json({
        success: true,
        message: 'Firma başarıyla güncellendi.'
      });
    }

  } catch (error) {
    console.error('Firma güncellenirken hata:', error);
    return NextResponse.json({ 
      error: 'Firma güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Firma silme (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const firmaId = parseInt(resolvedParams.id);

    if (isNaN(firmaId)) {
      return NextResponse.json(
        { error: 'Geçersiz firma ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_firma_sil', [firmaId]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Firma silinirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Firma varlığı kontrolü
      const existingFirma = await executeQuery(
        'SELECT firma_id, aktif_mi FROM otobus_firmasi WHERE firma_id = ?',
        [firmaId]
      );
      
      if (!Array.isArray(existingFirma) || existingFirma.length === 0) {
        return NextResponse.json(
          { error: 'Firma bulunamadı.' }, 
          { status: 404 }
        );
      }

      if (!(existingFirma[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Firma zaten pasif durumda.' }, 
          { status: 400 }
        );
      }

      // Aktif seferler kontrolü
      const activeSeferler = await executeQuery(
        `SELECT COUNT(*) as count FROM sefer s
         INNER JOIN otobus o ON s.otobus_id = o.otobus_id
         WHERE o.firma_id = ? AND s.aktif_mi = TRUE AND s.kalkis_tarihi > CURDATE()`,
        [firmaId]
      );
      
      if (Array.isArray(activeSeferler) && activeSeferler.length > 0 && (activeSeferler[0] as any).count > 0) {
        return NextResponse.json(
          { error: 'Bu firmaya ait aktif seferler bulunmaktadır. Önce seferleri iptal ediniz.' }, 
          { status: 400 }
        );
      }

      // Soft delete - firmayı pasif yap
      await executeQuery(
        'UPDATE otobus_firmasi SET aktif_mi = FALSE, updated_at = CURRENT_TIMESTAMP WHERE firma_id = ?',
        [firmaId]
      );

      return NextResponse.json({
        success: true,
        message: 'Firma başarıyla silindi (pasif duruma getirildi).'
      });
    }

  } catch (error) {
    console.error('Firma silinirken hata:', error);
    return NextResponse.json({ 
      error: 'Firma silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 