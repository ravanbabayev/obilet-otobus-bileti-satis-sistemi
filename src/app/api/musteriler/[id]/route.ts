import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Müşteri detayı getirme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const musteriId = parseInt(id);

    if (isNaN(musteriId)) {
      return NextResponse.json(
        { error: 'Geçersiz müşteri ID' }, 
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        m.musteri_id,
        m.ad,
        m.soyad,
        m.tc_kimlik_no,
        m.telefon,
        m.email,
        m.created_at,
        COUNT(b.bilet_id) as bilet_sayisi,
        SUM(CASE WHEN b.bilet_durumu = 'AKTIF' THEN b.ucret ELSE 0 END) as toplam_harcama,
        MAX(b.bilet_tarihi) as son_satin_alma
      FROM musteri m
      LEFT JOIN bilet b ON m.musteri_id = b.musteri_id
      WHERE m.musteri_id = ?
      GROUP BY m.musteri_id
    `;

    const results = await executeQuery(query, [musteriId]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(results[0]);

  } catch (error) {
    console.error('Müşteri detayı alınırken hata:', error);
    return NextResponse.json({ 
      error: 'Müşteri detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Müşteri güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const musteriId = parseInt(id);
    const body = await request.json();
    const { ad, soyad, tc_kimlik_no, telefon, email } = body;

    if (isNaN(musteriId)) {
      return NextResponse.json(
        { error: 'Geçersiz müşteri ID' }, 
        { status: 400 }
      );
    }

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

    // Müşteri varlığı kontrolü
    const existingCustomer = await executeQuery(
      'SELECT musteri_id FROM musteri WHERE musteri_id = ?',
      [musteriId]
    );

    if (!Array.isArray(existingCustomer) || existingCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' }, 
        { status: 404 }
      );
    }

    // TC kimlik no tekrarı kontrolü (kendi ID'si hariç)
    const duplicateCheck = await executeQuery(
      'SELECT musteri_id FROM musteri WHERE tc_kimlik_no = ? AND musteri_id != ?',
      [tc_kimlik_no, musteriId]
    );

    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json(
        { error: 'Bu TC kimlik numarası ile kayıtlı başka bir müşteri mevcut' }, 
        { status: 400 }
      );
    }

    // Müşteri güncelleme
    await executeQuery(
      `UPDATE musteri 
       SET ad = ?, soyad = ?, tc_kimlik_no = ?, telefon = ?, email = ?
       WHERE musteri_id = ?`,
      [ad, soyad, tc_kimlik_no, telefon, email || null, musteriId]
    );

    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Müşteri güncellenirken hata:', error);
    return NextResponse.json({ 
      error: 'Müşteri güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// Müşteri silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const musteriId = parseInt(id);

    if (isNaN(musteriId)) {
      return NextResponse.json(
        { error: 'Geçersiz müşteri ID' }, 
        { status: 400 }
      );
    }

    // Müşteri varlığı kontrolü
    const existingCustomer = await executeQuery(
      'SELECT musteri_id FROM musteri WHERE musteri_id = ?',
      [musteriId]
    );

    if (!Array.isArray(existingCustomer) || existingCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' }, 
        { status: 404 }
      );
    }

    // Aktif bilet kontrolü
    const activeTickets = await executeQuery(
      `SELECT COUNT(*) as aktif_bilet_sayisi 
       FROM bilet 
       WHERE musteri_id = ? AND bilet_durumu = 'AKTIF'`,
      [musteriId]
    );

    if (Array.isArray(activeTickets) && activeTickets.length > 0 && (activeTickets[0] as any).aktif_bilet_sayisi > 0) {
      return NextResponse.json(
        { error: 'Aktif bileti olan müşteri silinemez. Önce biletleri iptal edin.' }, 
        { status: 400 }
      );
    }

    // Müşteri silme
    await executeQuery(
      'DELETE FROM musteri WHERE musteri_id = ?',
      [musteriId]
    );

    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    });

  } catch (error) {
    console.error('Müşteri silinirken hata:', error);
    return NextResponse.json({ 
      error: 'Müşteri silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 