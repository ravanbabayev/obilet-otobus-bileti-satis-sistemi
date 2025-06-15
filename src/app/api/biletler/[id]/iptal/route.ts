import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// Bilet iptal etme API endpoint'i
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bilet_id = parseInt(params.id);

    // Bilet ID'sini kontrol et
    if (isNaN(bilet_id)) {
      return NextResponse.json(
        { error: "Geçersiz bilet ID" },
        { status: 400 }
      );
    }

    // Bilet iptal etmek için saklı yordamı çağır
    try {
      await executeStoredProcedure("sp_bilet_iptal", [bilet_id]);
      
      // Başarılı yanıt döndür
      return NextResponse.json({
        success: true,
        message: "Bilet başarıyla iptal edildi",
      });
    } catch (error: any) {
      // Kalkış saatine 3 saatten az kaldığı için iptal edilemez hatası
      if (error.message && error.message.includes("3 saatten az kaldığı için")) {
        return NextResponse.json(
          { error: "Kalkış saatine 3 saatten az kaldığı için bilet iptal edilemez" },
          { status: 400 }
        );
      }
      
      throw error; // Diğer hataları tekrar fırlat
    }
  } catch (error) {
    console.error("Bilet cancel error:", error);
    return NextResponse.json(
      { error: "Bilet iptal işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

