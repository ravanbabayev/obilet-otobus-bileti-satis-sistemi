'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BiletAramaForm from '@/components/BiletAramaForm';
import { Clock, MapPin, Bus, Users, Wifi, Monitor, Wind, ArrowRight } from 'lucide-react';
import { Sefer } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

export default function SeferlerPage() {
  const searchParams = useSearchParams();
  const [seferler, setSeferler] = useState<Sefer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'fiyat' | 'saat' | 'sure'>('saat');
  const [filterFirma, setFilterFirma] = useState<string>('');

  const kalkis_il = searchParams.get('kalkis_il');
  const varis_il = searchParams.get('varis_il');
  const tarih = searchParams.get('tarih');

  useEffect(() => {
    if (kalkis_il && varis_il && tarih) {
      fetchSeferler();
    }
  }, [kalkis_il, varis_il, tarih]);

  const fetchSeferler = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        kalkis_il: kalkis_il!,
        varis_il: varis_il!,
        tarih: tarih!
      });

      const response = await fetch(`/api/seferler/ara?${searchParams}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Seferler yüklenirken hata oluştu');
      }

      // API'den dönen veri nested array formatında olabilir
      let seferData = result.data || [];
      
      // Eğer data array içinde array varsa, ilk array'i al (MySQL stored procedure response format)
      if (Array.isArray(seferData) && seferData.length > 0 && Array.isArray(seferData[0])) {
        seferData = seferData[0];
      }

      setSeferler(seferData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCompanies = () => {
    const companies = seferler.map(sefer => sefer.firma_adi).filter(Boolean);
    return [...new Set(companies)] as string[];
  };

  const filteredAndSortedSeferler = () => {
    let filtered = seferler;

    // Filter by company
    if (filterFirma) {
      filtered = filtered.filter(sefer => sefer.firma_adi === filterFirma);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'fiyat':
          return a.temel_ucret - b.temel_ucret;
        case 'saat':
          return new Date(a.kalkis_zamani).getTime() - new Date(b.kalkis_zamani).getTime();
        case 'sure':
          const durationA = new Date(a.varis_zamani).getTime() - new Date(a.kalkis_zamani).getTime();
          const durationB = new Date(b.varis_zamani).getTime() - new Date(b.kalkis_zamani).getTime();
          return durationA - durationB;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const formatTime = (dateString: string) => {
    try {
      if (!dateString || dateString === 'undefined' || dateString === 'null') return '--:--';
      // Handle string dates like "2024-06-09 08:00:00"
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing manually for MySQL format
        const matches = dateString.match(/(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})/);
        if (matches) {
          const [, datePart, timePart] = matches;
          const [hours, minutes] = timePart.split(':');
          return `${hours}:${minutes}`;
        }
        return '--:--';
      }
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('formatTime error:', error, dateString);
      return '--:--';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === 'undefined' || dateString === 'null') return 'Geçersiz tarih';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing date string manually for formats like "2024-06-09"
        const matches = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (matches) {
          const [, year, month, day] = matches;
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, 'dd MMMM yyyy', { locale: tr });
          }
        }
        return 'Geçersiz tarih';
      }
      return format(date, 'dd MMMM yyyy', { locale: tr });
    } catch (error) {
      console.error('formatDate error:', error, dateString);
      return 'Geçersiz tarih';
    }
  };

  const calculateDuration = (kalkis: string, varis: string) => {
    try {
      if (!kalkis || !varis) return '--s --dk';
      const kalkisDate = new Date(kalkis);
      const varisDate = new Date(varis);
      
      if (isNaN(kalkisDate.getTime()) || isNaN(varisDate.getTime())) {
        return '--s --dk';
      }
      
      const duration = varisDate.getTime() - kalkisDate.getTime();
      if (duration < 0) return '--s --dk';
      
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}s ${minutes}dk`;
    } catch (error) {
      console.error('calculateDuration error:', error, kalkis, varis);
      return '--s --dk';
    }
  };

  if (!kalkis_il || !varis_il || !tarih) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sefer Arama</h1>
            <p className="text-gray-600 mb-8">Seferleri görüntülemek için arama yapınız.</p>
            <BiletAramaForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {kalkis_il} → {varis_il}
                </h1>
                <p className="text-gray-600">
                  {formatDate(tarih!)} • {seferler.length} sefer bulundu
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sırala:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'fiyat' | 'saat' | 'sure')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="saat">Kalkış Saati</option>
                    <option value="fiyat">Fiyat</option>
                    <option value="sure">Süre</option>
                  </select>
                </div>

                {/* Filter by Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firma:
                  </label>
                  <select
                    value={filterFirma}
                    onChange={(e) => setFilterFirma(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Tüm Firmalar</option>
                    {getUniqueCompanies().map((company, index) => (
                      <option key={`company-${index}-${company}`} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Seferler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchSeferler}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredAndSortedSeferler().length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Bus className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sefer Bulunamadı</h2>
              <p className="text-gray-600 mb-6">
                Aradığınız kriterlere uygun sefer bulunmamaktadır. Lütfen farklı tarih veya güzergah deneyin.
              </p>
              <BiletAramaForm />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedSeferler().map((sefer, index) => (
                <div key={`sefer-${sefer.sefer_id || index}-${index}`} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-gray-900">{sefer.firma_adi || 'Firma'}</h3>
                      <p className="text-sm text-gray-600">{sefer.plaka || '---'}</p>
                    </div>

                    {/* Route Info */}
                    <div className="lg:col-span-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatTime(sefer.kalkis_zamani)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sefer.kalkis_istasyon_adi || kalkis_il}
                          </div>
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
                            {calculateDuration(sefer.kalkis_zamani, sefer.varis_zamani)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatTime(sefer.varis_zamani)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sefer.varis_istasyon_adi || varis_il}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-center space-x-2">
                        <Wifi className="w-5 h-5 text-green-600" title="WiFi" />
                        <Monitor className="w-5 h-5 text-green-600" title="TV" />
                        <Wind className="w-5 h-5 text-green-600" title="Klima" />
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="lg:col-span-2 text-center lg:text-right">
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        ₺{Number(sefer.temel_ucret || 0).toFixed(2)}
                      </div>
                      <Link
                        href={`/koltuk-secimi?sefer_id=${sefer.sefer_id}`}
                        className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Koltuk Seç
                      </Link>
                    </div>
                                      </div>
                  </div>
                ))}
            </div>
          )}

          {/* New Search */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Arama Yap</h2>
            <BiletAramaForm />
          </div>
        </div>
    </div>
  );
} 