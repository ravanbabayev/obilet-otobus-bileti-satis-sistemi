import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="obilet-footer">
      <div className="obilet-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1">
            <Link href="/" className="text-2xl font-bold text-white">
              OBilet
            </Link>
            <p className="mt-4 text-gray-300">
              Türkiye'nin en güvenilir ve kapsamlı online otobüs bileti satış
              platformu. Yüzlerce otobüs firmasının seferlerini tek bir yerden
              karşılaştırın ve en uygun fiyatlarla biletinizi alın.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/seferler" className="text-gray-300 hover:text-white">
                  Seferler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-300 hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-300 hover:text-white">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-gray-300 hover:text-white">
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Popüler Rotalar */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Popüler Rotalar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/seferler?kalkis_il=İstanbul&varis_il=Ankara" className="text-gray-300 hover:text-white">
                  İstanbul - Ankara
                </Link>
              </li>
              <li>
                <Link href="/seferler?kalkis_il=İstanbul&varis_il=İzmir" className="text-gray-300 hover:text-white">
                  İstanbul - İzmir
                </Link>
              </li>
              <li>
                <Link href="/seferler?kalkis_il=Ankara&varis_il=Antalya" className="text-gray-300 hover:text-white">
                  Ankara - Antalya
                </Link>
              </li>
              <li>
                <Link href="/seferler?kalkis_il=İzmir&varis_il=Antalya" className="text-gray-300 hover:text-white">
                  İzmir - Antalya
                </Link>
              </li>
              <li>
                <Link href="/seferler?kalkis_il=İstanbul&varis_il=Bursa" className="text-gray-300 hover:text-white">
                  İstanbul - Bursa
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-300 mr-2 mt-0.5" />
                <span className="text-gray-300">
                  Atatürk Bulvarı No:123, Kızılay, Ankara
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-300 mr-2" />
                <a href="tel:+902121234567" className="text-gray-300 hover:text-white">
                  +90 212 123 45 67
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-300 mr-2" />
                <a href="mailto:info@obilet.com" className="text-gray-300 hover:text-white">
                  info@obilet.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              &copy; {new Date().getFullYear()} OBilet. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/gizlilik-politikasi" className="text-gray-300 hover:text-white text-sm">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim-kosullari" className="text-gray-300 hover:text-white text-sm">
                Kullanım Koşulları
              </Link>
              <Link href="/cerez-politikasi" className="text-gray-300 hover:text-white text-sm">
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

