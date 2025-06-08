'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';

// Giriş form şeması
const girisSchema = z.object({
  email: z
    .string()
    .min(1, 'Email adresi gerekli')
    .email('Geçerli bir email adresi girin'),
  sifre: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
});

type GirisFormData = z.infer<typeof girisSchema>;

export default function GirisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [genel_hata, setGenelHata] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GirisFormData>({
    resolver: zodResolver(girisSchema),
  });

  const onSubmit = async (data: GirisFormData) => {
    setLoading(true);
    setGenelHata('');

    try {
      const response = await fetch('/api/auth/giris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Başarılı giriş - kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Ana sayfaya yönlendir
        router.push('/');
        router.refresh();
      } else {
        setGenelHata(result.message || 'Giriş yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setGenelHata('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Giriş Yap</h1>
            <p className="text-blue-100">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            {genel_hata && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {genel_hata}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Şifre */}
              <div>
                <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('sifre')}
                    type={sifreGoster ? 'text' : 'password'}
                    id="sifre"
                    autoComplete="current-password"
                    className={`
                      block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 
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

              {/* Şifremi Unuttum */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="beni-hatirla"
                    name="beni-hatirla"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="beni-hatirla" className="ml-2 block text-sm text-gray-900">
                    Beni hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/sifremi-unuttum"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
              </div>

              {/* Giriş Butonu */}
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
                    Giriş Yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </button>

              {/* Kayıt Ol Linki */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{' '}
                  <Link
                    href="/kayit"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Kayıt ol
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Giriş yaparak{' '}
            <Link href="/kullanim-kosullari" className="text-blue-600 hover:text-blue-500">
              Kullanım Koşulları
            </Link>{' '}
            ve{' '}
            <Link href="/gizlilik-politikasi" className="text-blue-600 hover:text-blue-500">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
} 