import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// Kullanıcının biletlerini listeleme API endpoint'i
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kullanici_id = parseInt(params.id);

    // Kullanıcı ID'sini kontrol et
    if (isNaN(kullanici_id)) {
      return NextResponse.json(
        { error: "Geçersiz kullanıcı ID" },
        { status: 400 }
      );
    }

    // Kullanıcının biletlerini almak için saklı yordamı çağır
    const results = await executeStoredProcedure("sp_kullanici_biletleri", [
      kullanici_id,
    ]);

    // Sonuçları döndür
    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("User tickets error:", error);
    return NextResponse.json(
      { error: "Kullanıcı biletleri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

