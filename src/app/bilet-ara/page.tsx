"use client";

import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Bilet {
  bilet_id: number;
  yolcu_adi: string;
  tc_kimlik_no: string;
  telefon: string;
  firma_adi: string;
  kalkis_il: string;
  kalkis_istasyon: string;
  varis_il: string;
  varis_istasyon: string;
  kalkis_tarihi: string;
  varis_tarihi: string;
  koltuk_no: number;
  ucret: number;
  bilet_durumu: string;
  satis_yapan_personel: string;
  bilet_tarihi: string;
}

export default function BiletAra() {
  const { toast } = useToast();
  const [aramaKriteri, setAramaKriteri] = useState("");
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const [loading, setLoading] = useState(false);

  const biletAra = async () => {
    if (!aramaKriteri.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen arama kriteri giriniz.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/biletler/ara?kriter=${encodeURIComponent(aramaKriteri)}`);
      const data = await response.json();
      
      if (response.ok) {
        setBiletler(data);
        if (data.length === 0) {
          toast({
            title: "Bilgi",
            description: "Arama kriterinize uygun bilet bulunamadı.",
          });
        }
      } else {
        toast({
          title: "Hata",
          description: data.error || "Biletler aranırken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Biletler aranırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTarih = (tarihStr: string) => {
    const tarih = new Date(tarihStr);
    return tarih.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDurumRenk = (durum: string) => {
    switch (durum) {
      case 'AKTIF':
        return 'text-green-600 bg-green-100';
      case 'IPTAL':
        return 'text-red-600 bg-red-100';
      case 'KULLANILDI':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Bilet Arama</h1>
          
          {/* Arama Formu */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bilet Ara</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="arama">Arama Kriteri</Label>
                  <Input
                    value={aramaKriteri}
                    onChange={(e) => setAramaKriteri(e.target.value)}
                    placeholder="Bilet ID, TC Kimlik No, Telefon veya Ad Soyad"
                    onKeyPress={(e) => e.key === 'Enter' && biletAra()}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Bilet ID, TC kimlik numarası, telefon numarası veya yolcu adı ile arama yapabilirsiniz.
                  </p>
                </div>
                <div className="flex items-end">
                  <Button onClick={biletAra} disabled={loading}>
                    {loading ? "Aranıyor..." : "Ara"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arama Sonuçları */}
          {biletler.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Arama Sonuçları ({biletler.length} bilet bulundu)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biletler.map((bilet) => (
                    <div key={bilet.bilet_id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <h3 className="text-lg font-semibold">Bilet #{bilet.bilet_id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDurumRenk(bilet.bilet_durumu)}`}>
                              {bilet.bilet_durumu}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Yolcu Bilgileri</h4>
                              <p className="text-sm text-gray-600">Ad Soyad: {bilet.yolcu_adi}</p>
                              <p className="text-sm text-gray-600">TC: {bilet.tc_kimlik_no}</p>
                              <p className="text-sm text-gray-600">Telefon: {bilet.telefon}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Sefer Bilgileri</h4>
                              <p className="text-sm text-gray-600">Firma: {bilet.firma_adi}</p>
                              <p className="text-sm text-gray-600">
                                Güzergah: {bilet.kalkis_il} → {bilet.varis_il}
                              </p>
                              <p className="text-sm text-gray-600">
                                Kalkış: {formatTarih(bilet.kalkis_tarihi)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Varış: {formatTarih(bilet.varis_tarihi)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Koltuk: {bilet.koltuk_no}</span>
                              <span>Satış Yapan: {bilet.satis_yapan_personel}</span>
                              <span>Satış Tarihi: {formatTarih(bilet.bilet_tarihi)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-blue-600">{bilet.ucret}₺</p>
                          {bilet.bilet_durumu === 'AKTIF' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.location.href = `/bilet-iptal?bilet_id=${bilet.bilet_id}`}
                            >
                              İptal Et
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

