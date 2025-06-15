import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// Bilet satın alma API endpoint'i
export async function POST(request: Request) {
  try {
    const { kullanici_id, sefer_id, koltuk_no, ucret } = await request.json();

    // Parametreleri kontrol et
    if (!kullanici_id || !sefer_id || !koltuk_no || !ucret) {
      return NextResponse.json(
        { error: "Kullanıcı ID, sefer ID, koltuk numarası ve ücret parametreleri gereklidir" },
        { status: 400 }
      );
    }

    // Bilet eklemek için saklı yordamı çağır
    const results = await executeStoredProcedure("sp_bilet_ekle", [
      kullanici_id,
      sefer_id,
      koltuk_no,
      ucret,
    ]);

    // Bilet ID'sini al
    const bilet_id = results[0][0]?.bilet_id;

    if (!bilet_id) {
      return NextResponse.json(
        { error: "Bilet satın alınamadı" },
        { status: 500 }
      );
    }

    // Bilet detayını almak için saklı yordamı çağır
    const biletDetayResults = await executeStoredProcedure("sp_bilet_getir", [
      bilet_id,
    ]);

    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: "Bilet başarıyla satın alındı",
      bilet: biletDetayResults[0][0],
    });
  } catch (error: any) {
    console.error("Bilet purchase error:", error);
    
    // MySQL hata mesajını kontrol et
    if (error.message && error.message.includes("Bu koltuk zaten dolu")) {
      return NextResponse.json(
        { error: "Bu koltuk zaten dolu veya rezerve edilmiş" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Bilet satın alma işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

