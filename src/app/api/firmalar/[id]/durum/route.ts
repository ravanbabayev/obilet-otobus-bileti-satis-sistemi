import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure, executeQuery } from '@/lib/db';

export async function PUT(
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
      const results = await executeStoredProcedure('sp_firma_durum_degistir', [firmaId]);

      if (results && Array.isArray(results) && results.length > 0 && (results[0] as any)?.durum === 'BAŞARILI') {
        return NextResponse.json({
          success: true,
          message: (results[0] as any).mesaj,
          yeni_durum: (results[0] as any).yeni_durum
        });
      } else {
        return NextResponse.json(
          { error: (results as any)?.[0]?.mesaj || 'Firma durum değiştirirken hata oluştu' }, 
          { status: 400 }
        );
      }
    } catch (spError) {
      // Saklı yordam yoksa basit sorgu kullan
      console.log('Saklı yordam bulunamadı, basit sorgu kullanılıyor:', spError);

      // Firma varlığı ve mevcut durumu kontrol et
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

      const currentStatus = (existingFirma[0] as any).aktif_mi;
      const newStatus = !currentStatus;

      // Eğer aktiften pasife çeviriyorsak, aktif seferler kontrolü yap
      if (currentStatus && !newStatus) {
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
      }

      // Durumu değiştir
      await executeQuery(
        'UPDATE otobus_firmasi SET aktif_mi = ?, updated_at = CURRENT_TIMESTAMP WHERE firma_id = ?',
        [newStatus, firmaId]
      );

      return NextResponse.json({
        success: true,
        message: `Firma başarıyla ${newStatus ? 'aktif' : 'pasif'} duruma getirildi.`,
        yeni_durum: newStatus
      });
    }

  } catch (error) {
    console.error('Firma durum değiştirirken hata:', error);
    return NextResponse.json({ 
      error: 'Firma durumu değiştirilemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 