"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bus, Clock, MapPin, Calendar, Filter, ArrowRight } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchForm from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function SeferlerPage() {
  const searchParams = useSearchParams();
  const kalkisIl = searchParams.get("kalkis_il") || "";
  const varisIl = searchParams.get("varis_il") || "";
  const tarih = searchParams.get("tarih") || format(new Date(), "yyyy-MM-dd");

  const [seferler, setSeferler] = useState<Sefer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSeferler, setFilteredSeferler] = useState<Sefer[]>([]);
  const [siralamaKriteri, setSiralamaKriteri] = useState<string>("kalkis_zamani");
  const [firmaFilter, setFirmaFilter] = useState<string>("tumu");
  const [firmalar, setFirmalar] = useState<string[]>([]);

  // Seferleri yükle
  useEffect(() => {
    const fetchSeferler = async () => {
      if (!kalkisIl || !varisIl || !tarih) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/seferler/ara?kalkis_il=${encodeURIComponent(
            kalkisIl
          )}&varis_il=${encodeURIComponent(varisIl)}&tarih=${encodeURIComponent(
            tarih
          )}`
        );

        if (!response.ok) {
          throw new Error("Seferler yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setSeferler(data);
        setFilteredSeferler(data);

        // Benzersiz firmaları al
        const uniqueFirmalar = [...new Set(data.map((sefer: Sefer) => sefer.firma_adi))];
        setFirmalar(uniqueFirmalar);
      } catch (error: any) {
        setError(error.message || "Seferler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchSeferler();
  }, [kalkisIl, varisIl, tarih]);

  // Filtreleme ve sıralama
  useEffect(() => {
    let filtered = [...seferler];

    // Firma filtreleme
    if (firmaFilter !== "tumu") {
      filtered = filtered.filter((sefer) => sefer.firma_adi === firmaFilter);
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (siralamaKriteri) {
        case "kalkis_zamani":
          return new Date(a.kalkis_zamani).getTime() - new Date(b.kalkis_zamani).getTime();
        case "varis_zamani":
          return new Date(a.varis_zamani).getTime() - new Date(b.varis_zamani).getTime();
        case "ucret_artan":
          return a.ucret - b.ucret;
        case "ucret_azalan":
          return b.ucret - a.ucret;
        default:
          return 0;
      }
    });

    setFilteredSeferler(filtered);
  }, [seferler, siralamaKriteri, firmaFilter]);

  // Tarih formatı
  const formatTarih = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: tr });
  };

  // Saat formatı
  const formatSaat = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  // Seyahat süresi hesaplama
  const hesaplaSeyahatSuresi = (kalkis: string, varis: string) => {
    const kalkisZamani = new Date(kalkis).getTime();
    const varisZamani = new Date(varis).getTime();
    const farkMilisaniye = varisZamani - kalkisZamani;
    
    const saat = Math.floor(farkMilisaniye / (1000 * 60 * 60));
    const dakika = Math.floor((farkMilisaniye % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${saat} sa ${dakika} dk`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={false} />

      <main className="flex-grow">
        {/* Arama Formu Section */}
        <section className="bg-blue-600 text-white py-8">
          <div className="obilet-container">
            <h1 className="text-2xl font-bold mb-6 text-center">
              {kalkisIl} - {varisIl} Otobüs Seferleri
            </h1>
            <SearchForm />
          </div>
        </section>

        {/* Seferler Section */}
        <section className="py-8 bg-gray-50">
          <div className="obilet-container">
            {/* Tarih Bilgisi */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">
                  {formatTarih(tarih)} Seferleri
                </h2>
              </div>

              {/* Filtreleme ve Sıralama */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-500 mr-2" />
                  <Select
                    value={firmaFilter}
                    onValueChange={setFirmaFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Firma Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tumu">Tüm Firmalar</SelectItem>
                      {firmalar.map((firma) => (
                        <SelectItem key={firma} value={firma}>
                          {firma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center">
                  <Select
                    value={siralamaKriteri}
                    onValueChange={setSiralamaKriteri}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kalkis_zamani">Kalkış Saatine Göre</SelectItem>
                      <SelectItem value="varis_zamani">Varış Saatine Göre</SelectItem>
                      <SelectItem value="ucret_artan">Fiyat (Artan)</SelectItem>
                      <SelectItem value="ucret_azalan">Fiyat (Azalan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sonuçlar */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Seferler yükleniyor...</p>
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
            ) : filteredSeferler.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {kalkisIl} - {varisIl} için {formatTarih(tarih)} tarihinde sefer bulunamadı.
                </p>
                <p className="mt-2 text-gray-500">
                  Lütfen farklı bir tarih veya güzergah seçin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSeferler.map((sefer) => (
                  <Card key={sefer.sefer_id} className="obilet-card">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                        {/* Firma Bilgisi */}
                        <div className="p-4 flex flex-col items-center justify-center">
                          <Bus className="h-10 w-10 text-blue-600 mb-2" />
                          <h3 className="font-semibold text-lg">{sefer.firma_adi}</h3>
                          <p className="text-sm text-gray-500">
                            {sefer.bos_koltuk_sayisi} boş koltuk
                          </p>
                        </div>

                        {/* Kalkış Bilgisi */}
                        <div className="p-4 flex flex-col justify-center">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-semibold">{sefer.kalkis_yeri}</p>
                              <p className="text-sm text-gray-500">{kalkisIl}</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-2">
                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="font-semibold">{formatSaat(sefer.kalkis_zamani)}</p>
                          </div>
                        </div>

                        {/* Varış Bilgisi */}
                        <div className="p-4 flex flex-col justify-center">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-semibold">{sefer.varis_yeri}</p>
                              <p className="text-sm text-gray-500">{varisIl}</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-2">
                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="font-semibold">{formatSaat(sefer.varis_zamani)}</p>
                          </div>
                          <div className="flex items-center mt-2">
                            <ArrowRight className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-sm text-gray-500">
                              {hesaplaSeyahatSuresi(sefer.kalkis_zamani, sefer.varis_zamani)}
                            </p>
                          </div>
                        </div>

                        {/* Fiyat ve Bilet Al */}
                        <div className="p-4 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold text-blue-600 mb-2">
                            {sefer.ucret.toFixed(2)} ₺
                          </p>
                          <Link href={`/seferler/${sefer.sefer_id}`}>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                              Koltuk Seç
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

