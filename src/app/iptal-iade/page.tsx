'use client';

import { Clock, CreditCard, AlertCircle, CheckCircle, XCircle, Info, Phone } from 'lucide-react';

export default function IptalIadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">İptal ve İade Politikası</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bilet iptal işlemleri ve iade koşulları hakkında detaylı bilgiler.
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-800">Ücretsiz İptal</div>
            <div className="text-xs text-green-600">Kalkıştan 2 saat önce</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-yellow-800">Ücretli İptal</div>
            <div className="text-xs text-yellow-600">2 saat - 30 dk önce</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-red-800">İptal Edilemez</div>
            <div className="text-xs text-red-600">Kalkıştan 30 dk önce</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-800">İade Süresi</div>
            <div className="text-xs text-blue-600">7-10 iş günü</div>
          </div>
        </div>

        {/* İptal Koşulları */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">İptal Koşulları</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <CheckCircle className="inline w-5 h-5 text-green-500 mr-2" />
                Ücretsiz İptal
              </h3>
              <p className="text-gray-600 mb-3">
                Kalkış saatinden en az 2 saat öncesine kadar yapılan iptal işlemleri ücretsizdir.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tam iade yapılır</li>
                <li>• İşlem ücreti alınmaz</li>
                <li>• Online veya telefon ile iptal edilebilir</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <Clock className="inline w-5 h-5 text-yellow-500 mr-2" />
                Ücretli İptal
              </h3>
              <p className="text-gray-600 mb-3">
                Kalkış saatinden 2 saat - 30 dakika öncesine kadar yapılan iptal işlemleri.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bilet fiyatının %20'si kesinti</li>
                <li>• Kalan tutar iade edilir</li>
                <li>• Firma politikası geçerlidir</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <XCircle className="inline w-5 h-5 text-red-500 mr-2" />
                İptal Edilemez
              </h3>
              <p className="text-gray-600 mb-3">
                Kalkış saatinden 30 dakika öncesine kadar olan biletler iptal edilemez.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• İade yapılmaz</li>
                <li>• Değişiklik yapılamaz</li>
                <li>• Acil durumlar için müşteri hizmetlerini arayın</li>
              </ul>
            </div>
          </div>
        </div>

        {/* İptal Adımları */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bilet İptal Adımları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Online İptal</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">1</div>
                  <p className="text-gray-600">"Biletlerim" sayfasına gidin</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">2</div>
                  <p className="text-gray-600">İptal etmek istediğiniz bileti seçin</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">3</div>
                  <p className="text-gray-600">"İptal Et" butonuna tıklayın</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">4</div>
                  <p className="text-gray-600">İptal nedenini seçin ve onaylayın</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Telefon ile İptal</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">1</div>
                  <p className="text-gray-600">444 0 BİLET numarasını arayın</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">2</div>
                  <p className="text-gray-600">PNR kodunuzu ve kimlik bilgilerinizi verin</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">3</div>
                  <p className="text-gray-600">İptal talebinizi belirtin</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">4</div>
                  <p className="text-gray-600">İşlem onayınızı verin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* İade Süreci */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">İade Süreci</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kredi Kartı İadesi</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">7-10 İş Günü</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• İade tutarı aynı karta yapılır</li>
                  <li>• Banka işlem süresi 2-3 gün</li>
                  <li>• SMS ile bilgilendirilirsiniz</li>
                  <li>• Hesap ekstresinde görünür</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Banka Havalesi</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">1-3 İş Günü</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• IBAN bilginiz gerekli</li>
                  <li>• Kimlik doğrulaması yapılır</li>
                  <li>• Hesabınıza direkt yatırılır</li>
                  <li>• E-posta ile bilgilendirilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Özel Durumlar */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Özel Durumlar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">
                <AlertCircle className="inline w-5 h-5 mr-1" />
                Sefer İptali
              </h3>
              <p className="text-sm text-yellow-700">
                Otobüs firması tarafından iptal edilen seferler için tam iade yapılır veya 
                alternatif sefer önerilir.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">
                <Info className="inline w-5 h-5 mr-1" />
                Sağlık Durumu
              </h3>
              <p className="text-sm text-purple-700">
                Doktor raporu ile belgelenen sağlık durumları için özel iptal koşulları 
                uygulanabilir.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">
                <XCircle className="inline w-5 h-5 mr-1" />
                Hava Durumu
              </h3>
              <p className="text-sm text-red-700">
                Olumsuz hava koşulları nedeniyle iptal edilen seferler için tam iade 
                veya erteleme hakkı tanınır.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">
                <Clock className="inline w-5 h-5 mr-1" />
                Geç Kalkış
              </h3>
              <p className="text-sm text-blue-700">
                2 saatten fazla geciken seferler için iptal hakkı tanınır ve tam iade yapılır.
              </p>
            </div>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Yardıma mı İhtiyacınız Var?</h2>
          <p className="text-lg mb-6 opacity-90">
            İptal ve iade işlemleri hakkında daha fazla bilgi için bizimle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white text-gray-800 px-6 py-3 rounded-md font-semibold">
              <Phone className="inline w-5 h-5 mr-2" />
              444 0 BİLET
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors">
              Canlı Destek
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 