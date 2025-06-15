import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeStoredProcedure } from '@/lib/db';

// İstasyon detayı alma
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const istasyonId = parseInt(id);

    if (isNaN(istasyonId)) {
      return NextResponse.json(
        { error: 'Geçersiz istasyon ID.' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        istasyon_id,
        istasyon_adi,
        il,
        ilce,
        adres,
        aktif_mi,
        created_at,
        updated_at
      FROM istasyon 
      WHERE istasyon_id = ?
    `;

    const results = await executeQuery(query, [istasyonId]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'İstasyon bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json(results[0]);

  } catch (error) {
    console.error('İstasyon detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'İstasyon detayı alınamadı.' },
      { status: 500 }
    );
  }
}

// İstasyon güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const istasyonId = parseInt(id);

    if (isNaN(istasyonId)) {
      return NextResponse.json(
        { error: 'Geçersiz istasyon ID.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { istasyon_adi, il, ilce, adres, aktif_mi } = body;

    console.log('İstasyon güncelleme isteği:', { istasyonId, ...body });

    // Validasyon
    if (!istasyon_adi || !il || !ilce) {
      return NextResponse.json(
        { error: 'İstasyon adı, il ve ilçe zorunludur' }, 
        { status: 400 }
      );
    }

    // İstasyon adı uzunluk kontrolü
    if (istasyon_adi.length < 2 || istasyon_adi.length > 100) {
      return NextResponse.json(
        { error: 'İstasyon adı 2-100 karakter arasında olmalıdır' }, 
        { status: 400 }
      );
    }

    // İstasyon var mı kontrol et
    const existingIstasyon = await executeQuery(
      'SELECT istasyon_id FROM istasyon WHERE istasyon_id = ?',
      [istasyonId]
    );

    if (!Array.isArray(existingIstasyon) || existingIstasyon.length === 0) {
      return NextResponse.json(
        { error: 'İstasyon bulunamadı.' },
        { status: 404 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_istasyon_guncelle', [
        istasyonId, istasyon_adi, il, ilce, adres || null, aktif_mi ? 1 : 0
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'İstasyon güncellenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Aynı isimde başka istasyon var mı kontrol et (kendisi hariç)
      const duplicateIstasyon = await executeQuery(
        `SELECT istasyon_id FROM istasyon 
         WHERE istasyon_adi = ? AND il = ? AND ilce = ? AND istasyon_id != ? AND aktif_mi = TRUE`,
        [istasyon_adi, il, ilce, istasyonId]
      );
      
      if (Array.isArray(duplicateIstasyon) && duplicateIstasyon.length > 0) {
        return NextResponse.json(
          { error: 'Bu isimde başka bir istasyon zaten mevcut.' }, 
          { status: 400 }
        );
      }

      // İstasyonu güncelle
      await executeQuery(
        `UPDATE istasyon 
         SET istasyon_adi = ?, il = ?, ilce = ?, adres = ?, aktif_mi = ?, updated_at = CURRENT_TIMESTAMP
         WHERE istasyon_id = ?`,
        [istasyon_adi, il, ilce, adres || null, aktif_mi ? 1 : 0, istasyonId]
      );

      return NextResponse.json({
        success: true,
        message: 'İstasyon başarıyla güncellendi.'
      });
    }

  } catch (error) {
    console.error('İstasyon güncelleme hatası:', error);
    return NextResponse.json({ 
      error: 'İstasyon güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// İstasyon silme (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const istasyonId = parseInt(id);

    if (isNaN(istasyonId)) {
      return NextResponse.json(
        { error: 'Geçersiz istasyon ID.' },
        { status: 400 }
      );
    }

    console.log('İstasyon silme isteği:', { istasyonId });

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_istasyon_sil', [istasyonId]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'İstasyon silinirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // İstasyon var mı kontrol et
      const existingIstasyon = await executeQuery(
        'SELECT istasyon_id FROM istasyon WHERE istasyon_id = ?',
        [istasyonId]
      );

      if (!Array.isArray(existingIstasyon) || existingIstasyon.length === 0) {
        return NextResponse.json(
          { error: 'İstasyon bulunamadı.' },
          { status: 404 }
        );
      }

      // İstasyonun aktif seferi var mı kontrol et
      const activeSeferler = await executeQuery(
        `SELECT COUNT(*) as count FROM sefer 
         WHERE (kalkis_istasyon_id = ? OR varis_istasyon_id = ?) 
         AND aktif_mi = TRUE AND kalkis_tarihi > NOW()`,
        [istasyonId, istasyonId]
      );

      const seferCount = Array.isArray(activeSeferler) && activeSeferler.length > 0 
        ? (activeSeferler[0] as any).count 
        : 0;

      if (seferCount > 0) {
        return NextResponse.json(
          { error: 'Bu istasyonun aktif seferleri bulunduğu için silinemez.' }, 
          { status: 400 }
        );
      }

      // İstasyonu pasif yap (soft delete)
      await executeQuery(
        `UPDATE istasyon 
         SET aktif_mi = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE istasyon_id = ?`,
        [istasyonId]
      );

      return NextResponse.json({
        success: true,
        message: 'İstasyon başarıyla silindi.'
      });
    }

  } catch (error) {
    console.error('İstasyon silme hatası:', error);
    return NextResponse.json({ 
      error: 'İstasyon silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 