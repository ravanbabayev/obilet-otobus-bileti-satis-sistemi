'use client';

import { Users, Target, Eye, Heart, Award, MapPin } from 'lucide-react';

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              2020 yılından beri Türkiye'nin en güvenilir otobüs bileti satış platformu olarak hizmet veriyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hikayemiz</h2>
              <p className="text-gray-600 mb-4">
                OBilet, yolculuk deneyimini dijitalleştirmek ve daha konforlu hale getirmek amacıyla kurulmuştur. 
                Müşterilerimizin güvenli, hızlı ve ekonomik seyahat etmelerini sağlamak için en modern teknolojileri kullanıyoruz.
              </p>
              <p className="text-gray-600 mb-4">
                Bugün, Türkiye'nin dört bir yanında 500'den fazla otobüs firmasıyla çalışıyor ve 
                günlük binlerce müşterimize hizmet veriyoruz.
              </p>
              <p className="text-gray-600">
                Müşteri memnuniyeti odaklı yaklaşımımız ve kaliteli hizmet anlayışımızla sektörde 
                öncü konumda yer almaya devam ediyoruz.
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Otobüs Firması</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">1M+</div>
                  <div className="text-sm text-gray-600">Mutlu Müşteri</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">81</div>
                  <div className="text-sm text-gray-600">İl Kapsamı</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Müşteri Desteği</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misyon, Vizyon, Değerler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Misyon */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">Misyonumuz</h3>
            </div>
            <p className="text-gray-600">
              Türkiye'de otobüs yolculuğunu dijitalleştirerek, müşterilerimize en kolay, 
              güvenli ve konforlu bilet satın alma deneyimini sunmak.
            </p>
          </div>

          {/* Vizyon */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Eye className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">Vizyonumuz</h3>
            </div>
            <p className="text-gray-600">
              Türkiye'nin ve bölgenin en büyük dijital seyahat platformu olmak ve 
              yolculuk deneyiminde standartları belirleyen lider marka olmak.
            </p>
          </div>

          {/* Değerler */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">Değerlerimiz</h3>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• Müşteri odaklılık</li>
              <li>• Güvenilirlik</li>
              <li>• İnovasyon</li>
              <li>• Şeffaflık</li>
              <li>• Sürdürülebilirlik</li>
            </ul>
          </div>
        </div>

        {/* Neden Biz */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Neden OBilet?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Güvenilir</h3>
              <p className="text-gray-600 text-sm">
                SSL sertifikası ve güvenli ödeme altyapısı ile %100 güvenli alışveriş
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Geniş Ağ</h3>
              <p className="text-gray-600 text-sm">
                500'den fazla otobüs firması ile Türkiye'nin her yerine ulaşım
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kolay Erişim</h3>
              <p className="text-gray-600 text-sm">
                Web ve mobil uygulamalarımızla 7/24 bilet satın alabilirsiniz
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Müşteri Odaklı</h3>
              <p className="text-gray-600 text-sm">
                24/7 müşteri destek hattımızla her zaman yanınızdayız
              </p>
            </div>
          </div>
        </div>

        {/* Kalite Belgelerimiz */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Kalite ve Güvenlik</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ISO 27001</h3>
              <p className="text-gray-600 text-sm">
                Bilgi Güvenliği Yönetim Sistemi sertifikası
              </p>
            </div>

            <div>
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PCI DSS</h3>
              <p className="text-gray-600 text-sm">
                Ödeme Kartı Endüstrisi Veri Güvenliği Standardı
              </p>
            </div>

            <div>
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SSL Sertifikası</h3>
              <p className="text-gray-600 text-sm">
                256-bit şifreleme ile güvenli veri iletişimi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 