import Link from 'next/link';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo ve Açıklama */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Bus className="h-8 w-8 text-red-600" />
                <span className="text-2xl font-bold text-white">OBilet</span>
              </Link>
              <p className="text-gray-300 text-sm">
                Türkiye'nin en güvenilir otobüs bileti satış platformu. 
                7/24 müşteri hizmetleri ile yanınızdayız.
              </p>
            </div>

            {/* Hızlı Linkler */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
                <Link href="/seferler" className="block text-gray-300 hover:text-white transition-colors">
                  Seferler
                </Link>
                <Link href="/hakkimizda" className="block text-gray-300 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/iletisim" className="block text-gray-300 hover:text-white transition-colors">
                  İletişim
                </Link>
              </div>
            </div>

            {/* Müşteri Hizmetleri */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Müşteri Hizmetleri</h3>
              <div className="space-y-2">
                <Link href="/yardim" className="block text-gray-300 hover:text-white transition-colors">
                  Yardım Merkezi
                </Link>
                <Link href="/sikca-sorulan-sorular" className="block text-gray-300 hover:text-white transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
                <Link href="/iptal-iade" className="block text-gray-300 hover:text-white transition-colors">
                  İptal ve İade
                </Link>
                <Link href="/gizlilik-politikasi" className="block text-gray-300 hover:text-white transition-colors">
                  Gizlilik Politikası
                </Link>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span className="text-gray-300">444 0 888</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-red-600" />
                  <span className="text-gray-300">info@obilet.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <span className="text-gray-300">
                    Bartın Üniversitesi<br />
                    Bilgisayar Teknolojisi ve<br />
                    Bilişim Sistemleri Bölümü
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 OBilet. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              BTS304 - Veritabanı Yönetim Sistemleri II
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 