"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, 
  ArrowLeft, 
  Building2, 
  Users, 
  CreditCard,
  MapPin,
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Database,
  UserCheck,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function YonetimPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const yonetimModulleri = [
    {
      title: "Sefer Yönetimi",
      description: "Seferleri ekle, düzenle, sil ve listele",
      icon: Bus,
      href: "/yonetim/seferler",
      color: "bg-blue-500",
      stats: "23 aktif sefer"
    },
    {
      title: "Firma Yönetimi", 
      description: "Otobüs firmalarını yönet",
      icon: Building2,
      href: "/yonetim/firmalar",
      color: "bg-green-500",
      stats: "8 firma"
    },
    {
      title: "Bilet Yönetimi",
      description: "Satılan biletleri görüntüle ve yönet",
      icon: CreditCard,
      href: "/yonetim/biletler",
      color: "bg-purple-500",
      stats: "147 bilet"
    },
    {
      title: "Müşteri Yönetimi",
      description: "Müşteri bilgilerini yönet",
      icon: Users,
      href: "/yonetim/musteriler",
      color: "bg-orange-500",
      stats: "89 müşteri"
    },
    {
      title: "İstasyon Yönetimi",
      description: "Otobüs istasyonlarını yönet",
      icon: MapPin,
      href: "/yonetim/istasyonlar",
      color: "bg-red-500",
      stats: "45 istasyon"
    },
    {
      title: "Personel Yönetimi",
      description: "Yazihane personellerini yönet",
      icon: UserCheck,
      href: "/yonetim/personel",
      color: "bg-indigo-500",
      stats: "5 personel"
    },
    {
      title: "Araç Yönetimi",
      description: "Otobüs araçlarını yönet",
      icon: Truck,
      href: "/yonetim/araclar",
      color: "bg-teal-500",
      stats: "12 araç"
    },
    {
      title: "Raporlar",
      description: "Satış ve işletme raporları",
      icon: BarChart3,
      href: "/yonetim/raporlar",
      color: "bg-pink-500",
      stats: "15 rapor türü"
    },
    {
      title: "Sistem Ayarları",
      description: "Uygulama ayarlarını yönet",
      icon: Settings,
      href: "/yonetim/ayarlar",
      color: "bg-gray-500",
      stats: "Konfigürasyon"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Panel
                </Button>
              </Link>
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Yönetim Paneli</h1>
                <p className="text-sm text-gray-500">Sistem Yönetimi ve CRUD İşlemleri</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Yetkili: Admin</p>
                <p className="text-xs text-gray-500">
                  {mounted ? new Date().toLocaleDateString('tr-TR') : 'Yükleniyor...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Yönetim Modülleri</h2>
          <p className="text-gray-600">
            Yazihane sisteminin tüm bileşenlerini buradan yönetebilirsiniz.
          </p>
        </div>

        {/* Management Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yonetimModulleri.map((modul, index) => (
            <Link key={index} href={modul.href}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${modul.color}`}>
                      <modul.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-500">{modul.stats}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{modul.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{modul.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sistem Özeti</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Sefer</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Satılan Bilet</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Kayıtlı Müşteri</p>
                    <p className="text-2xl font-bold text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktif Firma</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Son İşlemler</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Bus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Yeni sefer eklendi</p>
                      <p className="text-sm text-gray-500">İstanbul → Ankara - 14:30</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 saat önce</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Building2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Firma bilgileri güncellendi</p>
                      <p className="text-sm text-gray-500">Metro Turizm - İletişim bilgileri</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">4 saat önce</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Bilet iptali yapıldı</p>
                      <p className="text-sm text-gray-500">Bilet #1247 - Ahmet Yılmaz</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">6 saat önce</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Yeni müşteri kaydı</p>
                      <p className="text-sm text-gray-500">Fatma Demir - 0555 123 45 67</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 gün önce</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 