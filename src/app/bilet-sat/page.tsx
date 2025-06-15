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
  Printer,
  Save,
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
}

interface Koltuk {
  koltuk_no: number;
  durum: "bos" | "dolu" | "secili";
  cinsiyet?: "E" | "K";
}

export default function YazihaneBeliletSat() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [seferler, setSeferler] = useState<Sefer[]>([]);
  const [koltuklar, setKoltuklar] = useState<Koltuk[]>([]);
  const [loading, setLoading] = useState(false);
  
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
    if (koltuk?.durum === "dolu") {
      toast({
        title: "Koltuk Dolu",
        description: "Bu koltuk zaten rezerve edilmiş.",
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
    setStep(4);
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
      const response = await fetch('/api/bilet-sat', {
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
        toast({
          title: "Bilet Satışı Başarılı!",
          description: `Bilet No: ${data.bilet_id}`,
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
    setNotlar("");
    setSeferler([]);
    setKoltuklar([]);
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
                            disabled={sefer.bos_koltuk_sayisi === 0}
                            className="w-full"
                          >
                            {sefer.bos_koltuk_sayisi === 0 ? "Dolu" : "Seç"}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Koltuk Seçimi</h2>
                <p className="text-gray-600">{secilenSefer.firma_adi} - {formatCurrency(secilenSefer.ucret)}</p>
              </div>
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sefer Değiştir
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="max-w-md mx-auto">
                  {/* Otobüs Şeması */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <p className="text-sm font-medium text-gray-600">Şoför</p>
                      <div className="w-12 h-8 bg-gray-300 rounded mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {koltuklar.slice(0, 44).map((koltuk) => (
                        <button
                          key={koltuk.koltuk_no}
                          onClick={() => koltukSec(koltuk.koltuk_no)}
                          disabled={koltuk.durum === "dolu"}
                          className={`
                            w-10 h-10 rounded text-xs font-medium transition-colors
                            ${koltuk.durum === "bos" ? "bg-green-100 hover:bg-green-200 text-green-800" : ""}
                            ${koltuk.durum === "dolu" ? "bg-red-100 text-red-800 cursor-not-allowed" : ""}
                            ${koltuk.durum === "secili" ? "bg-blue-500 text-white" : ""}
                          `}
                        >
                          {koltuk.koltuk_no}
                        </button>
                      ))}
                    </div>
                    
                    {/* Arka koltuk */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => koltukSec(45)}
                        disabled={koltuklar[44]?.durum === "dolu"}
                        className={`
                          w-20 h-10 rounded text-xs font-medium transition-colors
                          ${koltuklar[44]?.durum === "bos" ? "bg-green-100 hover:bg-green-200 text-green-800" : ""}
                          ${koltuklar[44]?.durum === "dolu" ? "bg-red-100 text-red-800 cursor-not-allowed" : ""}
                          ${koltuklar[44]?.durum === "secili" ? "bg-blue-500 text-white" : ""}
                        `}
                      >
                        45
                      </button>
                    </div>
                  </div>
                  
                  {/* Koltuk Durumu Açıklaması */}
                  <div className="flex justify-center space-x-6 mt-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                      <span className="text-sm">Boş</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                      <span className="text-sm">Dolu</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm">Seçili</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad">Ad *</Label>
                      <Input
                        id="ad"
                        value={musteriAd}
                        onChange={(e) => setMusteriAd(e.target.value)}
                        placeholder="Yolcu adı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="soyad">Soyad *</Label>
                      <Input
                        id="soyad"
                        value={musteriSoyad}
                        onChange={(e) => setMusteriSoyad(e.target.value)}
                        placeholder="Yolcu soyadı"
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      value={musteriTelefon}
                      onChange={(e) => setMusteriTelefon(e.target.value)}
                      placeholder="0555 123 45 67"
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
              
              <div className="flex justify-center space-x-4">
                <Button onClick={yeniSatis} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Satış
                </Button>
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Bilet Yazdır
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

