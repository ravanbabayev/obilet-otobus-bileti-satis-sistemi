"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { User, Mail, Phone, Calendar, MapPin, Bus, Clock, Ticket, LogOut, Edit, X } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Kullanici {
  kullanici_id: number;
  ad: string;
  soyad: string;
  tc_kimlik_no: string;
  dogum_tarihi: string;
  cinsiyet: string;
  telefon: string;
  email: string;
}

interface Bilet {
  bilet_id: number;
  sefer_id: number;
  firma_adi: string;
  kalkis_yeri: string;
  varis_yeri: string;
  kalkis_zamani: string;
  varis_zamani: string;
  koltuk_no: number;
  ucret: number;
  durum: string;
  satin_alma_tarihi: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iptalLoading, setIptalLoading] = useState<number | null>(null);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/giris");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setKullanici(user);
      fetchBiletler(user.kullanici_id);
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      router.push("/giris");
    }
  }, [router]);

  // Biletleri yükle
  const fetchBiletler = async (kullaniciId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kullanicilar/${kullaniciId}/biletler`);

      if (!response.ok) {
        throw new Error("Biletler yüklenirken bir hata oluştu");
      }

      const data = await response.json();
      setBiletler(data);
    } catch (error: any) {
      setError(error.message || "Biletler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
    router.push("/");
  };

  // Bilet iptal et
  const handleBiletIptal = async (biletId: number) => {
    if (!window.confirm("Bu bileti iptal etmek istediğinizden emin misiniz?")) {
      return;
    }

    setIptalLoading(biletId);

    try {
      const response = await fetch(`/api/biletler/${biletId}/iptal`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bilet iptal edilemedi");
      }

      // Başarılı iptal
      toast({
        title: "Bilet İptal Edildi",
        description: "Biletiniz başarıyla iptal edildi.",
      });

      // Biletleri yeniden yükle
      if (kullanici) {
        fetchBiletler(kullanici.kullanici_id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "İptal Başarısız",
        description: error.message || "Bilet iptal edilemedi. Lütfen tekrar deneyin.",
      });
    } finally {
      setIptalLoading(null);
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

  // Cinsiyet formatı
  const formatCinsiyet = (cinsiyet: string) => {
    return cinsiyet === "E" ? "Erkek" : "Kadın";
  };

  // Bilet durumu formatı
  const formatBiletDurumu = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "Aktif";
      case "iptal":
        return "İptal Edildi";
      case "kullanildi":
        return "Kullanıldı";
      default:
        return durum;
    }
  };

  // Bilet durumu rengi
  const getBiletDurumuRengi = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "text-green-600";
      case "iptal":
        return "text-red-600";
      case "kullanildi":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={true} userName={kullanici ? `${kullanici.ad} ${kullanici.soyad}` : undefined} onLogout={handleLogout} />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="obilet-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sol Kolon - Kullanıcı Bilgileri */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>Kişisel bilgileriniz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {kullanici ? (
                    <>
                      <div className="flex items-center justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-3xl">
                            {kullanici.ad.charAt(0)}{kullanici.soyad.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Ad Soyad</p>
                            <p className="font-medium">{kullanici.ad} {kullanici.soyad}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">E-posta</p>
                            <p className="font-medium">{kullanici.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Telefon</p>
                            <p className="font-medium">{kullanici.telefon}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Doğum Tarihi</p>
                            <p className="font-medium">{formatTarih(kullanici.dogum_tarihi)}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Cinsiyet</p>
                            <p className="font-medium">{formatCinsiyet(kullanici.cinsiyet)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : loading ? (
                    <div className="text-center py-4">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-2 text-gray-600">Bilgiler yükleniyor...</p>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Kullanıcı bilgileri bulunamadı</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sağ Kolon - Biletler */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Biletlerim</CardTitle>
                  <CardDescription>Satın aldığınız biletler</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-4 text-gray-600">Biletler yükleniyor...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-500">{error}</p>
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => kullanici && fetchBiletler(kullanici.kullanici_id)}
                      >
                        Tekrar Dene
                      </Button>
                    </div>
                  ) : biletler.length === 0 ? (
                    <div className="text-center py-12">
                      <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Henüz bilet satın almadınız.</p>
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push("/")}
                      >
                        Bilet Ara
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {biletler.map((bilet) => (
                        <Card key={bilet.bilet_id} className="obilet-card">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center">
                                <Bus className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="font-semibold">{bilet.firma_adi}</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getBiletDurumuRengi(bilet.durum)} bg-opacity-10`}>
                                {formatBiletDurumu(bilet.durum)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-500">Kalkış</p>
                                    <p className="font-medium">{bilet.kalkis_yeri}</p>
                                    <p className="text-sm">{formatTarih(bilet.kalkis_zamani)} - {formatSaat(bilet.kalkis_zamani)}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-500">Varış</p>
                                    <p className="font-medium">{bilet.varis_yeri}</p>
                                    <p className="text-sm">{formatTarih(bilet.varis_zamani)} - {formatSaat(bilet.varis_zamani)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200">
                              <div className="space-y-1 mb-2 md:mb-0">
                                <p className="text-sm text-gray-500">Koltuk No</p>
                                <p className="font-medium">{bilet.koltuk_no}</p>
                              </div>

                              <div className="space-y-1 mb-2 md:mb-0">
                                <p className="text-sm text-gray-500">Satın Alma Tarihi</p>
                                <p className="font-medium">{formatTarih(bilet.satin_alma_tarihi)}</p>
                              </div>

                              <div className="space-y-1 mb-2 md:mb-0">
                                <p className="text-sm text-gray-500">Ücret</p>
                                <p className="font-medium text-blue-600">{formatCurrency(bilet.ucret)}</p>
                              </div>

                              {bilet.durum === "aktif" && (
                                <Button
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleBiletIptal(bilet.bilet_id)}
                                  disabled={iptalLoading === bilet.bilet_id}
                                >
                                  {iptalLoading === bilet.bilet_id ? (
                                    "İptal Ediliyor..."
                                  ) : (
                                    <>
                                      <X className="mr-2 h-4 w-4" /> İptal Et
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

