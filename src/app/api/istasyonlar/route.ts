import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// İstasyonları listeleme API endpoint'i
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const il = searchParams.get("il");

    let results;

    if (il) {
      // İle göre istasyonları almak için saklı yordamı çağır
      results = await executeStoredProcedure("sp_il_istasyonlari", [il]);
    } else {
      // Tüm istasyonları almak için saklı yordamı çağır
      results = await executeStoredProcedure("sp_istasyon_listele", []);
    }

    // Sonuçları döndür
    return NextResponse.json(results || []);
  } catch (error) {
    console.error("Stations error:", error);
    return NextResponse.json(
      { error: "İstasyonlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

