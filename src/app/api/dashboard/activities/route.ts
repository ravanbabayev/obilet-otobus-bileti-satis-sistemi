import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Son işlemler istendi');

    // Get recent activities from different tables
    const recentActivities = await executeQuery(`
      (
        SELECT 
          'sefer' as type,
          CONCAT('Yeni sefer eklendi: ', ks.il, ' → ', vs.il, ' - ', TIME(s.kalkis_tarihi)) as description,
          f.firma_adi as detail,
          s.created_at as timestamp
        FROM sefer s
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN otobus_firmasi f ON o.firma_id = f.firma_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY s.created_at DESC
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 
          'bilet' as type,
          CASE 
            WHEN b.bilet_durumu = 'AKTIF' THEN CONCAT('Yeni bilet satışı: ', ks.il, ' → ', vs.il)
            WHEN b.bilet_durumu = 'IPTAL' THEN CONCAT('Bilet iptali: Bilet #', b.bilet_id)
            ELSE CONCAT('Bilet güncellendi: Bilet #', b.bilet_id)
          END as description,
          CONCAT(m.ad, ' ', m.soyad) as detail,
          GREATEST(b.created_at, COALESCE(b.updated_at, b.created_at)) as timestamp
        FROM bilet b
        INNER JOIN musteri m ON b.musteri_id = m.musteri_id
        INNER JOIN sefer s ON b.sefer_id = s.sefer_id
        INNER JOIN otobus o ON s.otobus_id = o.otobus_id
        INNER JOIN istasyon ks ON s.kalkis_istasyon_id = ks.istasyon_id
        INNER JOIN istasyon vs ON s.varis_istasyon_id = vs.istasyon_id
        WHERE GREATEST(b.created_at, COALESCE(b.updated_at, b.created_at)) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY timestamp DESC
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 
          'firma' as type,
          CONCAT('Firma güncellendi: ', f.firma_adi) as description,
          CONCAT('Tel: ', f.telefon) as detail,
          GREATEST(f.created_at, COALESCE(f.updated_at, f.created_at)) as timestamp
        FROM otobus_firmasi f
        WHERE GREATEST(f.created_at, COALESCE(f.updated_at, f.created_at)) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY timestamp DESC
        LIMIT 2
      )
      UNION ALL
      (
        SELECT 
          'musteri' as type,
          CONCAT('Yeni müşteri kaydı: ', m.ad, ' ', m.soyad) as description,
          m.telefon as detail,
          m.created_at as timestamp
        FROM musteri m
        WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY m.created_at DESC
        LIMIT 2
      )
      ORDER BY timestamp DESC
      LIMIT 8
    `, []);

    console.log('Son işlemler başarıyla alındı:', recentActivities.length, 'işlem');

    return NextResponse.json({
      success: true,
      data: recentActivities
    });

  } catch (error) {
    console.error('Son işlemler alınırken hata:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Son işlemler alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 