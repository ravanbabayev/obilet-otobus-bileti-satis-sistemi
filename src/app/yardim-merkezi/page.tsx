'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Book, CreditCard, RotateCcw, Phone, Shield, HelpCircle } from 'lucide-react';

export default function YardimMerkeziPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'rezervasyon',
      title: 'Rezervasyon İşlemleri',
      icon: Book,
      color: 'bg-blue-100 text-blue-600',
      questions: [
        {
          q: 'Bilet nasıl satın alabilirim?',
          a: 'Ana sayfadaki arama formunu kullanarak kalkış ve varış noktanızı, seyahat tarihini seçin. Çıkan seferler arasından size uygun olanı seçerek koltuk seçimi yapabilir ve ödeme adımına geçebilirsiniz.'
        },
        {
          q: 'Koltuk seçimi yapmak zorunda mıyım?',
          a: 'Evet, otobüs seferlerinde koltuk seçimi zorunludur. İstediğiniz koltuğu seçebilir, eğer seçmezseniz sistem otomatik olarak uygun bir koltuk atar.'
        },
        {
          q: 'Çocuk bileti nasıl alınır?',
          a: '0-2 yaş arası çocuklar ücretsiz (kucakta), 3-12 yaş arası çocuklar için çocuk bileti alınması gerekmektedir. Bilet alırken yolcu tipini "Çocuk" olarak seçiniz.'
        },
        {
          q: 'Grup bileti alabilir miyim?',
          a: '10 ve üzeri bilet alımları için grup indirimlerimiz mevcuttur. Lütfen müşteri hizmetlerimizle iletişime geçiniz.'
        }
      ]
    },
    {
      id: 'odeme',
      title: 'Ödeme İşlemleri',
      icon: CreditCard,
      color: 'bg-green-100 text-green-600',
      questions: [
        {
          q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
          a: 'Visa, Mastercard, American Express kredi kartları, banka kartları ve havale/EFT ile ödeme yapabilirsiniz.'
        },
        {
          q: 'Ödeme güvenli mi?',
          a: 'Evet, tüm ödemeleriniz SSL sertifikası ile şifrelenir ve PCI DSS standartlarına uygun olarak işlenir. Kart bilgileriniz hiçbir şekilde saklanmaz.'
        },
        {
          q: 'Ödeme yapamıyorum, ne yapmalıyım?',
          a: 'Kart bilgilerinizi kontrol edin, internet limit kontrolü yapın. Sorun devam ederse müşteri hizmetlerimizle iletişime geçin.'
        },
        {
          q: 'Fatura alabilir miyim?',
          a: 'Evet, ödeme sonrası e-posta adresinize gönderilen biletiniz fatura niteliği taşır. Kurumsal fatura için ayrıca talep edebilirsiniz.'
        }
      ]
    },
    {
      id: 'iptal',
      title: 'İptal ve İade',
      icon: RotateCcw,
      color: 'bg-red-100 text-red-600',
      questions: [
        {
          q: 'Biletimi nasıl iptal edebilirim?',
          a: '"Biletlerim" sayfasından iptal etmek istediğiniz bileti seçerek iptal işlemini gerçekleştirebilirsiniz. İptal koşulları firma politikalarına göre değişir.'
        },
        {
          q: 'İptal ücreti var mı?',
          a: 'İptal ücretleri otobüs firmasının politikasına göre değişir. Genellikle seyahat saatinden 2 saat öncesine kadar ücretsiz iptal yapılabilir.'
        },
        {
          q: 'İade ne zaman yapılır?',
          a: 'İade işlemleri, kredi kartına 7-10 iş günü içinde, banka havalesi ile 1-3 iş günü içinde gerçekleştirilir.'
        },
        {
          q: 'Sefer iptal olursa ne olur?',
          a: 'Firma tarafından iptal edilen seferler için tam iade yapılır veya alternatif sefer önerilir.'
        }
      ]
    },
    {
      id: 'hesap',
      title: 'Hesap İşlemleri',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
      questions: [
        {
          q: 'Nasıl üye olabilirim?',
          a: 'Ana sayfadaki "Kayıt Ol" butonuna tıklayarak üyelik formunu doldurabilirsiniz. Üyelik ücretsizdir.'
        },
        {
          q: 'Şifremi unuttum, ne yapmalıyım?',
          a: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz.'
        },
        {
          q: 'Bilgilerimi nasıl güncellerim?',
          a: 'Üye girişi yaptıktan sonra "Profil" sayfasından kişisel bilgilerinizi güncelleyebilirsiniz.'
        },
        {
          q: 'Hesabımı silebilir miyim?',
          a: 'Evet, profil sayfasından hesap silme talebinde bulunabilirsiniz. Bu işlem geri alınamaz.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(qa =>
      qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0 || searchQuery === '');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Yardım Merkezi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sıkça sorulan soruları burada bulabilir, aradığınızı bulamazsanız bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sorunuzu yazın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
            <Phone className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Telefon Desteği</h3>
            <p className="text-sm text-gray-600">444 0 BİLET</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
            <Book className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Kullanım Kılavuzu</h3>
            <p className="text-sm text-gray-600">Adım adım rehber</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
            <HelpCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Canlı Destek</h3>
            <p className="text-sm text-gray-600">Anında yardım</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Güvenlik</h3>
            <p className="text-sm text-gray-600">Güvenli ödeme</p>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCategory === category.id;
            
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mr-4`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {category.title}
                    </h2>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="space-y-4">
                      {category.questions.map((qa, index) => (
                        <div key={`${category.id}-qa-${index}`} className="border-l-4 border-red-200 pl-4">
                          <h3 className="font-medium text-gray-900 mb-2">{qa.q}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Aradığınızı bulamadınız mı?</h2>
          <p className="text-lg mb-6 opacity-90">
            Müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Canlı Destek
            </button>
            <button className="bg-red-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-800 transition-colors">
              İletişim Formu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 