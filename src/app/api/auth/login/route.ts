import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// Kullanıcı girişi API endpoint'i
export async function POST(request: Request) {
  try {
    const { email, sifre } = await request.json();

    // Kullanıcı girişi için saklı yordamı çağır
    const results = await executeStoredProcedure("sp_kullanici_giris", [
      email,
      sifre,
    ]);

    // Kullanıcı bulunamadıysa hata döndür
    if (!results[0] || results[0].length === 0) {
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini döndür
    return NextResponse.json(results[0][0]);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

