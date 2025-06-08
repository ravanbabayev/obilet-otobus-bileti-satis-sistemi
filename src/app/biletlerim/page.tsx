'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Calendar, Clock, MapPin, Bus, User, CreditCard, X, Download, RefreshCw } from 'lucide-react';

interface Bilet {
  bilet_id: number;
  bilet_kodu: string;
  sefer_id: number;
  koltuk_no: number;
  ucret: number;
  satin_alma_tarihi: string;
  bilet_durumu: 'aktif' | 'iptal' | 'kullanildi';
  iptal_tarihi?: string;
  kalkis_zamani: string;
  varis_zamani: string;
  firma_adi: string;
  plaka: string;
  kalkis_istasyon_adi: string;
  kalkis_il: string;
  varis_istasyon_adi: string;
  varis_il: string;
  odeme_durumu: 'başarılı' | 'başarısız' | 'iade' | 'beklemede';
}

export default function BiletlerimPage() {
  const router = useRouter();
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [kullanici, setKullanici] = useState(null);
  const [iptalEdilecekBilet, setIptalEdilecekBilet] = useState<number | null>(null);
  const [iptalNedeni, setIptalNedeni] = useState('');
  const [iptalLoading, setIptalLoading] = useState(false);

  useEffect(() => {
    // Kullanıcı kontrolü
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/giris?redirect=/biletlerim');
      return;
    }

    const userData = JSON.parse(userStr);
    setKullanici(userData);

    // Biletleri yükle
    loadBiletler(userData.kullanici_id);
  }, [router]);

  const loadBiletler = async (kullanici_id: number) => {
    setLoading(true);
    try {
      // Mock biletler - gerçek uygulamada API'den gelecek
      const mockBiletler: Bilet[] = [
        {
          bilet_id: 1001,
          bilet_kodu: 'OB20241220000105',
          sefer_id: 1,
          koltuk_no: 15,
          ucret: 150.00,
          satin_alma_tarihi: '2024-12-19T10:30:00',
          bilet_durumu: 'aktif',
          kalkis_zamani: '2024-12-20T08:00:00',
          varis_zamani: '2024-12-20T13:00:00',
          firma_adi: 'Metro Turizm',
          plaka: '34MT1001',
          kalkis_istasyon_adi: 'Büyük İstanbul Otogarı',
          kalkis_il: 'İstanbul',
          varis_istasyon_adi: 'Ankara AŞTİ',
          varis_il: 'Ankara',
          odeme_durumu: 'başarılı'
        },
        {
          bilet_id: 1002,
          bilet_kodu: 'OB20241215000210',
          sefer_id: 2,
          koltuk_no: 10,
          ucret: 200.00,
          satin_alma_tarihi: '2024-12-14T15:45:00',
          bilet_durumu: 'kullanildi',
          kalkis_zamani: '2024-12-15T09:00:00',
          varis_zamani: '2024-12-15T18:00:00',
          firma_adi: 'Ulusoy',
          plaka: '34UL2001',
          kalkis_istasyon_adi: 'Büyük İstanbul Otogarı',
          kalkis_il: 'İstanbul',
          varis_istasyon_adi: 'İzmir Büyük Otogar',
          varis_il: 'İzmir',
          odeme_durumu: 'başarılı'
        }
      ];

      setBiletler(mockBiletler);

      // Gerçek API çağrısı:
      /*
      const response = await fetch(`/api/biletler/kullanici/${kullanici_id}`);
      if (response.ok) {
        const data = await response.json();
        setBiletler(data.biletler);
      }
      */
    } catch (error) {
      console.error('Biletler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiletIptal = async () => {
    if (!iptalEdilecekBilet || !iptalNedeni.trim()) return;

    setIptalLoading(true);
    try {
      const response = await fetch(`/api/biletler/iptal/${iptalEdilecekBilet}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
          iptal_nedeni: iptalNedeni,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Biletleri yeniden yükle
        await loadBiletler(kullanici.kullanici_id);
        setIptalEdilecekBilet(null);
        setIptalNedeni('');
        alert('Bilet başarıyla iptal edildi.');
      } else {
        alert(result.message || 'Bilet iptal edilemedi.');
      }
    } catch (error) {
      console.error('Bilet iptal hatası:', error);
      alert('Bilet iptal edilirken bir hata oluştu.');
    } finally {
      setIptalLoading(false);
    }
  };

  const getBiletDurumRenk = (durum: string) => {
    switch (durum) {
      case 'aktif':
        return 'bg-green-100 text-green-800';
      case 'iptal':
        return 'bg-red-100 text-red-800';
      case 'kullanildi':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBiletDurumText = (durum: string) => {
    switch (durum) {
      case 'aktif':
        return 'Aktif';
      case 'iptal':
        return 'İptal Edildi';
      case 'kullanildi':
        return 'Kullanıldı';
      default:
        return durum;
    }
  };

  const iptalEdilebirMi = (bilet: Bilet) => {
    if (bilet.bilet_durumu !== 'aktif') return false;
    
    const now = new Date();
    const kalkisZamani = new Date(bilet.kalkis_zamani);
    const saatFarki = (kalkisZamani.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return saatFarki > 3; // 3 saatten fazla kaldıysa iptal edilebilir
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Biletlerim</h1>
          <p className="text-gray-600">
            Satın aldığınız biletleri görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>

        {/* Biletler */}
        {biletler.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz biletiniz yok
            </h3>
            <p className="text-gray-600 mb-6">
              İlk biletinizi satın almak için sefer araması yapın.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bilet Ara
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {biletler.map((bilet) => (
              <div
                key={bilet.bilet_id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Bilet Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {bilet.firma_adi}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Bilet Kodu: {bilet.bilet_kodu}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBiletDurumRenk(bilet.bilet_durumu)}`}>
                        {getBiletDurumText(bilet.bilet_durumu)}
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        ₺{bilet.ucret.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Sefer Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Kalkış */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Kalkış</span>
                      </div>
                      <p className="font-semibold text-gray-900">{bilet.kalkis_il}</p>
                      <p className="text-sm text-gray-600">{bilet.kalkis_istasyon_adi}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(bilet.kalkis_zamani).toLocaleDateString('tr-TR')}</span>
                        <Clock className="w-4 h-4 ml-2 mr-1" />
                        <span>{new Date(bilet.kalkis_zamani).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Varış */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Varış</span>
                      </div>
                      <p className="font-semibold text-gray-900">{bilet.varis_il}</p>
                      <p className="text-sm text-gray-600">{bilet.varis_istasyon_adi}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(bilet.varis_zamani).toLocaleDateString('tr-TR')}</span>
                        <Clock className="w-4 h-4 ml-2 mr-1" />
                        <span>{new Date(bilet.varis_zamani).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Koltuk ve Araç */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <User className="w-4 h-4 mr-2" />
                        <span className="text-sm">Koltuk & Araç</span>
                      </div>
                      <p className="font-semibold text-gray-900">Koltuk {bilet.koltuk_no}</p>
                      <p className="text-sm text-gray-600">{bilet.plaka}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span>Ödeme: {bilet.odeme_durumu}</span>
                      </div>
                    </div>
                  </div>

                  {/* Satın Alma Tarihi */}
                  <div className="text-sm text-gray-600 mb-4">
                    Satın Alma: {new Date(bilet.satin_alma_tarihi).toLocaleDateString('tr-TR')} {new Date(bilet.satin_alma_tarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* İptal Edilme Tarihi */}
                  {bilet.bilet_durumu === 'iptal' && bilet.iptal_tarihi && (
                    <div className="text-sm text-red-600 mb-4">
                      İptal Tarihi: {new Date(bilet.iptal_tarihi).toLocaleDateString('tr-TR')} {new Date(bilet.iptal_tarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {/* Aksiyonlar */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <Download className="w-4 h-4 mr-1" />
                        E-Bilet İndir
                      </button>
                    </div>
                    
                    {iptalEdilebirMi(bilet) && (
                      <button
                        onClick={() => setIptalEdilecekBilet(bilet.bilet_id)}
                        className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <X className="w-4 h-4 mr-1" />
                        İptal Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* İptal Modal */}
        {iptalEdilecekBilet && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Bilet İptal Et
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-4">
                          Bu bileti iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div>
                          <label htmlFor="iptal-nedeni" className="block text-sm font-medium text-gray-700 mb-2">
                            İptal Nedeni
                          </label>
                          <textarea
                            id="iptal-nedeni"
                            rows={3}
                            value={iptalNedeni}
                            onChange={(e) => setIptalNedeni(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            placeholder="İptal nedeninizi açıklayın..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={iptalLoading || !iptalNedeni.trim()}
                    onClick={handleBiletIptal}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {iptalLoading ? 'İptal Ediliyor...' : 'İptal Et'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIptalEdilecekBilet(null);
                      setIptalNedeni('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 