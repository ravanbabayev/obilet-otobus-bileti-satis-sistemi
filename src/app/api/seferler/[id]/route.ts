import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

// Sefer detayı getirme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const seferId = parseInt(resolvedParams.id);
    
    if (isNaN(seferId)) {
      return NextResponse.json(
        { error: 'Geçersiz sefer ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_detay', [seferId]);
      
      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json(
          { error: 'Sefer bulunamadı' }, 
          { status: 404 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);
      
      const query = `
        SELECT 
          s.sefer_id,
          s.kalkis_tarihi,
          s.kalkis_saati,
          s.varis_tarihi,
          s.varis_saati,
          s.fiyat,
          s.aktif_mi,
          s.created_at,
          s.updated_at,
          o.otobus_id,
          o.plaka,
          o.koltuk_sayisi,
          f.firma_id,
          f.firma_adi,
          ks.istasyon_id as kalkis_istasyon_id,
          ks.istasyon_adi as kalkis_istasyon_adi,
          ki.il_adi as kalkis_il,
          kic.ilce_adi as kalkis_ilce,
          vs.istasyon_id as varis_istasyon_id,
          vs.istasyon_adi as varis_istasyon_adi,
          vi.il_adi as varis_il,
          vic.ilce_adi as varis_ilce,
          COUNT(CASE WHEN b.durum = 'SATIN_ALINDI' THEN 1 END) as satilan_koltuk,
          (o.koltuk_sayisi - COUNT(CASE WHEN b.durum = 'SATIN_ALINDI' THEN 1 END)) as bos_koltuk
        FROM sefer s
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN il ki ON ks.il_id = ki.il_id
        INNER JOIN ilce kic ON ks.ilce_id = kic.ilce_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        INNER JOIN il vi ON vs.il_id = vi.il_id
        INNER JOIN ilce vic ON vs.ilce_id = vic.ilce_id
        LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND b.durum != 'IPTAL'
        WHERE s.sefer_id = ?
        GROUP BY s.sefer_id
      `;
      
      const results: any = await executeQuery(query, [seferId]);
      
      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json(
          { error: 'Sefer bulunamadı' }, 
          { status: 404 }
        );
      }
    }

  } catch (error) {
    console.error('Sefer detayı alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Sefer detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Sefer güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const seferId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { 
      otobus_id,
      kalkis_istasyon_id,
      varis_istasyon_id,
      kalkis_tarihi,
      kalkis_saati,
      varis_tarihi,
      varis_saati,
      fiyat
    } = body;

    if (isNaN(seferId)) {
      return NextResponse.json(
        { error: 'Geçersiz sefer ID' }, 
        { status: 400 }
      );
    }

    // Validasyon
    if (!otobus_id || !kalkis_istasyon_id || !varis_istasyon_id || 
        !kalkis_tarihi || !kalkis_saati || !varis_tarihi || !varis_saati || !fiyat) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' }, 
        { status: 400 }
      );
    }

    // Fiyat kontrolü
    if (parseFloat(fiyat) <= 0) {
      return NextResponse.json(
        { error: 'Fiyat 0\'dan büyük olmalıdır' }, 
        { status: 400 }
      );
    }

    // Tarih ve saat kontrolü
    const kalkisDateTime = new Date(`${kalkis_tarihi}T${kalkis_saati}`);
    const varisDateTime = new Date(`${varis_tarihi}T${varis_saati}`);

    if (varisDateTime <= kalkisDateTime) {
      return NextResponse.json(
        { error: 'Varış tarihi ve saati kalkış tarihinden sonra olmalıdır' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_guncelle', [
        seferId,
        otobus_id,
        kalkis_istasyon_id,
        varis_istasyon_id,
        kalkis_tarihi,
        kalkis_saati,
        varis_tarihi,
        varis_saati,
        fiyat
      ]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Sefer güncellenirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Sefer varlığı kontrolü
      const existingSefer = await executeQuery(
        'SELECT sefer_id, aktif_mi FROM sefer WHERE sefer_id = ?',
        [seferId]
      );
      
      if (!Array.isArray(existingSefer) || existingSefer.length === 0) {
        return NextResponse.json(
          { error: 'Sefer bulunamadı.' }, 
          { status: 404 }
        );
      }

      // Satılmış bilet kontrolü
      const soldTickets = await executeQuery(
        `SELECT COUNT(*) as count FROM bilet 
         WHERE sefer_id = ? AND durum = 'SATIN_ALINDI'`,
        [seferId]
      );
      
      if (Array.isArray(soldTickets) && soldTickets.length > 0 && (soldTickets[0] as any).count > 0) {
        return NextResponse.json(
          { error: 'Bu sefere ait satılmış biletler bulunmaktadır. Güncelleme yapılamaz.' }, 
          { status: 400 }
        );
      }

      // Aynı otobüsün aynı tarih ve saatte başka seferi var mı kontrol et (kendisi hariç)
      const conflictingSefer = await executeQuery(
        `SELECT sefer_id FROM sefer 
         WHERE otobus_id = ? AND kalkis_tarihi = ? AND kalkis_saati = ? 
         AND aktif_mi = TRUE AND sefer_id != ?`,
        [otobus_id, kalkis_tarihi, kalkis_saati, seferId]
      );
      
      if (Array.isArray(conflictingSefer) && conflictingSefer.length > 0) {
        return NextResponse.json(
          { error: 'Bu otobüsün belirtilen tarih ve saatte zaten başka bir seferi var.' }, 
          { status: 400 }
        );
      }

      // Otobüs, istasyon kontrolleri (firmalar API'sindeki gibi)
      const otobusControl = await executeQuery(
        `SELECT o.otobus_id, o.aktif_mi FROM otobus o WHERE o.otobus_id = ?`,
        [otobus_id]
      );
      
      if (!Array.isArray(otobusControl) || otobusControl.length === 0) {
        return NextResponse.json(
          { error: 'Otobüs bulunamadı.' }, 
          { status: 400 }
        );
      }

      if (!(otobusControl[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Pasif otobüse sefer tanımlanamaz.' }, 
          { status: 400 }
        );
      }

      // İstasyon kontrolleri
      const istasyonControl = await executeQuery(
        `SELECT 
          (SELECT COUNT(*) FROM istasyon WHERE istasyon_id = ? AND aktif_mi = TRUE) as kalkis_aktif,
          (SELECT COUNT(*) FROM istasyon WHERE istasyon_id = ? AND aktif_mi = TRUE) as varis_aktif`,
        [kalkis_istasyon_id, varis_istasyon_id]
      );
      
      if (Array.isArray(istasyonControl) && istasyonControl.length > 0) {
        const control = istasyonControl[0] as any;
        if (control.kalkis_aktif === 0) {
          return NextResponse.json(
            { error: 'Kalkış istasyonu bulunamadı veya aktif değil.' }, 
            { status: 400 }
          );
        }
        if (control.varis_aktif === 0) {
          return NextResponse.json(
            { error: 'Varış istasyonu bulunamadı veya aktif değil.' }, 
            { status: 400 }
          );
        }
      }

      if (kalkis_istasyon_id === varis_istasyon_id) {
        return NextResponse.json(
          { error: 'Kalkış ve varış istasyonu aynı olamaz.' }, 
          { status: 400 }
        );
      }

      // Seferi güncelle
      await executeQuery(
        `UPDATE sefer 
         SET otobus_id = ?, kalkis_istasyon_id = ?, varis_istasyon_id = ?,
             kalkis_tarihi = ?, kalkis_saati = ?, varis_tarihi = ?, varis_saati = ?,
             fiyat = ?, updated_at = CURRENT_TIMESTAMP
         WHERE sefer_id = ?`,
        [otobus_id, kalkis_istasyon_id, varis_istasyon_id, 
         kalkis_tarihi, kalkis_saati, varis_tarihi, varis_saati, fiyat, seferId]
      );

      return NextResponse.json({
        success: true,
        message: 'Sefer başarıyla güncellendi.'
      });
    }

  } catch (error) {
    console.error('Sefer güncellenirken hata:', error);
    return NextResponse.json({ 
      error: 'Sefer güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Sefer silme (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const seferId = parseInt(resolvedParams.id);

    if (isNaN(seferId)) {
      return NextResponse.json(
        { error: 'Geçersiz sefer ID' }, 
        { status: 400 }
      );
    }

    try {
      // Önce saklı yordamı dene
      const results = await executeStoredProcedure('sp_sefer_sil', [seferId]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Sefer silinirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Sefer varlığı kontrolü
      const existingSefer = await executeQuery(
        'SELECT sefer_id, aktif_mi FROM sefer WHERE sefer_id = ?',
        [seferId]
      );
      
      if (!Array.isArray(existingSefer) || existingSefer.length === 0) {
        return NextResponse.json(
          { error: 'Sefer bulunamadı.' }, 
          { status: 404 }
        );
      }

      if (!(existingSefer[0] as any).aktif_mi) {
        return NextResponse.json(
          { error: 'Sefer zaten pasif durumda.' }, 
          { status: 400 }
        );
      }

      // Satılmış bilet kontrolü
      const soldTickets = await executeQuery(
        `SELECT COUNT(*) as count FROM bilet 
         WHERE sefer_id = ? AND durum = 'SATIN_ALINDI'`,
        [seferId]
      );
      
      if (Array.isArray(soldTickets) && soldTickets.length > 0 && (soldTickets[0] as any).count > 0) {
        return NextResponse.json(
          { error: 'Bu sefere ait satılmış biletler bulunmaktadır. Önce biletleri iptal ediniz.' }, 
          { status: 400 }
        );
      }

      // Soft delete - seferi pasif yap
      await executeQuery(
        'UPDATE sefer SET aktif_mi = FALSE, updated_at = CURRENT_TIMESTAMP WHERE sefer_id = ?',
        [seferId]
      );

      return NextResponse.json({
        success: true,
        message: 'Sefer başarıyla silindi (pasif duruma getirildi).'
      });
    }

  } catch (error) {
    console.error('Sefer silinirken hata:', error);
    return NextResponse.json({ 
      error: 'Sefer silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

