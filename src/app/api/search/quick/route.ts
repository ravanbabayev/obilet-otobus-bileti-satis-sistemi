import { executeStoredProcedure } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Arama terimi gereklidir' },
        { status: 400 }
      );
    }

    console.log('Hızlı arama yapılıyor:', query);

    let results: any[] = [];

    // Bilet numarası ile arama (sadece sayı ise)
    if (/^\d+$/.test(query)) {
      try {
        const biletResults = await executeStoredProcedure('sp_hizli_arama', [
          query, null, null
        ]);
        if (Array.isArray(biletResults) && biletResults.length > 0) {
          results = biletResults;
        }
      } catch (error) {
        console.log('Bilet arama hatası:', error);
      }
    }

    // TC kimlik numarası ile arama (11 haneli sayı ise)
    if (results.length === 0 && /^\d{11}$/.test(query)) {
      try {
        const tcResults = await executeStoredProcedure('sp_hizli_arama', [
          null, query, null
        ]);
        if (Array.isArray(tcResults) && tcResults.length > 0) {
          results = tcResults;
        }
      } catch (error) {
        console.log('TC arama hatası:', error);
      }
    }

    // Telefon numarası ile arama
    if (results.length === 0) {
      try {
        const telefonResults = await executeStoredProcedure('sp_hizli_arama', [
          null, null, query
        ]);
        if (Array.isArray(telefonResults) && telefonResults.length > 0) {
          results = telefonResults;
        }
      } catch (error) {
        console.log('Telefon arama hatası:', error);
      }
    }

    console.log('Hızlı arama sonucu:', results.length, 'kayıt bulundu');
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Hızlı arama hatası:', error);
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 