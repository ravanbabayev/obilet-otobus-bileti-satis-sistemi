import { testConnection } from "@/lib/db";
import { NextResponse } from "next/server";

// Veritabanı bağlantısını test etme API endpoint'i
export async function GET(request: Request) {
  try {
    const isConnected = await testConnection();

    if (isConnected) {
      return NextResponse.json({
        status: "success",
        message: "Veritabanı bağlantısı başarılı",
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Veritabanı bağlantısı başarısız",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database connection test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Veritabanı bağlantısı test edilirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}

