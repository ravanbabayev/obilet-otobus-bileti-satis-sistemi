'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Users,
  Truck,
  MapPin,
  Activity,
  Clock,
  Building2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface RaporFilters {
  rapor_turu: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  firma_id: string;
}

interface GenelRapor {
  bilet: {
    toplam_bilet: number;
    aktif_bilet: number;
    iptal_bilet: number;
    kullanildi_bilet: number;
    toplam_satis: number;
    ortalama_bilet_fiyati: number;
  };
  firma: {
    toplam_firma: number;
    aktif_firma: number;
  };
  otobus: {
    toplam_otobus: number;
    aktif_otobus: number;
    toplam_kapasite: number;
  };
  sefer: {
    toplam_sefer: number;
    gelecek_sefer: number;
    devam_eden_sefer: number;
    tamamlanan_sefer: number;
  };
  istasyon: {
    toplam_istasyon: number;
    aktif_istasyon: number;
  };
  musteri: {
    toplam_musteri: number;
  };
}

interface Firma {
  firma_id: number;
  firma_adi: string;
}

export default function RaporlarPage() {
  const [filters, setFilters] = useState<RaporFilters>({
    rapor_turu: 'genel',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    firma_id: 'TUMU'
  });
  const [raporData, setRaporData] = useState<any>(null);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(false);

  // Firmaları getir
  const fetchFirmalar = async () => {
    try {
      const response = await fetch('/api/firmalar');
      if (response.ok) {
        const data = await response.json();
        setFirmalar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Firmalar alınırken hata:', error);
    }
  };

  // Rapor verilerini getir
  const fetchRapor = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/raporlar?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setRaporData(data);
      } else {
        console.error('Rapor getirilemedi');
        setRaporData(null);
      }
    } catch (error) {
      console.error('Rapor alınırken hata:', error);
      setRaporData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirmalar();
  }, []);

  useEffect(() => {
    fetchRapor();
  }, [filters]);

  const handleFilterChange = (key: keyof RaporFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    if (!raporData) return;
    
    // Basit CSV export implementasyonu
    const csvContent = JSON.stringify(raporData, null, 2);
    const blob = new Blob([csvContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor_${filters.rapor_turu}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderGenelRapor = (data: GenelRapor) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Bilet İstatistikleri */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Toplam Bilet</p>
            <p className="text-3xl font-bold">{data.bilet?.toplam_bilet || 0}</p>
          </div>
          <Users className="w-8 h-8 text-blue-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-blue-200">Aktif</p>
            <p className="font-semibold">{data.bilet?.aktif_bilet || 0}</p>
          </div>
          <div>
            <p className="text-blue-200">İptal</p>
            <p className="font-semibold">{data.bilet?.iptal_bilet || 0}</p>
          </div>
          <div>
            <p className="text-blue-200">Kullanıldı</p>
            <p className="font-semibold">{data.bilet?.kullanildi_bilet || 0}</p>
          </div>
        </div>
      </div>

      {/* Satış İstatistikleri */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Toplam Satış</p>
            <p className="text-2xl font-bold">{formatCurrency(data.bilet?.toplam_satis || 0)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-200" />
        </div>
        <div className="mt-4">
          <p className="text-green-200 text-sm">Ortalama Bilet Fiyatı</p>
          <p className="font-semibold">{formatCurrency(data.bilet?.ortalama_bilet_fiyati || 0)}</p>
        </div>
      </div>

      {/* Firma İstatistikleri */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100">Toplam Firma</p>
            <p className="text-3xl font-bold">{data.firma?.toplam_firma || 0}</p>
          </div>
          <Building2 className="w-8 h-8 text-purple-200" />
        </div>
        <div className="mt-4">
          <p className="text-purple-200 text-sm">Aktif Firma</p>
          <p className="font-semibold">{data.firma?.aktif_firma || 0}</p>
        </div>
      </div>

      {/* Otobüs İstatistikleri */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100">Toplam Otobüs</p>
            <p className="text-3xl font-bold">{data.otobus?.toplam_otobus || 0}</p>
          </div>
          <Truck className="w-8 h-8 text-orange-200" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-orange-200">Aktif</p>
            <p className="font-semibold">{data.otobus?.aktif_otobus || 0}</p>
          </div>
          <div>
            <p className="text-orange-200">Kapasite</p>
            <p className="font-semibold">{data.otobus?.toplam_kapasite || 0}</p>
          </div>
        </div>
      </div>

      {/* Sefer İstatistikleri */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Toplam Sefer</p>
            <p className="text-3xl font-bold">{data.sefer?.toplam_sefer || 0}</p>
          </div>
          <Activity className="w-8 h-8 text-red-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 text-xs">
          <div>
            <p className="text-red-200">Gelecek</p>
            <p className="font-semibold">{data.sefer?.gelecek_sefer || 0}</p>
          </div>
          <div>
            <p className="text-red-200">Devam</p>
            <p className="font-semibold">{data.sefer?.devam_eden_sefer || 0}</p>
          </div>
          <div>
            <p className="text-red-200">Bitti</p>
            <p className="font-semibold">{data.sefer?.tamamlanan_sefer || 0}</p>
          </div>
        </div>
      </div>

      {/* İstasyon İstatistikleri */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100">Toplam İstasyon</p>
            <p className="text-3xl font-bold">{data.istasyon?.toplam_istasyon || 0}</p>
          </div>
          <MapPin className="w-8 h-8 text-indigo-200" />
        </div>
        <div className="mt-4">
          <p className="text-indigo-200 text-sm">Aktif İstasyon</p>
          <p className="font-semibold">{data.istasyon?.aktif_istasyon || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderSatisRaporu = (data: any[]) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Satış Raporu</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bilet Sayısı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Bilet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İptal Bilet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Satış</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ortalama Fiyat</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.tarih)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.firma_adi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.bilet_sayisi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{item.aktif_bilet}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{item.iptal_bilet}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(item.toplam_satis)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(item.ortalama_fiyat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFirmaRaporu = (data: any[]) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Firma Performans Raporu</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Otobüs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sefer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Sefer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Bilet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Gelir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ort. Fiyat</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((firma, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{firma.firma_adi}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    firma.aktif_mi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {firma.aktif_mi ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firma.otobus_sayisi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firma.sefer_sayisi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{firma.aktif_sefer_sayisi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firma.toplam_bilet}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(firma.toplam_gelir)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(firma.ortalama_bilet_fiyati)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSeferRaporu = (data: any[]) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Sefer Raporu</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sefer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalkış</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varış</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doluluk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((sefer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sefer.firma_adi}</div>
                    <div className="text-sm text-gray-600">{sefer.plaka}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sefer.durum === 'BEKLEMEDE' ? 'bg-yellow-100 text-yellow-800' :
                    sefer.durum === 'DEVAM_EDIYOR' ? 'bg-blue-100 text-blue-800' :
                    sefer.durum === 'TAMAMLANDI' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sefer.durum}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sefer.kalkis_istasyonu}</div>
                  <div className="text-sm text-gray-500">{formatDateTime(sefer.kalkis_tarihi)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sefer.varis_istasyonu}</div>
                  <div className="text-sm text-gray-500">{formatDateTime(sefer.varis_tarihi)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sefer.aktif_bilet}/{sefer.koltuk_sayisi}</div>
                  <div className="text-sm text-gray-500">%{parseFloat(sefer.doluluk_orani || 0).toFixed(1)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(sefer.toplam_gelir)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGunlukRapor = (data: any) => (
    <div className="space-y-6">
      {/* Günlük Özet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Toplam Bilet</p>
              <p className="text-2xl font-bold text-blue-900">{data.bilet?.bilet_sayisi || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Toplam Satış</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(data.bilet?.toplam_satis || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">Toplam Sefer</p>
              <p className="text-2xl font-bold text-purple-900">{data.sefer?.sefer_sayisi || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600">Devam Eden</p>
              <p className="text-2xl font-bold text-orange-900">{data.sefer?.devam_eden_sefer || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saatlik Satış Grafiği */}
      {data.saatlik_satis && data.saatlik_satis.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saatlik Satış Dağılımı</h3>
          <div className="space-y-2">
            {data.saatlik_satis.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.saat}:00</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(item.bilet_sayisi / Math.max(...data.saatlik_satis.map((s: any) => s.bilet_sayisi))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.bilet_sayisi} bilet</span>
                <span className="text-sm text-gray-600 ml-2">{formatCurrency(item.satis)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Firma Bazında Satış */}
      {data.firma_satis && data.firma_satis.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Firma Bazında Satış</h3>
          <div className="space-y-3">
            {data.firma_satis.map((firma: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{firma.firma_adi}</p>
                  <p className="text-sm text-gray-600">{firma.bilet_sayisi} bilet</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(firma.toplam_satis)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/yonetim"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
                <p className="text-gray-600">Detaylı analiz ve raporları görüntüleyin</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              disabled={!raporData}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Rapor Filtreleri</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rapor Türü
              </label>
              <select
                value={filters.rapor_turu}
                onChange={(e) => handleFilterChange('rapor_turu', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="genel">Genel Özet</option>
                <option value="satis">Satış Raporu</option>
                <option value="firma">Firma Performans</option>
                <option value="sefer">Sefer Analizi</option>
                <option value="gunluk">Günlük Rapor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.baslangic_tarihi}
                onChange={(e) => handleFilterChange('baslangic_tarihi', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.bitis_tarihi}
                onChange={(e) => handleFilterChange('bitis_tarihi', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma
              </label>
              <select
                value={filters.firma_id}
                onChange={(e) => handleFilterChange('firma_id', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TUMU">Tüm Firmalar</option>
                {firmalar.map((firma) => (
                  <option key={firma.firma_id} value={firma.firma_id}>
                    {firma.firma_adi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Rapor yükleniyor...</p>
            </div>
          ) : !raporData ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Rapor verisi bulunamadı.</p>
            </div>
          ) : (
            <>
              {filters.rapor_turu === 'genel' && renderGenelRapor(raporData)}
              {filters.rapor_turu === 'satis' && Array.isArray(raporData) && renderSatisRaporu(raporData)}
              {filters.rapor_turu === 'firma' && Array.isArray(raporData) && renderFirmaRaporu(raporData)}
              {filters.rapor_turu === 'sefer' && Array.isArray(raporData) && renderSeferRaporu(raporData)}
              {filters.rapor_turu === 'gunluk' && raporData && renderGunlukRapor(raporData)}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 