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
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  seferler: {
    toplam: number;
    aktif: number;
    beklemede: number;
  };
  biletler: {
    toplam: number;
    aktif: number;
    iptal: number;
    kullanildi: number;
  };
  musteriler: {
    toplam: number;
  };
  firmalar: {
    toplam: number;
    aktif: number;
  };
  istasyonlar: {
    toplam: number;
    aktif: number;
  };
  araclar: {
    toplam: number;
    aktif: number;
  };
}

interface RecentActivity {
  type: string;
  description: string;
  detail: string;
  timestamp: string;
}

export default function YonetimPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Dashboard istatistikleri alınamadı:', data.error);
      }
    } catch (error) {
      console.error('Dashboard istatistikleri fetch hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await fetch('/api/dashboard/activities');
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.data);
      } else {
        console.error('Son işlemler alınamadı:', data.error);
      }
    } catch (error) {
      console.error('Son işlemler fetch hatası:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sefer':
        return <Bus className="h-4 w-4 text-blue-600" />;
      case 'bilet':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'firma':
        return <Building2 className="h-4 w-4 text-green-600" />;
      case 'musteri':
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'sefer':
        return 'bg-blue-100';
      case 'bilet':
        return 'bg-purple-100';
      case 'firma':
        return 'bg-green-100';
      case 'musteri':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Az önce';
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const yonetimModulleri = [
    {
      title: "Sefer Yönetimi",
      description: "Seferleri ekle, düzenle, sil ve listele",
      icon: Bus,
      href: "/yonetim/seferler",
      color: "bg-blue-500",
      stats: loading ? "Yükleniyor..." : `${stats?.seferler.aktif || 0} aktif sefer`
    },
    {
      title: "Firma Yönetimi", 
      description: "Otobüs firmalarını yönet",
      icon: Building2,
      href: "/yonetim/firmalar",
      color: "bg-green-500",
      stats: loading ? "Yükleniyor..." : `${stats?.firmalar.aktif || 0} firma`
    },
    {
      title: "Bilet Yönetimi",
      description: "Satılan biletleri görüntüle ve yönet",
      icon: CreditCard,
      href: "/yonetim/biletler",
      color: "bg-purple-500",
      stats: loading ? "Yükleniyor..." : `${stats?.biletler.toplam || 0} bilet`
    },
    {
      title: "İstasyon Yönetimi",
      description: "Otobüs istasyonlarını yönet",
      icon: MapPin,
      href: "/yonetim/istasyonlar",
      color: "bg-red-500",
      stats: loading ? "Yükleniyor..." : `${stats?.istasyonlar.aktif || 0} istasyon`
    },
    {
      title: "Araç Yönetimi",
      description: "Otobüs araçlarını yönet",
      icon: Truck,
      href: "/yonetim/araclar",
      color: "bg-teal-500",
      stats: loading ? "Yükleniyor..." : `${stats?.araclar.aktif || 0} araç`
    },
    {
      title: "Raporlar",
      description: "Satış ve işletme raporları",
      icon: BarChart3,
      href: "/yonetim/raporlar",
      color: "bg-pink-500",
      stats: "15 rapor türü"
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

        {/* Quick Stats - Removed Customer Box */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sistem Özeti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Sefer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : stats?.seferler.toplam || 0}
                    </p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : stats?.biletler.aktif || 0}
                    </p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : stats?.firmalar.aktif || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities - Now Dynamic */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Son İşlemler</h3>
          <Card>
            <CardContent className="p-6">
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">İşlemler yükleniyor...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Son 7 gün içinde işlem bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between py-3 ${
                        index < activities.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 ${getActivityIconBg(activity.type)} rounded-lg mr-3`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-500">{activity.detail}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 