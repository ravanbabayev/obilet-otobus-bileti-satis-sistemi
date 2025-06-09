'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, User, Calendar, MapPin, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

// Ödeme form şeması
const odemeSchema = z.object({
  kart_no: z
    .string()
    .min(1, 'Kart numarası gerekli')
    .length(19, 'Kart numarası 16 haneli olmalı')
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/, 'Geçerli kart numarası formatı: 1234 5678 9012 3456'),
  kart_sahibi: z
    .string()
    .min(1, 'Kart sahibi adı gerekli')
    .min(3, 'Kart sahibi adı en az 3 karakter olmalı'),
  son_kullanma_ay: z
    .string()
    .min(1, 'Ay seçimi gerekli'),
  son_kullanma_yil: z
    .string()
    .min(1, 'Yıl seçimi gerekli'),
  cvv: z
    .string()
    .min(1, 'CVV gerekli')
    .length(3, 'CVV 3 haneli olmalı')
    .regex(/^\d{3}$/, 'CVV sadece rakam içermeli'),
  fatura_adresi: z
    .string()
    .min(1, 'Fatura adresi gerekli')
    .min(10, 'Fatura adresi en az 10 karakter olmalı'),
  sehir: z
    .string()
    .min(1, 'Şehir gerekli'),
  posta_kodu: z
    .string()
    .min(1, 'Posta kodu gerekli')
    .length(5, 'Posta kodu 5 haneli olmalı')
    .regex(/^\d{5}$/, 'Posta kodu sadece rakam içermeli'),
});

type OdemeFormData = z.infer<typeof odemeSchema>;

interface BiletBilgileri {
  sefer_id: string;
  koltuk_no: string;
  ucret: number;
  firma_adi: string;
  kalkis_istasyon_adi: string;
  varis_istasyon_adi: string;
  kalkis_zamani: string;
  varis_zamani: string;
}

