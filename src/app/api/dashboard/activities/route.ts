import { NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/db';

export async function GET() {
  try {
    console.log('Son işlemler istendi');

    // Son aktiviteleri stored procedure ile al
    const activities = await executeStoredProcedure('sp_dashboard_aktiviteler', []);

    const formattedActivities = Array.isArray(activities) ? activities.map((activity: any) => ({
      id: `${activity.tip}_${activity.tarih}`,
      tip: activity.tip,
      aciklama: activity.aciklama,
      tarih: activity.tarih,
      tutar: activity.tutar
    })) : [];

    console.log('Son işlemler başarıyla alındı:', formattedActivities.length, 'işlem');
    return NextResponse.json(formattedActivities);

  } catch (error: any) {
    console.error('Son işlemler hatası:', error);
    return NextResponse.json(
      { error: 'Son işlemler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 