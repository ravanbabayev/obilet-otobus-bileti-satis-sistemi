"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Clock,
  MapPin,
  Plus,
  Search,
  Filter,
  BarChart3,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
  bugunSatilanBilet: number;
  bugunGelir: number;
  aktifSeferSayisi: number;
  bekleyenMusteriler: number;
}

interface RecentSale {
  bilet_id: number;
  musteri_adi: string;
  sefer_bilgisi: string;
  ucret: number;
  satis_zamani: string;
}

export default function YazihanePanel() {
  const [stats, setStats] = useState<DashboardStats>({
    bugunSatilanBilet: 0,
    bugunGelir: 0,
    aktifSeferSayisi: 0,
    bekleyenMusteriler: 0
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Component mount olduğunda saat başlat
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dashboard verilerini yükle
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulated data - gerçek API'lerle değiştirilebilir
        setStats({
          bugunSatilanBilet: 47,
          bugunGelir: 12450,
          aktifSeferSayisi: 23,
          bekleyenMusteriler: 3
        });

        setRecentSales([
          {
            bilet_id: 1001,
            musteri_adi: "Ahmet Yılmaz",
            sefer_bilgisi: "İstanbul → Ankara",
            ucret: 150,
            satis_zamani: "14:30"
          },
          {
            bilet_id: 1002,
            musteri_adi: "Fatma Demir",
            sefer_bilgisi: "Ankara → İzmir",
            ucret: 180,
            satis_zamani: "14:15"
          },
          {
            bilet_id: 1003,
            musteri_adi: "Mehmet Kaya",
            sefer_bilgisi: "İzmir → Antalya",
            ucret: 120,
            satis_zamani: "13:45"
          }
        ]);
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">OBilet Yazihane</h1>
                <p className="text-sm text-gray-500">Yetkili Paneli</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                {mounted && currentTime ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatTime(currentTime)}</p>
                    <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">--:--:--</p>
                    <p className="text-xs text-gray-500">Yükleniyor...</p>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Yetkili: Admin
                </Button>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/bilet-sat">
              <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center">
                <Plus className="h-6 w-6 mb-2" />
                <span className="font-semibold">Bilet Sat</span>
              </Button>
            </Link>
            
            <Link href="/seferler">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Search className="h-6 w-6 mb-2" />
                <span className="font-semibold">Sefer Ara</span>
              </Button>
            </Link>
            
            <Link href="/bilet-ara">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Filter className="h-6 w-6 mb-2" />
                <span className="font-semibold">Bilet Sorgula</span>
              </Button>
            </Link>
            
            <Link href="/yonetim">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="font-semibold">Yönetim</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Günlük Özet</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satılan Bilet</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.bugunSatilanBilet}</div>
                <p className="text-xs text-muted-foreground">Bugün satılan toplam bilet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Günlük Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.bugunGelir)}</div>
                <p className="text-xs text-muted-foreground">Bugünkü toplam satış</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Seferler</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.aktifSeferSayisi}</div>
                <p className="text-xs text-muted-foreground">Bugün için aktif sefer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen İşlem</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.bekleyenMusteriler}</div>
                <p className="text-xs text-muted-foreground">İşlem bekleyen müşteri</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sales & Quick Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Son Satışlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.bilet_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{sale.musteri_adi}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {sale.sefer_bilgisi}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(sale.ucret)}</p>
                      <p className="text-xs text-gray-500">{sale.satis_zamani}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Tüm Satışları Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Hızlı Arama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bilet Numarası ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input placeholder="Bilet numarası girin..." className="flex-1" />
                  <Button>Ara</Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  TC Kimlik ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input placeholder="TC kimlik numarası..." className="flex-1" />
                  <Button>Ara</Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Telefon ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input placeholder="Telefon numarası..." className="flex-1" />
                  <Button>Ara</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Hızlı Sefer Arama</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Kalkış" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="istanbul">İstanbul</SelectItem>
                      <SelectItem value="ankara">Ankara</SelectItem>
                      <SelectItem value="izmir">İzmir</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Varış" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="istanbul">İstanbul</SelectItem>
                      <SelectItem value="ankara">Ankara</SelectItem>
                      <SelectItem value="izmir">İzmir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full mt-3">Seferleri Listele</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