export default function OdemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [biletBilgileri, setBiletBilgileri] = useState<BiletBilgileri | null>(null);
  const [kullanici, setKullanici] = useState(null);
  const [adim, setAdim] = useState<'odeme' | 'onay' | 'basarili'>('odeme');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OdemeFormData>({
    resolver: zodResolver(odemeSchema),
  });

  // Kart numarası formatla
  const kartNoValue = watch('kart_no');
  useEffect(() => {
    if (kartNoValue) {
      const formatted = kartNoValue
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim();
      if (formatted !== kartNoValue) {
        setValue('kart_no', formatted);
      }
    }
  }, [kartNoValue, setValue]);

  // Sayfa yüklendiğinde bilet bilgilerini al
  useEffect(() => {
    const sefer_id = searchParams.get('sefer_id');
    const koltuk_no = searchParams.get('koltuk_no');
    
    if (!sefer_id || !koltuk_no) {
      router.push('/');
      return;
    }

    // Kullanıcı kontrolü
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/giris?redirect=/odeme');
      return;
    }

    setKullanici(JSON.parse(userStr));

    // URL'den gelen ücret bilgisini al
    const ucret = searchParams.get('ucret');
    
    if (!ucret) {
      router.push('/');
      return;
    }

    // Bilet bilgilerini oluştur (gerçek uygulamada API'den gelecek)
    setBiletBilgileri({
      sefer_id,
      koltuk_no,
      ucret: parseFloat(ucret),
      firma_adi: 'Metro Turizm', // API'den gelecek
      kalkis_istasyon_adi: 'Büyük İstanbul Otogarı', // API'den gelecek
      varis_istasyon_adi: 'Ankara AŞTİ', // API'den gelecek
      kalkis_zamani: '2024-12-20T08:00:00', // API'den gelecek
      varis_zamani: '2024-12-20T13:00:00', // API'den gelecek
    });
  }, [searchParams, router]);

  const onSubmit = async (data: OdemeFormData) => {
    setLoading(true);

    try {
      // Ödeme işlemini simüle et
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Bilet satın alma API'sini çağır
      const response = await fetch('/api/biletler/satin-al', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
          sefer_id: biletBilgileri?.sefer_id,
          koltuk_no: biletBilgileri?.koltuk_no,
          ucret: biletBilgileri?.ucret,
          odeme_yontemi: 'kredi_karti',
          kart_no_son4: data.kart_no.slice(-4),
          odeme_bilgileri: data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdim('basarili');
          
          // 3 saniye sonra biletlerim sayfasına yönlendir
          setTimeout(() => {
            router.push('/biletlerim');
          }, 3000);
        } else {
          throw new Error(result.message || 'Ödeme işlemi başarısız');
        }
      } else {
        throw new Error('Ödeme işlemi başarısız');
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!biletBilgileri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (adim === 'basarili') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ödeme Başarılı!
            </h1>
            <p className="text-gray-600 mb-4">
              Biletiniz başarıyla satın alındı. E-biletiniz email adresinize gönderildi.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              3 saniye sonra otomatik olarak biletlerim sayfasına yönlendirileceksiniz.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/biletlerim')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Biletlerimi Görüntüle
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ödeme Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Kredi Kartı Bilgileri
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Kart Numarası */}
                <div>
                  <label htmlFor="kart_no" className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Numarası
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('kart_no')}
                      type="text"
                      id="kart_no"
                      maxLength={19}
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.kart_no ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  {errors.kart_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.kart_no.message}</p>
                  )}
                </div>

                {/* Kart Sahibi */}
                <div>
                  <label htmlFor="kart_sahibi" className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Üzerindeki İsim
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('kart_sahibi')}
                      type="text"
                      id="kart_sahibi"
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.kart_sahibi ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="JOHN DOE"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.kart_sahibi && (
                    <p className="mt-1 text-sm text-red-600">{errors.kart_sahibi.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Son Kullanma Ay */}
                  <div>
                    <label htmlFor="son_kullanma_ay" className="block text-sm font-medium text-gray-700 mb-2">
                      Ay
                    </label>
                    <select
                      {...register('son_kullanma_ay')}
                      id="son_kullanma_ay"
                      className={`
                        block w-full px-3 py-3 border rounded-lg shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.son_kullanma_ay ? 'border-red-300' : 'border-gray-300'}
                      `}
                    >
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    {errors.son_kullanma_ay && (
                      <p className="mt-1 text-sm text-red-600">{errors.son_kullanma_ay.message}</p>
                    )}
                  </div>

                  {/* Son Kullanma Yıl */}
                  <div>
                    <label htmlFor="son_kullanma_yil" className="block text-sm font-medium text-gray-700 mb-2">
                      Yıl
                    </label>
                    <select
                      {...register('son_kullanma_yil')}
                      id="son_kullanma_yil"
                      className={`
                        block w-full px-3 py-3 border rounded-lg shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.son_kullanma_yil ? 'border-red-300' : 'border-gray-300'}
                      `}
                    >
                      <option value="">Yıl</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    {errors.son_kullanma_yil && (
                      <p className="mt-1 text-sm text-red-600">{errors.son_kullanma_yil.message}</p>
                    )}
                  </div>

                  {/* CVV */}
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        {...register('cvv')}
                        type="text"
                        id="cvv"
                        maxLength={3}
                        className={`
                          block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${errors.cvv ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="123"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                {/* Fatura Adresi */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fatura Adresi</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fatura_adresi" className="block text-sm font-medium text-gray-700 mb-2">
                        Adres
                      </label>
                      <textarea
                        {...register('fatura_adresi')}
                        id="fatura_adresi"
                        rows={3}
                        className={`
                          block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${errors.fatura_adresi ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="Tam adresinizi girin"
                      />
                      {errors.fatura_adresi && (
                        <p className="mt-1 text-sm text-red-600">{errors.fatura_adresi.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sehir" className="block text-sm font-medium text-gray-700 mb-2">
                          Şehir
                        </label>
                        <input
                          {...register('sehir')}
                          type="text"
                          id="sehir"
                          className={`
                            block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${errors.sehir ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder="İstanbul"
                        />
                        {errors.sehir && (
                          <p className="mt-1 text-sm text-red-600">{errors.sehir.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="posta_kodu" className="block text-sm font-medium text-gray-700 mb-2">
                          Posta Kodu
                        </label>
                        <input
                          {...register('posta_kodu')}
                          type="text"
                          id="posta_kodu"
                          maxLength={5}
                          className={`
                            block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${errors.posta_kodu ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder="34000"
                        />
                        {errors.posta_kodu && (
                          <p className="mt-1 text-sm text-red-600">{errors.posta_kodu.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Güvenlik Bilgisi */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Güvenli Ödeme
                      </h4>
                      <p className="text-sm text-blue-700">
                        Kart bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. 
                        Kart bilgileriniz saklanmaz.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ödeme Butonu */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }
                    transition-all duration-200
                  `}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Ödeme İşleniyor...
                    </div>
                  ) : (
                    `₺${biletBilgileri.ucret.toFixed(2)} Öde`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Özeti
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{biletBilgileri.firma_adi}</p>
                    <p className="text-sm text-gray-500">
                      {biletBilgileri.kalkis_istasyon_adi} → {biletBilgileri.varis_istasyon_adi}
                    </p>
                    <p className="text-sm text-gray-500">
                      Koltuk: {biletBilgileri.koltuk_no}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(biletBilgileri.kalkis_zamani).toLocaleDateString('tr-TR')} • {' '}
                      {new Date(biletBilgileri.kalkis_zamani).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bilet Ücreti</span>
                    <span className="text-sm font-medium">₺{biletBilgileri.ucret.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Hizmet Bedeli</span>
                    <span className="text-sm font-medium">₺0.00</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Toplam</span>
                    <span className="text-lg font-bold text-green-600">
                      ₺{biletBilgileri.ucret.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 