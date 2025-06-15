import { NextResponse } from 'next/server';
import { testConnection, executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // Temel bağlantı testi
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Veritabanı bağlantısı başarısız',
        error: 'Connection failed'
      }, { status: 500 });
    }

    // Firma tablosu test sorgusu
    try {
      const firmaCount = await executeQuery('SELECT COUNT(*) as count FROM otobus_firmasi');
      
      // Stored procedure test
      let spTestResult = null;
      try {
        const spTest = await executeQuery('SHOW PROCEDURE STATUS WHERE Name = "sp_firma_tumunu_getir"');
        spTestResult = Array.isArray(spTest) && spTest.length > 0 ? 'Bulundu' : 'Bulunamadı';
      } catch (spError) {
        spTestResult = 'Test edilemedi';
      }

      return NextResponse.json({
        success: true,
        message: 'Veritabanı bağlantısı başarılı',
        data: {
          connectionStatus: 'Başarılı',
          firmaCount: Array.isArray(firmaCount) && firmaCount.length > 0 ? (firmaCount[0] as any).count : 0,
          storedProcedureStatus: spTestResult,
          timestamp: new Date().toISOString()
        }
      });
    } catch (queryError) {
      return NextResponse.json({
        success: false,
        message: 'Bağlantı var ama tablo erişiminde sorun',
        error: queryError instanceof Error ? queryError.message : 'Query error',
        connectionStatus: 'Bağlantı OK, tablo sorunu'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Veritabanı test hatası',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 