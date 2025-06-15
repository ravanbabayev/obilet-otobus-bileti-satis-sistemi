"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Form şeması
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-posta adresi gereklidir" })
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
  sifre: z
    .string()
    .min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form tanımı
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      sifre: "",
    },
  });

  // Form gönderimi
  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Giriş yapılırken bir hata oluştu");
      }

      // Başarılı giriş
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz! Ana sayfaya yönlendiriliyorsunuz.",
      });

      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem("user", JSON.stringify(result));

      // Ana sayfaya yönlendir
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Giriş Başarısız",
        description: error.message || "Giriş yapılırken bir hata oluştu",
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
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Giriş Yap
                </CardTitle>
                <CardDescription className="text-center">
                  OBilet hesabınıza giriş yapın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Beni hatırla
                      </Label>
                    </div>
                    <Link
                      href="/sifremi-unuttum"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      "Giriş yapılıyor..."
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> Giriş Yap
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      veya
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Henüz hesabınız yok mu?{" "}
                    <Link
                      href="/kayit"
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Üye Ol
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

