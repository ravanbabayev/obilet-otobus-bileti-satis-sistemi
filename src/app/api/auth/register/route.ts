import { executeStoredProcedure } from "@/lib/db";
import { NextResponse } from "next/server";

// Kullanıcı kaydı API endpoint'i
export async function POST(request: Request) {
  try {
    const { ad, soyad, tc_kimlik_no, dogum_tarihi, cinsiyet, telefon, email, sifre } = await request.json();

    // Kullanıcı kaydı için saklı yordamı çağır
    const results = await executeStoredProcedure("sp_kullanici_ekle", [
      ad,
      soyad,
      tc_kimlik_no,
      dogum_tarihi,
      cinsiyet,
      telefon,
      email,
      sifre,
    ]);

    // Kullanıcı ID'sini al
    const kullanici_id = results[0][0]?.kullanici_id;

    if (!kullanici_id) {
      return NextResponse.json(
        { error: "Kullanıcı kaydı oluşturulamadı" },
        { status: 500 }
      );
    }

    // Başarılı yanıt döndür
    return NextResponse.json({ 
      success: true, 
      message: "Kullanıcı başarıyla kaydedildi", 
      kullanici_id 
    });
  } catch (error: any) {
    console.error("Register error:", error);
    
    // MySQL duplicate key hatası kontrolü
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "Bu e-posta adresi veya TC kimlik numarası zaten kullanılıyor" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

