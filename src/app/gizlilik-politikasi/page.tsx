'use client';

import { Shield, Eye, Lock, Users, Database, FileText, Scale, Globe } from 'lucide-react';

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gizlilik Politikası</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kişisel verilerinizin korunması bizim için önceliklidir. KVKK kapsamında haklarınız ve verilerinizin işlenme şekli.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Son güncellenme: 01 Haziran 2024
          </div>
        </div>

        {/* KVKK Özeti */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Scale className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-blue-900">KVKK Kapsamında Haklarınız</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</div>
            <div>• İşlenen kişisel verileriniz hakkında bilgi talep etme</div>
            <div>• Kişisel verilerinizin işlenme amacını öğrenme</div>
            <div>• Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</div>
            <div>• Kişisel verilerinizin silinmesini veya yok edilmesini isteme</div>
            <div>• İşlenen verilerin aktarıldığı üçüncü kişileri bilme</div>
          </div>
        </div>

        {/* Veri Kategorileri */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Database className="w-6 h-6 text-red-600 mr-3" />
            Topladığımız Veriler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Kimlik Bilgileri</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ad, soyad</li>
                <li>• TC kimlik numarası</li>
                <li>• Doğum tarihi</li>
                <li>• Cinsiyet</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">İletişim Bilgileri</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• E-posta adresi</li>
                <li>• Telefon numarası</li>
                <li>• Adres bilgileri</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Finansal Bilgiler</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Kredi kartı bilgileri (şifreli)</li>
                <li>• Ödeme geçmişi</li>
                <li>• Fatura bilgileri</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Teknik Bilgiler</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• IP adresi</li>
                <li>• Tarayıcı bilgileri</li>
                <li>• Çerezler (Cookies)</li>
                <li>• Site kullanım verileri</li>
              </ul>
            </div>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Sorularınız mı Var?</h2>
          <p className="text-lg mb-6 opacity-90">
            Gizlilik politikamız hakkında detaylı bilgi almak için bizimle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              kvkk@obilet.com
            </button>
            <button className="bg-red-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-800 transition-colors">
              444 0 BİLET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 