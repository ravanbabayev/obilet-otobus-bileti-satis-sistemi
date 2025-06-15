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
  LogOut,
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardStats {
  bugunSatilanBilet: number;
  bugunGelir: number;
  aktifSeferSayisi: number;
  bekleyenMusteriler: number;
  recentSales: RecentSale[];
}

interface RecentSale {
  bilet_id: number;
  musteri_adi: string;
  sefer_bilgisi: string;
  ucret: number;
  satis_zamani: string;
  bilet_tarihi: string;
}

interface SearchResult {
  bilet_id: number;
  koltuk_no: number;
  bilet_durumu: string;
  ucret: number;
  bilet_tarihi: string;
  bilet_saati: string;
  musteri_adi: string;
  tc_kimlik_no: string;
  musteri_telefon: string;
  sefer_bilgisi: string;
  kalkis_tarihi: string;
  kalkis_saati: string;
  firma_adi: string;
  plaka: string;
}

export default function YazihanePanel() {
  const [stats, setStats] = useState<DashboardStats>({
    bugunSatilanBilet: 0,
    bugunGelir: 0,
    aktifSeferSayisi: 0,
    bekleyenMusteriler: 0,
    recentSales: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Search states
  const [biletNo, setBiletNo] = useState("");
  const [tcKimlik, setTcKimlik] = useState("");
  const [telefon, setTelefon] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/main-stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // API direkt data döndürüyor, success field'ı yok
      if (data.error) {
        console.error('Dashboard verileri alınamadı:', data.error);
        setStats({
          bugunSatilanBilet: 0,
          bugunGelir: 0,
          aktifSeferSayisi: 0,
          bekleyenMusteriler: 0,
          recentSales: []
        });
      } else {
        // API response'unu frontend formatına çevir
        setStats({
          bugunSatilanBilet: data.bilet || 0,
          bugunGelir: parseFloat(data.gelir || '0'),
          aktifSeferSayisi: data.sefer || 0,
          bekleyenMusteriler: 0, // API'de yok, 0 olarak ayarla
          recentSales: data.recentSales || []
        });
      }
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata:", error);
      // Fallback to static data
      setStats({
        bugunSatilanBilet: 0,
        bugunGelir: 0,
        aktifSeferSayisi: 0,
        bekleyenMusteriler: 0,
        recentSales: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (searchType: 'bilet' | 'tc' | 'telefon') => {
    const searchValue = searchType === 'bilet' ? biletNo : 
                       searchType === 'tc' ? tcKimlik : telefon;
    
    if (!searchValue.trim()) {
      setSearchError('Lütfen arama değeri girin');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchResults([]);

      const params = new URLSearchParams();
      if (searchType === 'bilet') params.set('bilet_no', searchValue);
      else if (searchType === 'tc') params.set('tc_kimlik', searchValue);
      else params.set('telefon', searchValue);

      const response = await fetch(`/api/search/quick?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setShowResults(true);
        if (data.data.length === 0) {
          setSearchError('Arama kriterinize uygun sonuç bulunamadı');
        }
      } else {
        setSearchError(data.error || 'Arama sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchError('Arama sırasında hata oluştu');
    } finally {
      setSearchLoading(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const badges = {
      'AKTIF': 'bg-green-100 text-green-800',
      'IPTAL': 'bg-red-100 text-red-800',
      'KULLANILDI': 'bg-blue-100 text-blue-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/bilet-sat">
              <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center">
                <Plus className="h-6 w-6 mb-2" />
                <span className="font-semibold">Bilet Sat</span>
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

        {/* Dashboard Stats - Now Dynamic */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Günlük Özet</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satılan Bilet</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : stats.bugunSatilanBilet}
                </div>
                <p className="text-xs text-muted-foreground">Bugün satılan toplam bilet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Günlük Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? "..." : formatCurrency(stats.bugunGelir)}
                </div>
                <p className="text-xs text-muted-foreground">Bugünkü toplam satış</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Seferler</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? "..." : stats.aktifSeferSayisi}
                </div>
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
          {/* Recent Sales - Now Dynamic */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Son Satışlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Yükleniyor...</p>
                </div>
              ) : stats.recentSales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Henüz satış bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentSales.slice(0, 5).map((sale) => (
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
              )}
              <div className="mt-4">
                <Link href="/yonetim/biletler">
                  <Button variant="outline" className="w-full">
                    Tüm Satışları Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Search - Now Working */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Hızlı Arama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bilet Numarası ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Bilet numarası girin..." 
                    className="flex-1" 
                    value={biletNo}
                    onChange={(e) => setBiletNo(e.target.value)}
                    disabled={searchLoading}
                  />
                  <Button 
                    onClick={() => handleQuickSearch('bilet')}
                    disabled={searchLoading}
                  >
                    {searchLoading ? "..." : "Ara"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  TC Kimlik ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="TC kimlik numarası..." 
                    className="flex-1" 
                    value={tcKimlik}
                    onChange={(e) => setTcKimlik(e.target.value)}
                    disabled={searchLoading}
                  />
                  <Button 
                    onClick={() => handleQuickSearch('tc')}
                    disabled={searchLoading}
                  >
                    {searchLoading ? "..." : "Ara"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Telefon ile Ara
                </label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Telefon numarası..." 
                    className="flex-1" 
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    disabled={searchLoading}
                  />
                  <Button 
                    onClick={() => handleQuickSearch('telefon')}
                    disabled={searchLoading}
                  >
                    {searchLoading ? "..." : "Ara"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Arama Sonuçları ({searchResults.length} sonuç)</span>
                  <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
                    Kapat
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.bilet_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">Bilet #{result.bilet_id}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(result.bilet_durumu)}`}>
                          {result.bilet_durumu}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Müşteri</p>
                          <p className="font-medium">{result.musteri_adi}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sefer</p>
                          <p className="font-medium">{result.sefer_bilgisi}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Koltuk</p>
                          <p className="font-medium">{result.koltuk_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ücret</p>
                          <p className="font-medium text-green-600">{formatCurrency(result.ucret)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Kalkış</p>
                          <p className="font-medium">{result.kalkis_tarihi} {result.kalkis_saati}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Firma</p>
                          <p className="font-medium">{result.firma_adi}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Plaka</p>
                          <p className="font-medium">{result.plaka}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Telefon</p>
                          <p className="font-medium">{result.musteri_telefon}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

