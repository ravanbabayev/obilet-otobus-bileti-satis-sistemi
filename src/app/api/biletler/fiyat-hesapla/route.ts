import { executeFunction } from "@/lib/db";
import { NextResponse } from "next/server";

// Bilet fiyatı hesaplama API endpoint'i
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kalkis_il = searchParams.get("kalkis_il");
    const varis_il = searchParams.get("varis_il");
    const firma_id = searchParams.get("firma_id");
    const koltuk_no = searchParams.get("koltuk_no");

    // Parametreleri kontrol et
    if (!kalkis_il || !varis_il || !firma_id || !koltuk_no) {
      return NextResponse.json(
        { error: "Kalkış ili, varış ili, firma ID ve koltuk numarası parametreleri gereklidir" },
        { status: 400 }
      );
    }

    // Bilet fiyatı hesaplamak için kullanıcı tanımlı fonksiyonu çağır
    const results = await executeFunction("fn_bilet_fiyati_hesapla", [
      kalkis_il,
      varis_il,
      parseInt(firma_id),
      parseInt(koltuk_no),
    ]);

    // Sonucu döndür
    return NextResponse.json({
      ucret: results[0].result,
    });
  } catch (error) {
    console.error("Fare calculation error:", error);
    return NextResponse.json(
      { error: "Bilet fiyatı hesaplanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

