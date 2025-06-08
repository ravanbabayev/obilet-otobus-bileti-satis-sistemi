'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar } from 'lucide-react';
import { BiletAramaForm as BiletAramaFormType } from '@/types';

const sehirler = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Gaziantep',
  'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri',
  'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya',
  'Uşak', 'Eskişehir', 'Trabzon', 'Elazığ', 'Malatya', 'Erzurum', 'Tekirdağ',
  'Zonguldak', 'Bartın', 'Kastamonu', 'Sinop', 'Çorum', 'Amasya', 'Tokat'
];

export default function BiletAramaForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BiletAramaFormType>({
    kalkis_il: '',
    varis_il: '',
    tarih: ''
  });
  const [errors, setErrors] = useState<Partial<BiletAramaFormType>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof BiletAramaFormType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BiletAramaFormType> = {};

    if (!formData.kalkis_il) {
      newErrors.kalkis_il = 'Kalkış şehri seçiniz';
    }

    if (!formData.varis_il) {
      newErrors.varis_il = 'Varış şehri seçiniz';
    }

    if (formData.kalkis_il && formData.varis_il && formData.kalkis_il === formData.varis_il) {
      newErrors.varis_il = 'Kalkış ve varış şehri aynı olamaz';
    }

    if (!formData.tarih) {
      newErrors.tarih = 'Tarih seçiniz';
    } else {
      const selectedDate = new Date(formData.tarih);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.tarih = 'Geçmiş tarih seçilemez';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create search URL with parameters
      const searchParams = new URLSearchParams({
        kalkis_il: formData.kalkis_il,
        varis_il: formData.varis_il,
        tarih: formData.tarih
      });

      router.push(`/seferler?${searchParams.toString()}`);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapCities = () => {
    setFormData(prev => ({
      ...prev,
      kalkis_il: prev.varis_il,
      varis_il: prev.kalkis_il
    }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kalkış Şehri */}
          <div className="space-y-2">
            <label htmlFor="kalkis_il" className="block text-sm font-medium text-gray-700">
              <MapPin className="inline w-4 h-4 mr-1" />
              Nereden
            </label>
            <select
              id="kalkis_il"
              value={formData.kalkis_il}
              onChange={(e) => handleInputChange('kalkis_il', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.kalkis_il ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Şehir seçiniz</option>
              {sehirler.map(sehir => (
                <option key={sehir} value={sehir}>{sehir}</option>
              ))}
            </select>
            {errors.kalkis_il && (
              <p className="text-sm text-red-600">{errors.kalkis_il}</p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center items-end pb-2">
            <button
              type="button"
              onClick={swapCities}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Şehirleri değiştir"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* Varış Şehri */}
          <div className="space-y-2">
            <label htmlFor="varis_il" className="block text-sm font-medium text-gray-700">
              <MapPin className="inline w-4 h-4 mr-1" />
              Nereye
            </label>
            <select
              id="varis_il"
              value={formData.varis_il}
              onChange={(e) => handleInputChange('varis_il', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.varis_il ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Şehir seçiniz</option>
              {sehirler.map(sehir => (
                <option key={sehir} value={sehir}>{sehir}</option>
              ))}
            </select>
            {errors.varis_il && (
              <p className="text-sm text-red-600">{errors.varis_il}</p>
            )}
          </div>
        </div>

        {/* Tarih ve Arama Butonu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label htmlFor="tarih" className="block text-sm font-medium text-gray-700">
              <Calendar className="inline w-4 h-4 mr-1" />
              Tarih
            </label>
            <input
              type="date"
              id="tarih"
              value={formData.tarih}
              min={today}
              onChange={(e) => handleInputChange('tarih', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.tarih ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.tarih && (
              <p className="text-sm text-red-600">{errors.tarih}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Sefer Ara
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 