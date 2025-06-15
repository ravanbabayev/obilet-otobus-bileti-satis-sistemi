"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Sefer {
  sefer_id: number;
  firma_adi: string;
  kalkis_il: string;
  kalkis_istasyon_adi: string;
  varis_il: string;
  varis_istasyon_adi: string;
  kalkis_tarihi: string;
  varis_tarihi: string;
  ucret: number;
  bos_koltuk_sayisi: number;
  sefer_durumu?: string;
}

interface Koltuk {
  koltuk_no: number;
  durum: "bos" | "dolu" | "secili";
  cinsiyet?: "E" | "K";
}

interface Musteri {
  musteri_id: number;
  ad: string;
  soyad: string;
  tc_kimlik_no: string;
  telefon: string;
  email?: string;
}

export default function YazihaneBeliletSat() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [seferler, setSeferler] = useState<Sefer[]>([]);
  const [koltuklar, setKoltuklar] = useState<Koltuk[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Müşteri seçimi
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [musteriSecimi, setMusteriSecimi] = useState<"yeni" | "kayitli">("yeni");
  const [secilenMusteri, setSecilenMusteri] = useState<Musteri | null>(null);
  const [musteriArama, setMusteriArama] = useState("");
  
  // Arama formu
  const [kalkisIl, setKalkisIl] = useState("");
  const [varisIl, setVarisIl] = useState("");
  const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0]);
  
  // Seçilen sefer ve koltuk
  const [secilenSefer, setSecilenSefer] = useState<Sefer | null>(null);
  const [secilenKoltuk, setSecilenKoltuk] = useState<number | null>(null);
  
  // Müşteri bilgileri
  const [musteriAd, setMusteriAd] = useState("");
  const [musteriSoyad, setMusteriSoyad] = useState("");
  const [musteriTc, setMusteriTc] = useState("");
  const [musteriTelefon, setMusteriTelefon] = useState("");
  const [musteriEmail, setMusteriEmail] = useState("");
  const [musteriCinsiyet, setMusteriCinsiyet] = useState<"E" | "K">("E");
  
  // Ödeme bilgileri
  const [odemeTuru, setOdemeTuru] = useState("nakit");
  const [personelAdi, setPersonelAdi] = useState("Admin Kullanıcı");
  const [notlar, setNotlar] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatTarih = (tarihStr: string) => {
    return new Date(tarihStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSaat = (tarihStr: string) => {
    return new Date(tarihStr).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Müşteri listesini yükle
  const musteriListesiYukle = async () => {
    try {
      const response = await fetch(`/api/musteriler?search=${encodeURIComponent(musteriArama)}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setMusteriler(data);
      } else {
        setMusteriler([]);
      }
    } catch (error) {
      console.error('Müşteri listesi yüklenirken hata:', error);
      setMusteriler([]);
    }
  };

  // Müşteri seçildiğinde bilgileri doldur
  const musteriSec = (musteri: Musteri) => {
    setSecilenMusteri(musteri);
    setMusteriAd(musteri.ad);
    setMusteriSoyad(musteri.soyad);
    setMusteriTc(musteri.tc_kimlik_no);
    setMusteriTelefon(musteri.telefon);
    setMusteriEmail(musteri.email || "");
  };

  // Müşteri seçimi değiştiğinde formu temizle
  const musteriSecimiDegistir = (secim: "yeni" | "kayitli") => {
    setMusteriSecimi(secim);
    setSecilenMusteri(null);
    
    if (secim === "yeni") {
      setMusteriAd("");
      setMusteriSoyad("");
      setMusteriTc("");
      setMusteriTelefon("");
      setMusteriEmail("");
    } else {
      musteriListesiYukle();
    }
  };

  const seferAra = async () => {
    if (!kalkisIl || !varisIl || !tarih) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm arama kriterlerini doldurun.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/seferler/ara?kalkis_il=${encodeURIComponent(kalkisIl)}&varis_il=${encodeURIComponent(varisIl)}&tarih=${tarih}`);
      const data = await response.json();
      
      if (response.ok) {
        setSeferler(data);
        setStep(2);
        toast({
          title: "Başarılı",
          description: `${data.length} sefer bulundu.`,
        });
      } else {
        toast({
          title: "Hata",
          description: data.error || "Seferler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: "Sunucuya bağlanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const seferSec = async (sefer: Sefer) => {
    setSecilenSefer(sefer);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/seferler/${sefer.sefer_id}/koltuklar`);
      const data = await response.json();
      
      if (response.ok) {
        // Koltuk düzenini oluştur
        const koltukDizilimi = Array.from({ length: 45 }, (_, i) => ({
          koltuk_no: i + 1,
          durum: "bos" as const,
        }));
        
        // Dolu koltukları işaretle
        data.forEach((koltuk: any) => {
          const index = koltuk.koltuk_no - 1;
          if (index >= 0 && index < koltukDizilimi.length) {
            koltukDizilimi[index].durum = "dolu";
            koltukDizilimi[index].cinsiyet = koltuk.cinsiyet;
          }
        });
        
        setKoltuklar(koltukDizilimi);
        setStep(3);
      } else {
        toast({
          title: "Hata",
          description: data.error || "Koltuk bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Koltuk bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const koltukSec = (koltukNo: number) => {
    const koltuk = koltuklar.find(k => k.koltuk_no === koltukNo);
    
    // Dolu koltuk kontrolü
    if (koltuk?.durum === "dolu") {
      toast({
        title: "Koltuk Dolu",
        description: "Bu koltuk zaten satılmış. Lütfen başka bir koltuk seçin.",
        variant: "destructive",
      });
      return;
    }

    // Koltuk bulunamadı kontrolü
    if (!koltuk) {
      toast({
        title: "Geçersiz Koltuk",
        description: "Seçilen koltuk bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    // Önceki seçimi temizle
    setKoltuklar(prev => prev.map(k => ({
      ...k,
      durum: k.durum === "secili" ? "bos" : k.durum
    })));

    // Yeni seçimi işaretle
    setKoltuklar(prev => prev.map(k => 
      k.koltuk_no === koltukNo 
        ? { ...k, durum: "secili" }
        : k
    ));

    setSecilenKoltuk(koltukNo);
    
    // Toast bildirim
    toast({
      title: "Koltuk Seçildi",
      description: `${koltukNo} numaralı koltuk seçildi. Devam etmek için "Müşteri Bilgilerine Geç" butonuna tıklayın.`,
    });
  };

  const biletSat = async () => {
    if (!secilenSefer || !secilenKoltuk || !musteriAd || !musteriSoyad || !musteriTc || !musteriTelefon) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/biletler/satin-al', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sefer_id: secilenSefer.sefer_id,
          koltuk_no: secilenKoltuk,
          musteri_ad: musteriAd,
          musteri_soyad: musteriSoyad,
          musteri_tc: musteriTc,
          musteri_telefon: musteriTelefon,
          musteri_email: musteriEmail,
          cinsiyet: musteriCinsiyet,
          odeme_turu: odemeTuru,
          personel_adi: personelAdi,
          notlar: notlar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const biletNo = data.satilan_biletler && data.satilan_biletler.length > 0 
          ? data.satilan_biletler[0].bilet_id 
          : 'N/A';
        
        toast({
          title: "Bilet Satışı Başarılı!",
          description: `Bilet No: ${biletNo}`,
        });
        setStep(5);
      } else {
        toast({
          title: "Satış Hatası",
          description: data.error || "Bilet satışı sırasında bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bilet satışı sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const yeniSatis = () => {
    setStep(1);
    setSecilenSefer(null);
    setSecilenKoltuk(null);
    setMusteriAd("");
    setMusteriSoyad("");
    setMusteriTc("");
    setMusteriTelefon("");
    setMusteriEmail("");
    setMusteriCinsiyet("E");
    setOdemeTuru("nakit");
    setPersonelAdi("Admin Kullanıcı");
    setNotlar("");
    setSeferler([]);
    setKoltuklar([]);
    setKalkisIl("");
    setVarisIl("");
    setTarih(new Date().toISOString().split('T')[0]);
    
    // Müşteri seçimi bilgilerini temizle
    setMusteriSecimi("yeni");
    setSecilenMusteri(null);
    setMusteriler([]);
    setMusteriArama("");
  };

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
              <Bus className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bilet Satış</h1>
                <p className="text-sm text-gray-500">Yazihane Yetkili Paneli</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Yetkili: {personelAdi}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Sefer Arama", icon: Search },
              { step: 2, title: "Sefer Seçimi", icon: Bus },
              { step: 3, title: "Koltuk Seçimi", icon: MapPin },
              { step: 4, title: "Müşteri Bilgileri", icon: User },
              { step: 5, title: "Tamamlandı", icon: CheckCircle }
            ].map(({ step: stepNum, title, icon: Icon }) => (
              <div key={stepNum} className={`flex items-center ${stepNum <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {stepNum < step ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="ml-2 text-sm font-medium">{title}</span>
                {stepNum < 5 && <div className={`w-8 h-0.5 ml-4 ${stepNum < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Sefer Arama */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Sefer Arama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kalkis">Kalkış İli</Label>
                  <Select value={kalkisIl} onValueChange={setKalkisIl}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kalkış ili seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="İstanbul">İstanbul</SelectItem>
                      <SelectItem value="Ankara">Ankara</SelectItem>
                      <SelectItem value="İzmir">İzmir</SelectItem>
                      <SelectItem value="Antalya">Antalya</SelectItem>
                      <SelectItem value="Bursa">Bursa</SelectItem>
                      <SelectItem value="Adana">Adana</SelectItem>
                      <SelectItem value="Konya">Konya</SelectItem>
                      <SelectItem value="Trabzon">Trabzon</SelectItem>
                      <SelectItem value="Samsun">Samsun</SelectItem>
                      <SelectItem value="Gaziantep">Gaziantep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="varis">Varış İli</Label>
                  <Select value={varisIl} onValueChange={setVarisIl}>
                    <SelectTrigger>
                      <SelectValue placeholder="Varış ili seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="İstanbul">İstanbul</SelectItem>
                      <SelectItem value="Ankara">Ankara</SelectItem>
                      <SelectItem value="İzmir">İzmir</SelectItem>
                      <SelectItem value="Antalya">Antalya</SelectItem>
                      <SelectItem value="Bursa">Bursa</SelectItem>
                      <SelectItem value="Adana">Adana</SelectItem>
                      <SelectItem value="Konya">Konya</SelectItem>
                      <SelectItem value="Trabzon">Trabzon</SelectItem>
                      <SelectItem value="Samsun">Samsun</SelectItem>
                      <SelectItem value="Gaziantep">Gaziantep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tarih">Seyahat Tarihi</Label>
                <Input
                  type="date"
                  value={tarih}
                  onChange={(e) => setTarih(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <Button onClick={seferAra} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "Aranıyor..." : "Sefer Ara"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Sefer Seçimi */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {kalkisIl} → {varisIl} Seferleri
              </h2>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Aramayı Değiştir
              </Button>
            </div>

            {seferler.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bu kriterlere uygun sefer bulunamadı.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {seferler.map((sefer) => (
                  <Card key={sefer.sefer_id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h3 className="font-bold text-lg text-blue-600">{sefer.firma_adi}</h3>
                          <p className="text-sm text-gray-500">
                            {sefer.bos_koltuk_sayisi} boş koltuk
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-semibold">{formatSaat(sefer.kalkis_tarihi)}</p>
                            <p className="text-sm text-gray-500">{sefer.kalkis_istasyon_adi}</p>
                          </div>
                          <div className="flex-1 border-t border-dashed border-gray-300 relative">
                            <Bus className="h-4 w-4 text-blue-600 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{formatSaat(sefer.varis_tarihi)}</p>
                            <p className="text-sm text-gray-500">{sefer.varis_istasyon_adi}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(sefer.ucret)}</p>
                        </div>
                        
                        <div>
                          <Button 
                            onClick={() => seferSec(sefer)} 
                            disabled={
                              sefer.bos_koltuk_sayisi === 0 || 
                              sefer.sefer_durumu === 'TAMAMLANDI' || 
                              sefer.sefer_durumu === 'DEVAM_EDIYOR'
                            }
                            className="w-full"
                          >
                            {sefer.bos_koltuk_sayisi === 0 ? "Dolu" : 
                             sefer.sefer_durumu === 'TAMAMLANDI' ? "Tamamlandı" :
                             sefer.sefer_durumu === 'DEVAM_EDIYOR' ? "Başladı" : "Seç"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Koltuk Seçimi */}
        {step === 3 && secilenSefer && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Koltuk Seçimi</h2>
                <div className="flex items-center mt-2 space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <Bus className="h-4 w-4 mr-1" />
                    {secilenSefer.firma_adi}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatTarih(secilenSefer.kalkis_tarihi)}
                  </span>
                  <span className="flex items-center text-green-600 font-semibold">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {formatCurrency(secilenSefer.ucret)}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setStep(2)} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sefer Değiştir
              </Button>
            </div>

            {/* Ana Koltuk Seçim Alanı */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Otobüs Şeması */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-center flex items-center justify-center">
                      <Bus className="h-6 w-6 mr-2 text-blue-600" />
                      Otobüs Koltuk Düzeni
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="max-w-lg mx-auto">
                      {/* Otobüs Gövdesi */}
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-inner">
                        {/* Şoför Bölümü */}
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Şoför</span>
                          </div>
                          <div className="w-16 h-3 bg-gray-400 rounded-full mx-auto mt-2"></div>
                        </div>
                        
                        {/* Koridor İşareti */}
                        <div className="text-center mb-4">
                          <div className="w-1 h-8 bg-yellow-400 mx-auto rounded-full"></div>
                          <span className="text-xs text-gray-500 font-medium">Koridor</span>
                        </div>
                        
                        {/* Koltuk Grid'i */}
                        <div className="grid grid-cols-4 gap-3">
                          {koltuklar.slice(0, 44).map((koltuk) => {
                            const isWindowSeat = (koltuk.koltuk_no - 1) % 4 === 0 || (koltuk.koltuk_no - 1) % 4 === 3;
                            const isAisleSeat = (koltuk.koltuk_no - 1) % 4 === 1 || (koltuk.koltuk_no - 1) % 4 === 2;
                            
                            return (
                              <button
                                key={koltuk.koltuk_no}
                                onClick={() => koltuk.durum !== "dolu" && koltukSec(koltuk.koltuk_no)}
                                disabled={koltuk.durum === "dolu"}
                                className={`
                                  relative w-14 h-12 rounded-lg text-sm font-bold transition-all duration-200 shadow-md
                                  ${koltuk.durum === "bos" ? 
                                    "bg-gradient-to-b from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 border-2 border-green-300 hover:shadow-lg transform hover:scale-105 cursor-pointer" : ""}
                                  ${koltuk.durum === "dolu" ? 
                                    "bg-gradient-to-b from-red-100 to-red-200 text-red-800 border-2 border-red-300 cursor-not-allowed opacity-75 pointer-events-none" : ""}
                                  ${koltuk.durum === "secili" ? 
                                    "bg-gradient-to-b from-blue-500 to-blue-600 text-white border-2 border-blue-400 shadow-lg ring-2 ring-blue-300 transform hover:scale-105 cursor-pointer" : ""}
                                  ${isWindowSeat ? "relative" : ""}
                                `}
                              >
                                {/* Pencere İkonu */}
                                {isWindowSeat && (
                                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-300 rounded-full"></div>
                                )}
                                
                                {/* Koltuk Numarası */}
                                <span className="relative z-10">{koltuk.koltuk_no}</span>
                                
                                {/* Cinsiyet İkonu */}
                                {koltuk.durum === "dolu" && koltuk.cinsiyet && (
                                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full text-xs flex items-center justify-center">
                                    {koltuk.cinsiyet === "E" ? "♂" : "♀"}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Arka Koltuk */}
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={() => koltuklar[44]?.durum !== "dolu" && koltukSec(45)}
                            disabled={koltuklar[44]?.durum === "dolu"}
                            className={`
                              w-24 h-12 rounded-lg text-sm font-bold transition-all duration-200 shadow-md
                              ${koltuklar[44]?.durum === "bos" ? 
                                "bg-gradient-to-b from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 border-2 border-green-300 hover:shadow-lg transform hover:scale-105 cursor-pointer" : ""}
                              ${koltuklar[44]?.durum === "dolu" ? 
                                "bg-gradient-to-b from-red-100 to-red-200 text-red-800 border-2 border-red-300 cursor-not-allowed opacity-75 pointer-events-none" : ""}
                              ${koltuklar[44]?.durum === "secili" ? 
                                "bg-gradient-to-b from-blue-500 to-blue-600 text-white border-2 border-blue-400 shadow-lg ring-2 ring-blue-300 transform hover:scale-105 cursor-pointer" : ""}
                            `}
                          >
                            45
                            {koltuklar[44]?.durum === "dolu" && koltuklar[44]?.cinsiyet && (
                              <span className="ml-1 text-xs">
                                {koltuklar[44].cinsiyet === "E" ? "♂" : "♀"}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bilgi Paneli */}
              <div className="space-y-6">
                {/* Koltuk Durumu Açıklaması */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Koltuk Durumları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-300 rounded-lg mr-3"></div>
                        <span className="font-medium text-green-800">Boş Koltuk</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Seçilebilir</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-b from-red-100 to-red-200 border-2 border-red-300 rounded-lg mr-3"></div>
                        <span className="font-medium text-red-800">Dolu Koltuk</span>
                      </div>
                      <span className="text-sm text-red-600 font-medium">Satılmış</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-b from-blue-500 to-blue-600 border-2 border-blue-400 rounded-lg mr-3"></div>
                        <span className="font-medium text-blue-800">Seçili Koltuk</span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">Aktif Seçim</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-1 h-6 bg-blue-300 rounded-full mr-3 ml-2"></div>
                        <span className="font-medium text-gray-800">Pencere Kenarı</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Manzaralı</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Seçilen Koltuk Bilgisi */}
                {secilenKoltuk && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="bg-blue-100">
                      <CardTitle className="text-blue-800 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Seçilen Koltuk
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Koltuk Numarası:</span>
                          <span className="font-bold text-lg text-blue-800">{secilenKoltuk}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Konum:</span>
                          <span className="font-medium">
                            {((secilenKoltuk - 1) % 4 === 0 || (secilenKoltuk - 1) % 4 === 3) ? "Pencere Kenarı" : "Koridor Kenarı"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Ücret:</span>
                          <span className="font-bold text-green-600">{formatCurrency(secilenSefer.ucret)}</span>
                        </div>
                        <div className="pt-3 border-t border-blue-200">
                          <Button
                            onClick={() => setStep(4)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Müşteri Bilgilerine Geç
                            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sefer Bilgileri */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sefer Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kalkış:</span>
                      <span className="font-medium">{secilenSefer.kalkis_istasyon_adi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Varış:</span>
                      <span className="font-medium">{secilenSefer.varis_istasyon_adi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarih:</span>
                      <span className="font-medium">{formatTarih(secilenSefer.kalkis_tarihi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saat:</span>
                      <span className="font-medium">{formatSaat(secilenSefer.kalkis_tarihi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boş Koltuk:</span>
                      <span className="font-medium text-green-600">{secilenSefer.bos_koltuk_sayisi}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Müşteri Bilgileri */}
        {step === 4 && secilenSefer && secilenKoltuk && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Müşteri Bilgileri</h2>
                <p className="text-gray-600">
                  {secilenSefer.firma_adi} - Koltuk {secilenKoltuk} - {formatCurrency(secilenSefer.ucret)}
                </p>
              </div>
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Koltuk Değiştir
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Yolcu Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Müşteri Seçim Türü */}
                  <div>
                    <Label>Müşteri Seçimi</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="musteriSecimi"
                          value="yeni"
                          checked={musteriSecimi === "yeni"}
                          onChange={() => musteriSecimiDegistir("yeni")}
                          className="text-blue-600"
                        />
                        <span>Yeni Müşteri</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="musteriSecimi"
                          value="kayitli"
                          checked={musteriSecimi === "kayitli"}
                          onChange={() => musteriSecimiDegistir("kayitli")}
                          className="text-blue-600"
                        />
                        <span>Kayıtlı Müşteri</span>
                      </label>
                    </div>
                  </div>

                  {/* Kayıtlı Müşteri Seçimi */}
                  {musteriSecimi === "kayitli" && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="musteriArama">Müşteri Ara</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="musteriArama"
                            value={musteriArama}
                            onChange={(e) => setMusteriArama(e.target.value)}
                            placeholder="Ad, soyad, TC veya telefon ile ara..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={musteriListesiYukle}
                            disabled={loading}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Müşteri Listesi */}
                      {musteriler.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                          {musteriler.map((musteri) => (
                            <div
                              key={musteri.musteri_id}
                              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                                secilenMusteri?.musteri_id === musteri.musteri_id ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                              onClick={() => musteriSec(musteri)}
                            >
                              <div className="font-medium">{musteri.ad} {musteri.soyad}</div>
                              <div className="text-sm text-gray-500">
                                TC: {musteri.tc_kimlik_no} | Tel: {musteri.telefon}
                              </div>
                              {musteri.email && (
                                <div className="text-sm text-gray-500">Email: {musteri.email}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {secilenMusteri && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-800">
                                Seçilen: {secilenMusteri.ad} {secilenMusteri.soyad}
                              </div>
                              <div className="text-sm text-blue-600">
                                TC: {secilenMusteri.tc_kimlik_no}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSecilenMusteri(null)}
                            >
                              Temizle
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Müşteri Bilgileri Formu */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad">Ad *</Label>
                      <Input
                        id="ad"
                        value={musteriAd}
                        onChange={(e) => setMusteriAd(e.target.value)}
                        placeholder="Yolcu adı"
                        disabled={musteriSecimi === "kayitli" && secilenMusteri !== null}
                      />
                    </div>
                    <div>
                      <Label htmlFor="soyad">Soyad *</Label>
                      <Input
                        id="soyad"
                        value={musteriSoyad}
                        onChange={(e) => setMusteriSoyad(e.target.value)}
                        placeholder="Yolcu soyadı"
                        disabled={musteriSecimi === "kayitli" && secilenMusteri !== null}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tc">TC Kimlik No *</Label>
                    <Input
                      id="tc"
                      value={musteriTc}
                      onChange={(e) => setMusteriTc(e.target.value)}
                      placeholder="11 haneli TC kimlik numarası"
                      maxLength={11}
                      disabled={musteriSecimi === "kayitli" && secilenMusteri !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      value={musteriTelefon}
                      onChange={(e) => setMusteriTelefon(e.target.value)}
                      placeholder="0555 123 45 67"
                      disabled={musteriSecimi === "kayitli" && secilenMusteri !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={musteriEmail}
                      onChange={(e) => setMusteriEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      disabled={musteriSecimi === "kayitli" && secilenMusteri !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cinsiyet">Cinsiyet</Label>
                    <Select value={musteriCinsiyet} onValueChange={(value: "E" | "K") => setMusteriCinsiyet(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E">Erkek</SelectItem>
                        <SelectItem value="K">Kadın</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Ödeme ve Satış Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Satış Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="odeme">Ödeme Türü</Label>
                    <Select value={odemeTuru} onValueChange={setOdemeTuru}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nakit">Nakit</SelectItem>
                        <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                        <SelectItem value="banka_havalesi">Banka Havalesi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="personel">Satış Yapan Personel</Label>
                    <Input
                      id="personel"
                      value={personelAdi}
                      onChange={(e) => setPersonelAdi(e.target.value)}
                      placeholder="Personel adı"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notlar">Notlar</Label>
                    <Textarea
                      id="notlar"
                      value={notlar}
                      onChange={(e) => setNotlar(e.target.value)}
                      placeholder="Ek notlar (opsiyonel)"
                      rows={3}
                    />
                  </div>

                  {/* Özet */}
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Satış Özeti</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Sefer:</span>
                        <span>{secilenSefer.kalkis_il} → {secilenSefer.varis_il}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarih:</span>
                        <span>{formatTarih(secilenSefer.kalkis_tarihi)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Koltuk:</span>
                        <span>{secilenKoltuk}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Toplam:</span>
                        <span className="text-green-600">{formatCurrency(secilenSefer.ucret)}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={biletSat} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? "Satış Yapılıyor..." : "Bilet Sat"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 5: Tamamlandı */}
        {step === 5 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bilet Satışı Tamamlandı!</h2>
              <p className="text-gray-600 mb-8">
                Bilet başarıyla satıldı ve sistem kayıtlarına eklendi.
              </p>
              
              <div className="flex justify-center">
                <Button onClick={yeniSatis} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Satış
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

