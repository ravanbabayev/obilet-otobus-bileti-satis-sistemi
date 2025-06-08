'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Edit3,
  Settings,
  Shield,
  CreditCard,
  Bell,
  Trash2,
  CheckCircle
} from 'lucide-react';

// Profil güncelleme şeması
const profilSchema = z.object({
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
  telefon: z
    .string()
    .min(1, 'Telefon numarası gerekli')
    .regex(/^[0-9+() -]+$/, 'Geçerli bir telefon numarası girin'),
  email: z
    .string()
    .min(1, 'Email adresi gerekli')
    .email('Geçerli bir email adresi girin'),
});

// Şifre değiştirme şeması
const sifreSchema = z.object({
  mevcut_sifre: z
    .string()
    .min(1, 'Mevcut şifre gerekli'),
  yeni_sifre: z
    .string()
    .min(1, 'Yeni şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
  yeni_sifre_tekrar: z
    .string()
    .min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.yeni_sifre === data.yeni_sifre_tekrar, {
  message: "Şifreler eşleşmiyor",
  path: ["yeni_sifre_tekrar"],
});

type ProfilFormData = z.infer<typeof profilSchema>;
type SifreFormData = z.infer<typeof sifreSchema>;

export default function ProfilPage() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bilgiler' | 'sifre' | 'ayarlar'>('bilgiler');
  const [profilLoading, setProfilLoading] = useState(false);
  const [sifreLoading, setSifreLoading] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [yeniSifreGoster, setYeniSifreGoster] = useState(false);
  const [bildirimAyarlari, setBildirimAyarlari] = useState({
    email_bildirimleri: true,
    sms_bildirimleri: false,
    pazarlama_bildirimleri: true,
  });

  const {
    register: registerProfil,
    handleSubmit: handleSubmitProfil,
    formState: { errors: profilErrors },
    reset: resetProfil,
  } = useForm<ProfilFormData>({
    resolver: zodResolver(profilSchema),
  });

  const {
    register: registerSifre,
    handleSubmit: handleSubmitSifre,
    formState: { errors: sifreErrors },
    reset: resetSifre,
  } = useForm<SifreFormData>({
    resolver: zodResolver(sifreSchema),
  });

  useEffect(() => {
    // Kullanıcı kontrolü
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/giris?redirect=/profil');
      return;
    }

    const userData = JSON.parse(userStr);
    setKullanici(userData);
    
    // Form'u kullanıcı verileri ile doldur
    resetProfil({
      ad: userData.ad,
      soyad: userData.soyad,
      telefon: userData.telefon,
      email: userData.email,
    });

    setLoading(false);
  }, [router, resetProfil]);

  const handleProfilGuncelle = async (data: ProfilFormData) => {
    setProfilLoading(true);
    try {
      const response = await fetch('/api/kullanici/profil-guncelle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
          ...data,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Güncellenmiş kullanıcı bilgilerini localStorage'a kaydet
        const updatedUser = { ...kullanici, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setKullanici(updatedUser);
        alert('Profil bilgileriniz başarıyla güncellendi.');
      } else {
        alert(result.message || 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setProfilLoading(false);
    }
  };

  const handleSifreDegiştir = async (data: SifreFormData) => {
    setSifreLoading(true);
    try {
      const response = await fetch('/api/kullanici/sifre-degistir', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
          mevcut_sifre: data.mevcut_sifre,
          yeni_sifre: data.yeni_sifre,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        resetSifre();
        alert('Şifreniz başarıyla değiştirildi.');
      } else {
        alert(result.message || 'Şifre değiştirirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSifreLoading(false);
    }
  };

  const handleBildirimAyarKaydet = async () => {
    try {
      const response = await fetch('/api/kullanici/bildirim-ayarlari', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
          ...bildirimAyarlari,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Bildirim ayarları başarıyla kaydedildi.');
      } else {
        alert(result.message || 'Ayarlar kaydedilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Bildirim ayarları hatası:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  const handleHesapSil = async () => {
    if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const response = await fetch('/api/kullanici/hesap-sil', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullanici?.kullanici_id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.removeItem('user');
        alert('Hesabınız başarıyla silindi.');
        router.push('/');
      } else {
        alert(result.message || 'Hesap silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Hesap silme hatası:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Ayarları</h1>
          <p className="text-gray-600">
            Kişisel bilgilerinizi yönetin ve hesap ayarlarınızı düzenleyin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Profil Özeti */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {kullanici?.ad} {kullanici?.soyad}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{kullanici?.email}</p>
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Doğrulanmış Hesap</span>
                </div>
              </div>

              {/* Tab Menü */}
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveTab('bilgiler')}
                  className={`w-full flex items-center px-5 py-4 rounded-lg text-left transition-colors ${
                    activeTab === 'bilgiler'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  <span className="font-medium">Kişisel Bilgiler</span>
                </button>
                <button
                  onClick={() => setActiveTab('sifre')}
                  className={`w-full flex items-center px-5 py-4 rounded-lg text-left transition-colors ${
                    activeTab === 'sifre'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  <span className="font-medium">Şifre Değiştir</span>
                </button>
                <button
                  onClick={() => setActiveTab('ayarlar')}
                  className={`w-full flex items-center px-5 py-4 rounded-lg text-left transition-colors ${
                    activeTab === 'ayarlar'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="font-medium">Hesap Ayarları</span>
                </button>
              </nav>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Kişisel Bilgiler Tab */}
              {activeTab === 'bilgiler' && (
                <div>
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h2>
                  </div>

                  <form onSubmit={handleSubmitProfil(handleProfilGuncelle)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Ad */}
                      <div>
                        <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-2">
                          Ad
                        </label>
                        <input
                          {...registerProfil('ad')}
                          type="text"
                          id="ad"
                          placeholder="Adınızı girin"
                          className={`
                            block w-full px-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${profilErrors.ad ? 'border-red-300' : 'border-gray-300'}
                          `}
                        />
                        {profilErrors.ad && (
                          <p className="mt-1 text-sm text-red-600">{profilErrors.ad.message}</p>
                        )}
                      </div>

                      {/* Soyad */}
                      <div>
                        <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-2">
                          Soyad
                        </label>
                        <input
                          {...registerProfil('soyad')}
                          type="text"
                          id="soyad"
                          placeholder="Soyadınızı girin"
                          className={`
                            block w-full px-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${profilErrors.soyad ? 'border-red-300' : 'border-gray-300'}
                          `}
                        />
                        {profilErrors.soyad && (
                          <p className="mt-1 text-sm text-red-600">{profilErrors.soyad.message}</p>
                        )}
                      </div>
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
                          {...registerProfil('email')}
                          type="email"
                          id="email"
                          placeholder="Email adresinizi girin"
                          className={`
                            block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${profilErrors.email ? 'border-red-300' : 'border-gray-300'}
                          `}
                        />
                      </div>
                      {profilErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{profilErrors.email.message}</p>
                      )}
                    </div>

                    {/* Telefon */}
                    <div>
                      <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon Numarası
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerProfil('telefon')}
                          type="tel"
                          id="telefon"
                          placeholder="Telefon numaranızı girin"
                          className={`
                            block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${profilErrors.telefon ? 'border-red-300' : 'border-gray-300'}
                          `}
                        />
                      </div>
                      {profilErrors.telefon && (
                        <p className="mt-1 text-sm text-red-600">{profilErrors.telefon.message}</p>
                      )}
                    </div>

                    {/* Değiştirilemeyen Bilgiler */}
                    <div className="bg-gray-50 rounded-lg p-6 mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Değiştirilemeyen Bilgiler</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TC Kimlik No
                        </label>
                        <input
                          type="text"
                          value={kullanici?.tc_kimlik_no || ''}
                          disabled
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doğum Tarihi
                        </label>
                        <input
                          type="date"
                          value={kullanici?.dogum_tarihi || ''}
                          disabled
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cinsiyet
                        </label>
                        <input
                          type="text"
                          value={kullanici?.cinsiyet === 'E' ? 'Erkek' : 'Kadın'}
                          disabled
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={profilLoading}
                        className={`
                          flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                          ${profilLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }
                          transition-all duration-200
                        `}
                      >
                        {profilLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Bilgileri Güncelle
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Şifre Değiştir Tab */}
              {activeTab === 'sifre' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Lock className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Şifre Değiştir</h2>
                  </div>

                  <form onSubmit={handleSubmitSifre(handleSifreDegiştir)} className="space-y-8">
                    {/* Mevcut Şifre */}
                    <div>
                      <label htmlFor="mevcut_sifre" className="block text-sm font-medium text-gray-700 mb-2">
                        Mevcut Şifre
                      </label>
                      <div className="relative">
                        <input
                          {...registerSifre('mevcut_sifre')}
                          type={sifreGoster ? 'text' : 'password'}
                          id="mevcut_sifre"
                          className={`
                            block w-full pl-4 pr-10 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${sifreErrors.mevcut_sifre ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder="Mevcut şifrenizi girin"
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
                      {sifreErrors.mevcut_sifre && (
                        <p className="mt-1 text-sm text-red-600">{sifreErrors.mevcut_sifre.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Yeni Şifre */}
                      <div>
                        <label htmlFor="yeni_sifre" className="block text-sm font-medium text-gray-700 mb-2">
                          Yeni Şifre
                        </label>
                        <div className="relative">
                          <input
                            {...registerSifre('yeni_sifre')}
                            type={yeniSifreGoster ? 'text' : 'password'}
                            id="yeni_sifre"
                            className={`
                              block w-full pl-4 pr-10 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                              ${sifreErrors.yeni_sifre ? 'border-red-300' : 'border-gray-300'}
                            `}
                            placeholder="Yeni şifrenizi girin"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setYeniSifreGoster(!yeniSifreGoster)}
                          >
                            {yeniSifreGoster ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        {sifreErrors.yeni_sifre && (
                          <p className="mt-1 text-sm text-red-600">{sifreErrors.yeni_sifre.message}</p>
                        )}
                      </div>

                      {/* Yeni Şifre Tekrar */}
                      <div>
                        <label htmlFor="yeni_sifre_tekrar" className="block text-sm font-medium text-gray-700 mb-2">
                          Yeni Şifre Tekrar
                        </label>
                        <input
                          {...registerSifre('yeni_sifre_tekrar')}
                          type={yeniSifreGoster ? 'text' : 'password'}
                          id="yeni_sifre_tekrar"
                          className={`
                            block w-full px-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${sifreErrors.yeni_sifre_tekrar ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder="Yeni şifrenizi tekrar girin"
                        />
                        {sifreErrors.yeni_sifre_tekrar && (
                          <p className="mt-1 text-sm text-red-600">{sifreErrors.yeni_sifre_tekrar.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Şifre Gereksinimleri */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Şifre Gereksinimleri:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• En az 6 karakter uzunluğunda olmalı</li>
                        <li>• Büyük ve küçük harf içermeli</li>
                        <li>• En az bir rakam içermeli</li>
                        <li>• Özel karakter içermesi önerilir</li>
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={sifreLoading}
                        className={`
                          flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                          ${sifreLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }
                          transition-all duration-200
                        `}
                      >
                        {sifreLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Değiştiriliyor...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 mr-2" />
                            Şifreyi Değiştir
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Hesap Ayarları Tab */}
              {activeTab === 'ayarlar' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Settings className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Hesap Ayarları</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Bildirim Ayarları */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Bildirim Ayarları
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">Email Bildirimleri</h4>
                            <p className="text-sm text-gray-600">Bilet durumu ve sefer güncellemeleri</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bildirimAyarlari.email_bildirimleri}
                              onChange={(e) => setBildirimAyarlari(prev => ({
                                ...prev,
                                email_bildirimleri: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">SMS Bildirimleri</h4>
                            <p className="text-sm text-gray-600">Önemli güvenlik bildirimleri</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bildirimAyarlari.sms_bildirimleri}
                              onChange={(e) => setBildirimAyarlari(prev => ({
                                ...prev,
                                sms_bildirimleri: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">Pazarlama Bildirimleri</h4>
                            <p className="text-sm text-gray-600">Kampanyalar ve özel teklifler</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bildirimAyarlari.pazarlama_bildirimleri}
                              onChange={(e) => setBildirimAyarlari(prev => ({
                                ...prev,
                                pazarlama_bildirimleri: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={handleBildirimAyarKaydet}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Ayarları Kaydet
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hesap Bilgileri */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Üyelik Tarihi:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {kullanici?.kayit_tarihi ? new Date(kullanici.kayit_tarihi).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Son Giriş:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {kullanici?.son_giris_tarihi ? new Date(kullanici.son_giris_tarihi).toLocaleDateString('tr-TR') : 'İlk giriş'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hesap Durumu:</span>
                          <span className="text-sm font-medium text-green-600">Aktif</span>
                        </div>
                      </div>
                    </div>

                    {/* Tehlikeli Alan */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium text-red-600 mb-4">Tehlikeli Alan</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-base font-medium text-red-900 mb-2">Hesabı Sil</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
                        </p>
                        <button
                          onClick={handleHesapSil}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hesabı Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 