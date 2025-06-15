import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Müşteri listesi getirme
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = `
      SELECT
        musteri_id,
        ad,
        soyad,
        tc_kimlik_no,
        telefon,
        email,
        created_at
      FROM musteri
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search && search.trim() !== '') {
      query += ` AND (
        ad LIKE CONCAT('%', ?, '%') OR
        soyad LIKE CONCAT('%', ?, '%') OR
        tc_kimlik_no LIKE CONCAT('%', ?, '%') OR
        telefon LIKE CONCAT('%', ?, '%') OR
        email LIKE CONCAT('%', ?, '%')
      )`;
      for (let i = 0; i < 5; i++) {
        params.push(search);
      }
    }

    query += ` ORDER BY created_at DESC`;

    const results = await executeQuery(query, params);
    return NextResponse.json(results || []);

  } catch (error) {
    console.error('Müşteri listesi alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Müşteri listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Müşteri ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad, soyad, tc_kimlik_no, telefon, email } = body;

    // Validasyon
    if (!ad || !soyad || !tc_kimlik_no || !telefon) {
      return NextResponse.json(
        { error: 'Ad, soyad, TC kimlik no ve telefon zorunludur' }, 
        { status: 400 }
      );
    }

    // TC Kimlik No validasyonu
    if (!/^[1-9][0-9]{10}$/.test(tc_kimlik_no)) {
      return NextResponse.json(
        { error: 'Geçersiz TC Kimlik No' }, 
        { status: 400 }
      );
    }

    // Telefon validasyonu
    const cleanPhone = telefon.replace(/[^\d]/g, '');
    if (!/^(5\d{9}|0[0-9]{10})$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Geçersiz telefon numarası' }, 
        { status: 400 }
      );
    }

    // TC kimlik no tekrarı kontrolü
    const existingCustomer = await executeQuery(
      'SELECT musteri_id FROM musteri WHERE tc_kimlik_no = ?',
      [tc_kimlik_no]
    );

    if (Array.isArray(existingCustomer) && existingCustomer.length > 0) {
      return NextResponse.json(
        { error: 'Bu TC kimlik numarası ile kayıtlı müşteri zaten mevcut' }, 
        { status: 400 }
      );
    }

    // Müşteri ekleme
    const result: any = await executeQuery(
      `INSERT INTO musteri (ad, soyad, tc_kimlik_no, telefon, email) 
       VALUES (?, ?, ?, ?, ?)`,
      [ad, soyad, tc_kimlik_no, telefon, email || null]
    );

    const musteri_id = result.insertId;

    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla eklendi',
      musteri_id: musteri_id
    });

  } catch (error) {
    console.error('Müşteri eklenirken hata:', error);
    return NextResponse.json({ 
      error: 'Müşteri eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 