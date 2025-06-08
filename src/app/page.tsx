import BiletAramaForm from '@/components/BiletAramaForm';
import { Shield, Clock, CreditCard, Users, Star, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Güvenli Alışveriş",
      description: "256-bit SSL sertifikası ile güvenli ödeme"
    },
    {
      icon: Clock,
      title: "7/24 Hizmet",
      description: "Her an ulaşabileceğiniz müşteri hizmetleri"
    },
    {
      icon: CreditCard,
      title: "Kolay Ödeme",
      description: "Tüm banka kartları ve kredi kartları kabul edilir"
    },
    {
      icon: Users,
      title: "Milyonlarca Müşteri",
      description: "Türkiye'nin en güvenilir bilet satış platformu"
    }
  ];

  const testimonials = [
    {
      name: "Ayşe KAYA",
      city: "İstanbul",
      rating: 5,
      comment: "Çok kolay ve hızlı bir şekilde bilet aldım. Müşteri hizmetleri de çok ilgili."
    },
    {
      name: "Mehmet ÖZTÜRK",
      city: "Ankara",
      rating: 5,
      comment: "Yıllardır kullanıyorum, hiç sorun yaşamadım. Güvenli ve hızlı."
    },
    {
      name: "Fatma YILMAZ",
      city: "İzmir",
      rating: 5,
      comment: "Koltuk seçme özelliği çok iyi. İstediğim koltuğu seçip rahat yolculuk yapıyorum."
    }
  ];

  const popularRoutes = [
    { from: "İstanbul", to: "Ankara", price: "₺150" },
    { from: "İstanbul", to: "İzmir", price: "₺200" },
    { from: "Ankara", to: "Antalya", price: "₺250" },
    { from: "İstanbul", to: "Antalya", price: "₺300" },
    { from: "Ankara", to: "İzmir", price: "₺180" },
    { from: "İstanbul", to: "Trabzon", price: "₺280" }
  ];

  return (
    <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Türkiye'nin En Güvenilir
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Otobüs Bileti Satış Platformu
              </h2>
              <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
                Biletinizi online alın, koltuğunuzu seçin, güvenle seyahat edin
              </p>
            </div>
            
            {/* Bilet Arama Formu */}
            <BiletAramaForm />
          </div>
        </section>

        {/* Özellikler */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Neden OBilet?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Milyonlarca müşterimizin tercih ettiği platform ile güvenli ve kolay bilet alışverişi
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <feature.icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popüler Rotalar */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popüler Rotalar
              </h2>
              <p className="text-lg text-gray-600">
                En çok tercih edilen güzergahlar ve uygun fiyatlar
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoutes.map((route, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {route.from} → {route.to}
                      </h3>
                      <p className="text-gray-600">En uygun fiyat</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{route.price}</p>
                      <p className="text-sm text-gray-500">başlayan fiyatlarla</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Müşteri Yorumları */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Müşterilerimiz Diyor Ki
              </h2>
              <p className="text-lg text-gray-600">
                Milyonlarca memnun müşterimizin deneyimleri
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nasıl Çalışır */}
        <section className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nasıl Çalışır?
              </h2>
              <p className="text-lg text-gray-600">
                3 basit adımda biletinizi alın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sefer Arayın</h3>
                <p className="text-gray-600">
                  Kalkış ve varış noktanızı seçin, tarih belirleyin ve uygun seferleri görün
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Koltuk Seçin</h3>
                <p className="text-gray-600">
                  Otobüs planında istediğiniz koltuğu seçin ve yolcu bilgilerinizi girin
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ödeme Yapın</h3>
                <p className="text-gray-600">
                  Güvenli ödeme ile işlemi tamamlayın ve biletinizi e-posta ile alın
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
