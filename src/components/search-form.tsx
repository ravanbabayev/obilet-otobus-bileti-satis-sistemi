"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Form şeması
const searchFormSchema = z.object({
  kalkis_il: z.string().min(1, { message: "Kalkış ili seçiniz" }),
  varis_il: z.string().min(1, { message: "Varış ili seçiniz" }),
  tarih: z.string().min(1, { message: "Tarih seçiniz" }),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function SearchForm() {
  const router = useRouter();
  const [iller, setIller] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Form tanımı
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      kalkis_il: "",
      varis_il: "",
      tarih: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // İlleri yükle
  useEffect(() => {
    const fetchIller = async () => {
      try {
        const response = await fetch("/api/istasyonlar");
        const data = await response.json();
        
        // Hata kontrolü
        if (data.error) {
          console.error("API Hatası:", data.error);
          return;
        }
        
        // Data'nın array olduğunu kontrol et
        if (!Array.isArray(data)) {
          console.error("API'den gelen data array değil:", data);
          return;
        }
        
        // Benzersiz illeri al
        const uniqueIller = [...new Set(data.map((istasyon: any) => istasyon.il))];
        setIller(uniqueIller);
      } catch (error) {
        console.error("İller yüklenirken hata oluştu:", error);
      }
    };

    fetchIller();
  }, []);

  // Form gönderimi
  const onSubmit = (data: SearchFormValues) => {
    setLoading(true);
    
    // Sefer arama sayfasına yönlendir
    router.push(
      `/seferler?kalkis_il=${encodeURIComponent(data.kalkis_il)}&varis_il=${encodeURIComponent(
        data.varis_il
      )}&tarih=${encodeURIComponent(data.tarih)}`
    );
  };

  // İzlenen değerler
  const kalkisIl = watch("kalkis_il");
  const varisIl = watch("varis_il");

  // Kalkış ve varış illerini değiştir
  const swapLocations = () => {
    const temp = kalkisIl;
    setValue("kalkis_il", varisIl);
    setValue("varis_il", temp);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kalkış İli */}
            <div className="space-y-2">
              <Label htmlFor="kalkis_il" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                Nereden
              </Label>
              <Select
                onValueChange={(value) => setValue("kalkis_il", value)}
                value={kalkisIl}
              >
                <SelectTrigger id="kalkis_il" className="w-full">
                  <SelectValue placeholder="Kalkış ili seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {iller.map((il) => (
                    <SelectItem key={il} value={il}>
                      {il}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kalkis_il && (
                <p className="text-sm text-red-500">{errors.kalkis_il.message}</p>
              )}
            </div>

            {/* Varış İli */}
            <div className="space-y-2">
              <Label htmlFor="varis_il" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                Nereye
              </Label>
              <Select
                onValueChange={(value) => setValue("varis_il", value)}
                value={varisIl}
              >
                <SelectTrigger id="varis_il" className="w-full">
                  <SelectValue placeholder="Varış ili seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {iller.map((il) => (
                    <SelectItem key={il} value={il}>
                      {il}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.varis_il && (
                <p className="text-sm text-red-500">{errors.varis_il.message}</p>
              )}
            </div>
          </div>

          {/* Yer Değiştirme Butonu */}
          <div className="flex justify-center -mt-3 -mb-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={swapLocations}
            >
              <ArrowRight className="h-4 w-4 rotate-90 text-blue-600" />
            </Button>
          </div>

          {/* Tarih */}
          <div className="space-y-2">
            <Label htmlFor="tarih" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-blue-600" />
              Tarih
            </Label>
            <Input
              id="tarih"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              {...register("tarih")}
            />
            {errors.tarih && (
              <p className="text-sm text-red-500">{errors.tarih.message}</p>
            )}
          </div>

          {/* Arama Butonu */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            disabled={loading}
          >
            {loading ? "Aranıyor..." : "Otobüs Bileti Bul"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

