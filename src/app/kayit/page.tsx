"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { validateTCKN } from "@/lib/utils";

// Form şeması
const registerFormSchema = z.object({
  ad: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  soyad: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  tc_kimlik_no: z
    .string()
    .length(11, { message: "TC Kimlik No 11 karakter olmalıdır" })
    .refine((val) => /^\d+$/.test(val), {
      message: "TC Kimlik No sadece rakamlardan oluşmalıdır",
    })
    .refine((val) => validateTCKN(val), {
      message: "Geçerli bir TC Kimlik No giriniz",
    }),
  dogum_tarihi: z.string().min(1, { message: "Doğum tarihi gereklidir" }),
  cinsiyet: z.enum(["E", "K"], {
    required_error: "Cinsiyet seçiniz",
  }),
  telefon: z
    .string()
    .min(10, { message: "Telefon numarası en az 10 karakter olmalıdır" })
    .max(15, { message: "Telefon numarası en fazla 15 karakter olmalıdır" }),
  email: z
    .string()
    .min(1, { message: "E-posta adresi gereklidir" })
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
  sifre: z
    .string()
    .min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  sifre_tekrar: z
    .string()
    .min(6, { message: "Şifre tekrarı en az 6 karakter olmalıdır" }),
}).refine((data) => data.sifre === data.sifre_tekrar, {
  message: "Şifreler eşleşmiyor",
  path: ["sifre_tekrar"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form tanımı
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      tc_kimlik_no: "",
      dogum_tarihi: "",
      cinsiyet: "E",
      telefon: "",
      email: "",
      sifre: "",
      sifre_tekrar: "",
    },
  });

  // Form gönderimi
  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kayıt olurken bir hata oluştu");
      }

      // Başarılı kayıt
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.",
      });

      // Giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/giris");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Kayıt Başarısız",
        description: error.message || "Kayıt olurken bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={false} />

      <main className="flex-grow py-12 bg-gray-50">
        <div className="obilet-container">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Üye Ol
                </CardTitle>
                <CardDescription className="text-center">
                  OBilet'e üye olarak biletlerinizi kolayca yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ad */}
                    <div className="space-y-2">
                      <Label htmlFor="ad">Ad</Label>
                      <Input
                        id="ad"
                        type="text"
                        placeholder="Adınız"
                        {...register("ad")}
                      />
                      {errors.ad && (
                        <p className="text-sm text-red-500">{errors.ad.message}</p>
                      )}
                    </div>

                    {/* Soyad */}
                    <div className="space-y-2">
                      <Label htmlFor="soyad">Soyad</Label>
                      <Input
                        id="soyad"
                        type="text"
                        placeholder="Soyadınız"
                        {...register("soyad")}
                      />
                      {errors.soyad && (
                        <p className="text-sm text-red-500">{errors.soyad.message}</p>
                      )}
                    </div>

                    {/* TC Kimlik No */}
                    <div className="space-y-2">
                      <Label htmlFor="tc_kimlik_no">TC Kimlik No</Label>
                      <Input
                        id="tc_kimlik_no"
                        type="text"
                        placeholder="11 haneli TC Kimlik No"
                        maxLength={11}
                        {...register("tc_kimlik_no")}
                      />
                      {errors.tc_kimlik_no && (
                        <p className="text-sm text-red-500">{errors.tc_kimlik_no.message}</p>
                      )}
                    </div>

                    {/* Doğum Tarihi */}
                    <div className="space-y-2">
                      <Label htmlFor="dogum_tarihi">Doğum Tarihi</Label>
                      <Input
                        id="dogum_tarihi"
                        type="date"
                        {...register("dogum_tarihi")}
                      />
                      {errors.dogum_tarihi && (
                        <p className="text-sm text-red-500">{errors.dogum_tarihi.message}</p>
                      )}
                    </div>

                    {/* Cinsiyet */}
                    <div className="space-y-2">
                      <Label htmlFor="cinsiyet">Cinsiyet</Label>
                      <Select
                        onValueChange={(value) => setValue("cinsiyet", value as "E" | "K")}
                        defaultValue="E"
                      >
                        <SelectTrigger id="cinsiyet">
                          <SelectValue placeholder="Cinsiyet seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="E">Erkek</SelectItem>
                          <SelectItem value="K">Kadın</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.cinsiyet && (
                        <p className="text-sm text-red-500">{errors.cinsiyet.message}</p>
                      )}
                    </div>

                    {/* Telefon */}
                    <div className="space-y-2">
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        {...register("telefon")}
                      />
                      {errors.telefon && (
                        <p className="text-sm text-red-500">{errors.telefon.message}</p>
                      )}
                    </div>

                    {/* E-posta */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">E-posta Adresi</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Şifre */}
                    <div className="space-y-2">
                      <Label htmlFor="sifre">Şifre</Label>
                      <div className="relative">
                        <Input
                          id="sifre"
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          {...register("sifre")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.sifre && (
                        <p className="text-sm text-red-500">{errors.sifre.message}</p>
                      )}
                    </div>

                    {/* Şifre Tekrar */}
                    <div className="space-y-2">
                      <Label htmlFor="sifre_tekrar">Şifre Tekrar</Label>
                      <div className="relative">
                        <Input
                          id="sifre_tekrar"
                          type={showPasswordConfirm ? "text" : "password"}
                          placeholder="******"
                          {...register("sifre_tekrar")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                          {showPasswordConfirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.sifre_tekrar && (
                        <p className="text-sm text-red-500">{errors.sifre_tekrar.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      <span className="text-gray-700">
                        <Link
                          href="/kullanim-kosullari"
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                        >
                          Kullanım Koşulları
                        </Link>
                        {" "}ve{" "}
                        <Link
                          href="/gizlilik-politikasi"
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                        >
                          Gizlilik Politikası
                        </Link>
                        'nı okudum ve kabul ediyorum.
                      </span>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      "Kayıt yapılıyor..."
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> Üye Ol
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/giris"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Giriş Yap
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

