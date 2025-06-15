"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bus, Clock, MapPin, Calendar, CreditCard, User, Phone, Mail, Check } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Sefer {
  sefer_id: number;
  firma_adi: string;
  kalkis_yeri: string;
  varis_yeri: string;
  kalkis_zamani: string;
  varis_zamani: string;
  ucret: number;
  bos_koltuk_sayisi: number;
  toplam_koltuk_sayisi: number;
}

interface Koltuk {
  koltuk_no: number;
  durum: "bos" | "dolu" | "secili";
  cinsiyet?: "E" | "K";
}

export default function SeferDetayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [sefer, setSefer] = useState<Sefer | null>(null);
  const [koltuklar, setKoltuklar] = useState<Koltuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seciliKoltuk, setSeciliKoltuk] = useState<number | null>(null);
  const [kullaniciId, setKullaniciId] = useState<number | null>(null);
  const [adimlar, setAdimlar] = useState<"koltuk_secimi" | "odeme">("koltuk_secimi");
  const [odemeLoading, setOdemeLoading] = useState(false);

  // Kredi kartı bilgileri
  const [kartNumarasi, setKartNumarasi] = useState("");
  const [kartSahibi, setKartSahibi] = useState("");
  const [sonKullanmaTarihi, setSonKullanmaTarihi] = useState("");
  const [cvv, setCvv] = useState("");

  // Kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setKullaniciId(user.kullanici_id);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
      }
    }
  }, []);

  // Sefer ve koltuk bilgilerini yükle
  useEffect(() => {
    const fetchSeferDetay = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/seferler/${params.id}`);

        if (!response.ok) {
          throw new Error("Sefer detayı yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setSefer(data.sefer);
        
        // Koltukları düzenle
        const koltukDizilimi = Array.from({ length: data.sefer.toplam_koltuk_sayisi }, (_, i) => ({
          koltuk_no: i + 1,
          durum: "bos" as const,
        }));
        
        // Dolu koltukları işaretle
        data.koltuklar.forEach((koltuk: any) => {
          const index = koltuk.koltuk_no - 1;
          if (index >= 0 && index < koltukDizilimi.length) {
            koltukDizilimi[index].durum = "dolu";
            koltukDizilimi[index].cinsiyet = koltuk.cinsiyet;
          }
        });
        
        setKoltuklar(koltukDizilimi);
      } catch (error: any) {
        setError(error.message || "Sefer detayı yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchSeferDetay();
  }, [params.id]);

  // Koltuk seçimi
  const handleKoltukSec = (koltukNo: number) => {
    if (!kullaniciId) {
      toast({
        variant: "destructive",
        title: "Giriş Yapmalısınız",
        description: "Koltuk seçimi yapmak için giriş yapmalısınız.",
      });
      
      // Giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/giris");
      }, 2000);
      return;
    }

    // Dolu koltuğu seçemez
    const koltuk = koltuklar.find((k) => k.koltuk_no === koltukNo);
    if (koltuk?.durum === "dolu") {
      return;
    }

    // Önceki seçimi temizle
    const yeniKoltuklar = koltuklar.map((k) => ({
      ...k,
      durum: k.durum === "secili" ? "bos" : k.durum,
    }));

    // Yeni seçimi işaretle
    const yeniSeciliIndex = yeniKoltuklar.findIndex((k) => k.koltuk_no === koltukNo);
    if (yeniSeciliIndex !== -1) {
      yeniKoltuklar[yeniSeciliIndex].durum = "secili";
    }

    setKoltuklar(yeniKoltuklar);
    setSeciliKoltuk(koltukNo);
  };

  // Ödeme adımına geç
  const handleOdemeAdimina = () => {
    if (!seciliKoltuk) {
      toast({
        variant: "destructive",
        title: "Koltuk Seçilmedi",
        description: "Lütfen bir koltuk seçiniz.",
      });
      return;
    }

    setAdimlar("odeme");
  };

  // Koltuk seçimine dön
  const handleKoltukSecimeDon = () => {
    setAdimlar("koltuk_secimi");
  };

  // Bilet satın al
  const handleBiletSatinAl = async () => {
    if (!kullaniciId || !seciliKoltuk || !sefer) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bilet satın alınamadı. Lütfen tekrar deneyin.",
      });
      return;
    }

    // Kredi kartı bilgilerini kontrol et
    if (!kartNumarasi || !kartSahibi || !sonKullanmaTarihi || !cvv) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen tüm ödeme bilgilerini doldurunuz.",
      });
      return;
    }

    setOdemeLoading(true);

    try {
      const response = await fetch("/api/biletler/satin-al", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kullanici_id: kullaniciId,
          sefer_id: sefer.sefer_id,
          koltuk_no: seciliKoltuk,
          ucret: sefer.ucret,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bilet satın alınamadı");
      }

      // Başarılı satın alma
      toast({
        title: "Bilet Satın Alındı",
        description: "Biletiniz başarıyla satın alındı. Profilinizden biletlerinizi görüntüleyebilirsiniz.",
      });

      // Profil sayfasına yönlendir
      setTimeout(() => {
        router.push("/profil");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Satın Alma Başarısız",
        description: error.message || "Bilet satın alınamadı. Lütfen tekrar deneyin.",
      });
    } finally {
      setOdemeLoading(false);
    }
  };

  // Tarih formatı
  const formatTarih = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: tr });
  };

  // Saat formatı
  const formatSaat = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  // Seyahat süresi hesaplama
  const hesaplaSeyahatSuresi = (kalkis: string, varis: string) => {
    if (!kalkis || !varis) return "";
    const kalkisZamani = new Date(kalkis).getTime();
    const varisZamani = new Date(varis).getTime();
    const farkMilisaniye = varisZamani - kalkisZamani;
    
    const saat = Math.floor(farkMilisaniye / (1000 * 60 * 60));
    const dakika = Math.floor((farkMilisaniye % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${saat} sa ${dakika} dk`;
  };

  // Kredi kartı numarası formatı
  const handleKartNumarasiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .substring(0, 19);
    setKartNumarasi(formattedValue);
  };

  // Son kullanma tarihi formatı
  const handleSonKullanmaTarihiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    
    if (value.length > 2) {
      formattedValue = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    
    setSonKullanmaTarihi(formattedValue);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={!!kullaniciId} />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="obilet-container">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Sefer detayı yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Tekrar Dene
              </Button>
            </div>
          ) : sefer ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sol Kolon - Sefer Bilgileri */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Sefer Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Bus className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold">{sefer.firma_adi}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span>{formatTarih(sefer.kalkis_zamani)}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-semibold">{sefer.kalkis_yeri}</p>
                          <p className="text-sm text-gray-500">{formatSaat(sefer.kalkis_zamani)}</p>
                        </div>
                      </div>

                      <div className="border-l-2 border-dashed border-gray-300 h-6 ml-2.5"></div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-semibold">{sefer.varis_yeri}</p>
                          <p className="text-sm text-gray-500">{formatSaat(sefer.varis_zamani)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Seyahat Süresi: {hesaplaSeyahatSuresi(sefer.kalkis_zamani, sefer.varis_zamani)}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-lg font-semibold">
                        Bilet Ücreti: <span className="text-blue-600">{formatCurrency(sefer.ucret)}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sağ Kolon - Koltuk Seçimi veya Ödeme */}
              <div className="md:col-span-2">
                {adimlar === "koltuk_secimi" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Koltuk Seçimi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded mr-2"></div>
                            <span className="text-sm">Dolu</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-white border border-gray-300 rounded mr-2"></div>
                            <span className="text-sm">Boş</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded mr-2"></div>
                            <span className="text-sm">Seçili</span>
                          </div>
                        </div>

                        <div className="border border-gray-300 rounded-lg p-4 bg-white">
                          {/* Otobüs Şoför Kısmı */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium">Şoför</span>
                            </div>
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium">Kapı</span>
                            </div>
                          </div>

                          {/* Koltuklar */}
                          <div className="grid grid-cols-4 gap-2">
                            {koltuklar.map((koltuk) => (
                              <button
                                key={koltuk.koltuk_no}
                                className={`w-full h-12 rounded-md flex items-center justify-center ${
                                  koltuk.durum === "dolu"
                                    ? "bg-gray-200 border border-gray-300 cursor-not-allowed"
                                    : koltuk.durum === "secili"
                                    ? "bg-blue-500 border border-blue-600 text-white"
                                    : "bg-white border border-gray-300 hover:bg-blue-100 hover:border-blue-500"
                                }`}
                                onClick={() => handleKoltukSec(koltuk.koltuk_no)}
                                disabled={koltuk.durum === "dolu"}
                              >
                                <span className="font-medium">{koltuk.koltuk_no}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          {seciliKoltuk && (
                            <p className="text-sm">
                              Seçili Koltuk: <span className="font-semibold">{seciliKoltuk}</span>
                            </p>
                          )}
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={handleOdemeAdimina}
                          disabled={!seciliKoltuk}
                        >
                          Ödeme Adımına Geç
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ödeme Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="kart_sahibi">Kart Sahibi</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input
                                id="kart_sahibi"
                                className="pl-10"
                                placeholder="Ad Soyad"
                                value={kartSahibi}
                                onChange={(e) => setKartSahibi(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="kart_numarasi">Kart Numarası</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input
                                id="kart_numarasi"
                                className="pl-10"
                                placeholder="1234 5678 9012 3456"
                                value={kartNumarasi}
                                onChange={handleKartNumarasiChange}
                                maxLength={19}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="son_kullanma_tarihi">Son Kullanma Tarihi</Label>
                            <Input
                              id="son_kullanma_tarihi"
                              placeholder="AA/YY"
                              value={sonKullanmaTarihi}
                              onChange={handleSonKullanmaTarihiChange}
                              maxLength={5}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                              maxLength={3}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between mb-2">
                            <span>Bilet Ücreti:</span>
                            <span>{formatCurrency(sefer.ucret)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Toplam:</span>
                            <span className="text-blue-600">{formatCurrency(sefer.ucret)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                          <Button
                            variant="outline"
                            onClick={handleKoltukSecimeDon}
                          >
                            Koltuk Seçimine Dön
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleBiletSatinAl}
                            disabled={odemeLoading}
                          >
                            {odemeLoading ? (
                              "İşleniyor..."
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" /> Ödemeyi Tamamla
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

