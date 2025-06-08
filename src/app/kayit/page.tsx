'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Mail, Phone, Calendar, UserPlus } from 'lucide-react';

// Kayıt form şeması
const kayitSchema = z.object({
  tc_kimlik_no: z
    .string()
    .min(1, 'TC Kimlik No gerekli')
    .length(11, 'TC Kimlik No 11 haneli olmalı')
    .regex(/^\d+$/, 'TC Kimlik No sadece rakam içermeli'),
  ad: z
    .string()
    .min(1, 'Ad gerekli')
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  soyad: z
    .string()
    .min(1, 'Soyad gerekli')
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  dogum_tarihi: z
    .string()
    .min(1, 'Doğum tarihi gerekli'),
  cinsiyet: z
    .enum(['E', 'K'], { required_error: 'Cinsiyet seçimi gerekli' }),
  telefon: z
    .string()
    .min(1, 'Telefon numarası gerekli')
    .regex(/^[0-9+() -]+$/, 'Geçerli bir telefon numarası girin'),
  email: z
    .string()
    .min(1, 'Email adresi gerekli')
    .email('Geçerli bir email adresi girin'),
  sifre: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
  sifre_tekrar: z
    .string()
    .min(1, 'Şifre tekrarı gerekli'),
  kosullari_kabul: z
    .boolean()
    .refine(val => val === true, 'Kullanım koşullarını kabul etmelisiniz'),
}).refine((data) => data.sifre === data.sifre_tekrar, {
  message: "Şifreler eşleşmiyor",
  path: ["sifre_tekrar"],
});

type KayitFormData = z.infer<typeof kayitSchema>;

export default function KayitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [genel_hata, setGenelHata] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KayitFormData>({
    resolver: zodResolver(kayitSchema),
  });

  const onSubmit = async (data: KayitFormData) => {
    setLoading(true);
    setGenelHata('');

    try {
      const response = await fetch('/api/auth/kayit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Başarılı kayıt - kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Ana sayfaya yönlendir
        router.push('/');
        router.refresh();
      } else {
        setGenelHata(result.message || 'Kayıt olurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setGenelHata('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Kayıt Ol</h1>
            <p className="text-blue-100">Yeni hesap oluşturun</p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            {genel_hata && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {genel_hata}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ad */}
                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('ad')}
                      type="text"
                      id="ad"
                      autoComplete="given-name"
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.ad ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="Adınız"
                    />
                  </div>
                  {errors.ad && (
                    <p className="mt-1 text-sm text-red-600">{errors.ad.message}</p>
                  )}
                </div>

                {/* Soyad */}
                <div>
                  <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('soyad')}
                      type="text"
                      id="soyad"
                      autoComplete="family-name"
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.soyad ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="Soyadınız"
                    />
                  </div>
                  {errors.soyad && (
                    <p className="mt-1 text-sm text-red-600">{errors.soyad.message}</p>
                  )}
                </div>
              </div>

              {/* TC Kimlik No */}
              <div>
                <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-700 mb-2">
                  TC Kimlik Numarası
                </label>
                <input
                  {...register('tc_kimlik_no')}
                  type="text"
                  id="tc_kimlik_no"
                  maxLength={11}
                  className={`
                    block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.tc_kimlik_no ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="12345678901"
                />
                {errors.tc_kimlik_no && (
                  <p className="mt-1 text-sm text-red-600">{errors.tc_kimlik_no.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doğum Tarihi */}
                <div>
                  <label htmlFor="dogum_tarihi" className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('dogum_tarihi')}
                      type="date"
                      id="dogum_tarihi"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.dogum_tarihi ? 'border-red-300' : 'border-gray-300'}
                      `}
                    />
                  </div>
                  {errors.dogum_tarihi && (
                    <p className="mt-1 text-sm text-red-600">{errors.dogum_tarihi.message}</p>
                  )}
                </div>

                {/* Cinsiyet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        {...register('cinsiyet')}
                        type="radio"
                        value="E"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">Erkek</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('cinsiyet')}
                        type="radio"
                        value="K"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">Kadın</span>
                    </label>
                  </div>
                  {errors.cinsiyet && (
                    <p className="mt-1 text-sm text-red-600">{errors.cinsiyet.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telefon */}
                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('telefon')}
                      type="tel"
                      id="telefon"
                      autoComplete="tel"
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.telefon ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                  {errors.telefon && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefon.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      autoComplete="email"
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.email ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Şifre */}
                <div>
                  <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      {...register('sifre')}
                      type={sifreGoster ? 'text' : 'password'}
                      id="sifre"
                      autoComplete="new-password"
                      className={`
                        block w-full pl-3 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.sifre ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="Şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSifreGoster(!sifreGoster)}
                    >
                      {sifreGoster ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.sifre && (
                    <p className="mt-1 text-sm text-red-600">{errors.sifre.message}</p>
                  )}
                </div>

                {/* Şifre Tekrar */}
                <div>
                  <label htmlFor="sifre_tekrar" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      {...register('sifre_tekrar')}
                      type={sifreTekrarGoster ? 'text' : 'password'}
                      id="sifre_tekrar"
                      autoComplete="new-password"
                      className={`
                        block w-full pl-3 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.sifre_tekrar ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="Şifrenizi tekrar girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSifreTekrarGoster(!sifreTekrarGoster)}
                    >
                      {sifreTekrarGoster ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.sifre_tekrar && (
                    <p className="mt-1 text-sm text-red-600">{errors.sifre_tekrar.message}</p>
                  )}
                </div>
              </div>

              {/* Koşulları Kabul */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('kosullari_kabul')}
                    id="kosullari_kabul"
                    type="checkbox"
                    className={`
                      h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
                      ${errors.kosullari_kabul ? 'border-red-300' : ''}
                    `}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="kosullari_kabul" className="text-gray-700">
                    <Link href="/kullanim-kosullari" className="text-blue-600 hover:text-blue-500">
                      Kullanım Koşulları
                    </Link>
                    {' '}ve{' '}
                    <Link href="/gizlilik-politikasi" className="text-blue-600 hover:text-blue-500">
                      Gizlilik Politikası
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </label>
                  {errors.kosullari_kabul && (
                    <p className="mt-1 text-red-600">{errors.kosullari_kabul.message}</p>
                  )}
                </div>
              </div>

              {/* Kayıt Ol Butonu */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                  transition-all duration-200
                `}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kayıt Oluşturuluyor...
                  </div>
                ) : (
                  'Kayıt Ol'
                )}
              </button>

              {/* Giriş Yap Linki */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Zaten hesabınız var mı?{' '}
                  <Link
                    href="/giris"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Giriş yap
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 