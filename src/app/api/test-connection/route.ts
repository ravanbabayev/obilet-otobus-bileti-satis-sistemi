import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Veritabanı bağlantısını test etme API endpoint'i
export async function GET() {
  try {
    const result = await executeQuery('SELECT COUNT(*) as count FROM otobus_firmasi WHERE aktif_mi = TRUE');
    const count = Array.isArray(result) && result.length > 0 ? (result[0] as any).count : 0;
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı',
      activeCompanies: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Veritabanı bağlantısı başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Önce eski seferleri sil
    await executeQuery('DELETE FROM sefer WHERE sefer_id BETWEEN 1 AND 21');
    
    // Yeni seferleri ekle (15 Haziran 2025'ten sonraki tarihler)
    const seferler = [
      // İstanbul - Ankara seferleri
      [1, 1, 4, '2025-06-16 08:00:00', '2025-06-16 13:30:00', 250.00],
      [2, 1, 4, '2025-06-16 14:00:00', '2025-06-16 19:30:00', 250.00],
      [3, 1, 4, '2025-06-16 20:00:00', '2025-06-17 01:30:00', 280.00],
      [1, 1, 4, '2025-06-17 08:00:00', '2025-06-17 13:30:00', 250.00],
      [2, 1, 4, '2025-06-17 14:00:00', '2025-06-17 19:30:00', 250.00],

      // Ankara - İstanbul seferleri
      [4, 4, 1, '2025-06-16 09:00:00', '2025-06-16 14:30:00', 250.00],
      [5, 4, 1, '2025-06-16 15:00:00', '2025-06-16 20:30:00', 250.00],
      [6, 4, 1, '2025-06-16 21:00:00', '2025-06-17 02:30:00', 280.00],

      // İstanbul - İzmir seferleri
      [7, 1, 6, '2025-06-16 10:00:00', '2025-06-16 18:00:00', 300.00],
      [8, 1, 6, '2025-06-16 22:00:00', '2025-06-17 06:00:00', 320.00],
      [9, 1, 6, '2025-06-17 10:00:00', '2025-06-17 18:00:00', 300.00],

      // İzmir - İstanbul seferleri
      [10, 6, 1, '2025-06-16 11:00:00', '2025-06-16 19:00:00', 300.00],
      [1, 6, 1, '2025-06-16 23:00:00', '2025-06-17 07:00:00', 320.00],

      // İstanbul - Antalya seferleri
      [2, 1, 8, '2025-06-16 12:00:00', '2025-06-17 01:00:00', 400.00],
      [3, 1, 8, '2025-06-17 12:00:00', '2025-06-18 01:00:00', 400.00],

      // Antalya - İstanbul seferleri
      [4, 8, 1, '2025-06-16 13:00:00', '2025-06-17 02:00:00', 400.00],
      [5, 8, 1, '2025-06-17 13:00:00', '2025-06-18 02:00:00', 400.00],

      // Ankara - İzmir seferleri
      [6, 4, 6, '2025-06-16 14:00:00', '2025-06-16 22:00:00', 350.00],
      [7, 4, 6, '2025-06-17 14:00:00', '2025-06-17 22:00:00', 350.00],

      // İzmir - Ankara seferleri
      [8, 6, 4, '2025-06-16 15:00:00', '2025-06-16 23:00:00', 350.00],
      [9, 6, 4, '2025-06-17 15:00:00', '2025-06-17 23:00:00', 350.00],

      // Gelecek hafta için ek seferler
      [1, 1, 4, '2025-06-18 08:00:00', '2025-06-18 13:30:00', 250.00],
      [2, 1, 4, '2025-06-19 08:00:00', '2025-06-19 13:30:00', 250.00],
      [3, 1, 4, '2025-06-20 08:00:00', '2025-06-20 13:30:00', 250.00]
    ];

    for (const sefer of seferler) {
      await executeQuery(
        'INSERT INTO sefer (otobus_id, kalkis_istasyon_id, varis_istasyon_id, kalkis_tarihi, varis_tarihi, ucret) VALUES (?, ?, ?, ?, ?, ?)',
        sefer
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sefer verileri başarıyla güncellendi',
      count: seferler.length
    });

  } catch (error) {
    console.error('Sefer güncelleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Sefer verileri güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

