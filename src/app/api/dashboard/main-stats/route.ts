import { NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

export async function GET() {
  try {
    console.log('Ana sayfa istatistikleri istendi');

    // Ana istatistikleri stored procedure ile al
    const statsResults = await executeStoredProcedure('sp_dashboard_ana_istatistikler', []);
    
    // Son satışları stored procedure ile al
    const salesResults = await executeStoredProcedure('sp_dashboard_son_satislar', []);

    const stats = Array.isArray(statsResults) && statsResults.length > 0 ? statsResults[0] : {
      bugun_satilan_bilet: 0,
      bugun_gelir: '0.00',
      aktif_sefer_sayisi: 0,
      bekleyen_musteriler: 0
    };

    const recentSales = Array.isArray(salesResults) ? salesResults.slice(0, 5).map(sale => ({
      bilet_id: sale.bilet_id,
      musteri_adi: sale.musteri_adi,
      sefer_bilgisi: sale.sefer_bilgisi,
      ucret: parseFloat(sale.ucret),
      satis_zamani: sale.satis_zamani,
      bilet_tarihi: sale.bilet_tarihi
    })) : [];

    const response = {
      bilet: stats.bugun_satilan_bilet || 0,
      gelir: stats.bugun_gelir || '0.00',
      sefer: stats.aktif_sefer_sayisi || 0,
      sonSatis: recentSales.length,
      recentSales: recentSales
    };

    console.log('Ana sayfa istatistikleri başarıyla alındı:', response);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Ana sayfa istatistikleri hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 