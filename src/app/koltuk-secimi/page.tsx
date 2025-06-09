'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, MapPin, Bus, User, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface Seat {
  koltuk_no: number;
  durum: 'boş' | 'dolu';
  cinsiyet?: 'E' | 'K' | null;
}

interface TripInfo {
  sefer_id: number;
  kalkis_zamani: string;
  varis_zamani: string;
  temel_ucret: number;
  firma_adi: string;
  plaka: string;
  kalkis_istasyon_adi: string;
  kalkis_il: string;
  varis_istasyon_adi: string;
  varis_il: string;
  koltuk_sayisi: number;
}

export default function KoltukSecimiPage() {
  const searchParams = useSearchParams();
  const sefer_id = searchParams.get('sefer_id');

  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sefer_id) {
      fetchSeatLayout();
    }
  }, [sefer_id]);

  const fetchSeatLayout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/koltuklar/${sefer_id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Koltuk bilgileri yüklenirken hata oluştu');
      }

      setTripInfo(result.data.trip);
      setSeats(result.data.seats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  const calculateDuration = (kalkis: string, varis: string) => {
    const duration = new Date(varis).getTime() - new Date(kalkis).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}s ${minutes}dk`;
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.durum === 'dolu') {
      return seat.cinsiyet === 'E' ? 'bg-blue-500' : 'bg-pink-500';
    }
    if (seat.koltuk_no === selectedSeat) {
      return 'bg-green-500';
    }
    return 'bg-gray-200 hover:bg-gray-300';
  };

  const getSeatTextColor = (seat: Seat) => {
    if (seat.durum === 'dolu' || seat.koltuk_no === selectedSeat) {
      return 'text-white';
    }
    return 'text-gray-700';
  };

  const isSeatSelectable = (seat: Seat) => {
    return seat.durum === 'boş';
  };

  const handleSeatClick = (seat: Seat) => {
    if (isSeatSelectable(seat)) {
      setSelectedSeat(seat.koltuk_no === selectedSeat ? null : seat.koltuk_no);
    }
  };

  const renderSeatLayout = () => {
    if (!seats.length) return null;

    const rows = Math.ceil(seats.length / 4); // 4 seats per row (2+2 configuration)
    const seatRows = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      
      // Left side seats (1, 5, 9, ...)
      for (let col = 0; col < 2; col++) {
        const seatIndex = row * 4 + col;
        if (seatIndex < seats.length) {
          const seat = seats[seatIndex];
          rowSeats.push(
            <button
              key={seat.koltuk_no}
              onClick={() => handleSeatClick(seat)}
              disabled={!isSeatSelectable(seat)}
              className={`
                w-10 h-10 rounded-md border-2 border-gray-400 text-sm font-medium
                transition-colors duration-200 disabled:cursor-not-allowed
                ${getSeatColor(seat)} ${getSeatTextColor(seat)}
              `}
              title={`Koltuk ${seat.koltuk_no} ${seat.durum === 'dolu' ? '(Dolu)' : '(Boş)'}`}
            >
              {seat.koltuk_no}
            </button>
          );
        }
      }

      // Add aisle
      rowSeats.push(
        <div key={`aisle-${row}`} className="w-8"></div>
      );

      // Right side seats (3, 7, 11, ...)
      for (let col = 2; col < 4; col++) {
        const seatIndex = row * 4 + col;
        if (seatIndex < seats.length) {
          const seat = seats[seatIndex];
          rowSeats.push(
            <button
              key={seat.koltuk_no}
              onClick={() => handleSeatClick(seat)}
              disabled={!isSeatSelectable(seat)}
              className={`
                w-10 h-10 rounded-md border-2 border-gray-400 text-sm font-medium
                transition-colors duration-200 disabled:cursor-not-allowed
                ${getSeatColor(seat)} ${getSeatTextColor(seat)}
              `}
              title={`Koltuk ${seat.koltuk_no} ${seat.durum === 'dolu' ? '(Dolu)' : '(Boş)'}`}
            >
              {seat.koltuk_no}
            </button>
          );
        }
      }

      seatRows.push(
        <div key={row} className="flex items-center justify-center space-x-2 mb-2">
          {rowSeats}
        </div>
      );
    }

    return seatRows;
  };

  if (!sefer_id) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Geçersiz Sefer</h1>
            <p className="text-gray-600 mb-8">Koltuk seçimi için geçerli bir sefer seçmeniz gerekir.</p>
            <Link
              href="/seferler"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Seferlere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Koltuk bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tripInfo) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
            <p className="text-gray-600 mb-4">{error || 'Sefer bilgileri yüklenemedi'}</p>
            <button
              onClick={fetchSeatLayout}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors mr-4"
            >
              Tekrar Dene
            </button>
            <Link
              href="/seferler"
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Seferlere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trip Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Koltuk Seçimi</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Route Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(tripInfo.kalkis_zamani)}
                  </div>
                  <div className="text-sm text-gray-600">{tripInfo.kalkis_istasyon_adi}</div>
                  <div className="text-sm text-gray-500">{tripInfo.kalkis_il}</div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <div className="flex-1 border-t border-gray-300 mx-2"></div>
                    <Bus className="w-5 h-5 text-red-600" />
                    <div className="flex-1 border-t border-gray-300 mx-2"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {calculateDuration(tripInfo.kalkis_zamani, tripInfo.varis_zamani)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(tripInfo.varis_zamani)}
                  </div>
                  <div className="text-sm text-gray-600">{tripInfo.varis_istasyon_adi}</div>
                  <div className="text-sm text-gray-500">{tripInfo.varis_il}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatDate(tripInfo.kalkis_zamani)}</span>
                <span>{tripInfo.firma_adi} • {tripInfo.plaka}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-center lg:text-right">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ₺{Number(tripInfo.temel_ucret).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Kişi başı</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Layout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Koltuk Planı</h2>
              
              {/* Bus Front */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg text-sm font-medium">
                  ŞOFÖR
                </div>
              </div>

              {/* Seat Layout */}
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                {renderSeatLayout()}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded mr-2"></div>
                  <span>Boş</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 border-2 border-gray-400 rounded mr-2"></div>
                  <span>Seçili</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 border-2 border-gray-400 rounded mr-2"></div>
                  <span>Dolu (E)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-500 border-2 border-gray-400 rounded mr-2"></div>
                  <span>Dolu (K)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="space-y-6">
            {/* Selected Seat */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seçilen Koltuk</h3>
              
              {selectedSeat ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-lg text-xl font-bold mb-3">
                    {selectedSeat}
                  </div>
                  <p className="text-gray-600">Koltuk numarası seçildi</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Lütfen bir koltuk seçiniz</p>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bilet Ücreti:</span>
                  <span className="font-semibold">₺{Number(tripInfo.temel_ucret).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hizmet Bedeli:</span>
                  <span className="font-semibold">₺5.00</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Toplam:</span>
                  <span className="text-red-600">₺{(Number(tripInfo.temel_ucret) + 5).toFixed(2)}</span>
                </div>
                
                {selectedSeat ? (
                  <Link
                    href={`/odeme?sefer_id=${tripInfo.sefer_id}&koltuk_no=${selectedSeat}&ucret=${Number(tripInfo.temel_ucret) + 5}`}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    Devam Et
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 px-6 rounded-md cursor-not-allowed"
                  >
                    Önce Koltuk Seçiniz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 