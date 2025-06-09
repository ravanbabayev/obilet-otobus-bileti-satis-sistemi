'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

export default function SSSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Genel',
      questions: [
        {
          q: 'OBilet nedir?',
          a: 'OBilet, Türkiye\'nin en büyük online otobüs bileti satış platformudur. 500\'den fazla otobüs firmasının biletlerini güvenli bir şekilde satın alabileceğiniz dijital platformdur.'
        },
        {
          q: 'Bilet satın almak için üye olmak gerekli mi?',
          a: 'Hayır, üye olmadan da bilet satın alabilirsiniz. Ancak üye olmanız durumunda biletlerinizi daha kolay takip edebilir, özel indirimlerden yararlanabilirsiniz.'
        },
        {
          q: 'Hangi şehirlere bilet bulabilirim?',
          a: 'Türkiye\'nin 81 iline otobüs bileti bulabilirsiniz. Ayrıca bazı uluslararası destinasyonlara da sefer bulunmaktadır.'
        }
      ]
    },
    {
      category: 'Rezervasyon',
      questions: [
        {
          q: 'Bilet rezervasyonu nasıl yapılır?',
          a: 'Ana sayfadan kalkış-varış noktanızı ve tarih seçerek arama yapın. Uygun seferi seçin, koltuk belirleyin ve ödeme işlemini tamamlayın.'
        },
        {
          q: 'Ne kadar önceden bilet alabilirim?',
          a: 'Genellikle 90 gün öncesinden bilet satın alabilirsiniz. Bu süre otobüs firmasına göre değişebilir.'
        },
        {
          q: 'Koltuk seçimi ücretsiz mi?',
          a: 'Evet, koltuk seçimi tamamen ücretsizdir. İstediğiniz koltuğu seçebilir veya sistem otomatik atama yapabilir.'
        },
        {
          q: 'Çocuk yaşı sınırları nelerdir?',
          a: '0-2 yaş kucakta ücretsiz, 3-12 yaş çocuk bileti, 13 yaş ve üzeri yetişkin bileti gereklidir.'
        }
      ]
    },
    {
      category: 'Ödeme',
      questions: [
        {
          q: 'Hangi ödeme yöntemleri kabul ediliyor?',
          a: 'Kredi kartı (Visa, Mastercard, American Express), banka kartı ve havale/EFT ile ödeme yapabilirsiniz.'
        },
        {
          q: 'Ödeme güvenli mi?',
          a: 'Evet, tüm ödemeler SSL sertifikası ile şifrelenir. Kart bilgileriniz saklanmaz ve PCI DSS standartlarına uygun işlem yapılır.'
        },
        {
          q: 'Taksit yapabilir miyim?',
          a: 'Kredi kartınızın taksit imkanına göre 2-12 aya kadar taksit yapabilirsiniz. Taksit seçenekleri ödeme sayfasında görünür.'
        },
        {
          q: 'Ödeme yaparken hata alıyorum, ne yapmalıyım?',
          a: 'Kart bilgilerinizi kontrol edin, internet limitinizi kontrol edin. Sorun devam ederse 444 0 BİLET\'i arayın.'
        }
      ]
    },
    {
      category: 'İptal ve İade',
      questions: [
        {
          q: 'Biletimi nasıl iptal edebilirim?',
          a: '"Biletlerim" sayfasından veya PNR kodu ile biletinizi bulup iptal edebilirsiniz. İptal koşulları firma politikasına göre değişir.'
        },
        {
          q: 'İptal ücreti ne kadar?',
          a: 'İptal ücretleri otobüs firmasının politikasına göre değişir. Genellikle kalkıştan 2 saat öncesine kadar ücretsiz iptal yapılabilir.'
        },
        {
          q: 'İade ne kadar sürede yapılır?',
          a: 'Kredi kartına iade 7-10 iş günü, banka havalesi 1-3 iş günü sürmektedir.'
        },
        {
          q: 'Sefer iptal olursa ne olur?',
          a: 'Firma tarafından iptal edilen seferler için tam iade yapılır veya alternatif sefer seçeneği sunulur.'
        }
      ]
    },
    {
      category: 'Teknik',
      questions: [
        {
          q: 'Mobil uygulama var mı?',
          a: 'Evet, iOS ve Android için ücretsiz mobil uygulamamız bulunmaktadır. App Store ve Google Play\'den indirebilirsiniz.'
        },
        {
          q: 'Biletimi nasıl yazdırabilirim?',
          a: 'E-postanıza gelen bileti PDF olarak kaydedip yazdırabilirsiniz. Ayrıca QR kod ile cep telefonunuzdan da gösterebilirsiniz.'
        },
        {
          q: 'Şifremi unuttum, ne yapmalıyım?',
          a: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama linki gönderilebilir.'
        }
      ]
    }
  ];

  const allQuestions = faqs.flatMap((category, categoryIndex) => 
    category.questions.map((q, questionIndex) => ({
      ...q,
      categoryName: category.category,
      globalIndex: categoryIndex * 100 + questionIndex
    }))
  );

  const filteredQuestions = searchQuery 
    ? allQuestions.filter(qa =>
        qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuestions;

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            En çok merak edilen konular hakkında detaylı bilgiler bulabilirsiniz.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600">
              {filteredQuestions.length} sonuç bulundu
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{allQuestions.length}</div>
            <div className="text-gray-600">Toplam Soru</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{faqs.length}</div>
            <div className="text-gray-600">Kategori</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">7/24</div>
            <div className="text-gray-600">Destek</div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredQuestions.map((qa, index) => {
            const isExpanded = expandedFAQ === qa.globalIndex;
            
            return (
              <div key={qa.globalIndex} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(qa.globalIndex)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full mr-3">
                        {qa.categoryName}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{qa.q}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{qa.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              Aradığınız terimle ilgili soru bulunamadı. Farklı kelimeler deneyebilir veya bizimle iletişime geçebilirsiniz.
            </p>
            <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors">
              Soru Sor
            </button>
          </div>
        )}

        {/* Help CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Sorunuz yanıtlanmadı mı?</h2>
          <p className="text-lg mb-6 opacity-90">
            Müşteri temsilcilerimiz size yardımcı olmaya hazır.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              444 0 BİLET
            </button>
            <button className="bg-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-800 transition-colors">
              Canlı Destek
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 