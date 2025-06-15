import { executeFunction } from "@/lib/db";
import { NextResponse } from "next/server";

// Sefer doluluk oranı hesaplama API endpoint'i
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sefer_id = parseInt(params.id);

    // Sefer ID'sini kontrol et
    if (isNaN(sefer_id)) {
      return NextResponse.json(
        { error: "Geçersiz sefer ID" },
        { status: 400 }
      );
    }

    // Sefer doluluk oranını hesaplamak için kullanıcı tanımlı fonksiyonu çağır
    const results = await executeFunction("fn_sefer_doluluk_orani", [sefer_id]);

    // Sonucu döndür
    return NextResponse.json({
      doluluk_orani: results[0].result,
    });
  } catch (error) {
    console.error("Occupancy rate error:", error);
    return NextResponse.json(
      { error: "Sefer doluluk oranı hesaplanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

