import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx ve tailwind-merge kullanarak sınıfları birleştiren yardımcı fonksiyon
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tarih formatını düzenleyen yardımcı fonksiyon
export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Saat formatını düzenleyen yardımcı fonksiyon
export function formatTime(date: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Para formatını düzenleyen yardımcı fonksiyon
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(numAmount);
}

// TC Kimlik numarası doğrulama fonksiyonu
export function validateTCKN(tckn: string): boolean {
  if (!tckn || tckn.length !== 11) return false;
  
  // Tüm karakterlerin rakam olduğunu kontrol et
  if (!/^\d{11}$/.test(tckn)) return false;
  
  // İlk rakam 0 olamaz
  if (tckn[0] === "0") return false;
  
  // Algoritma kontrolü
  let odd = 0;
  let even = 0;
  let sum = 0;
  
  for (let i = 0; i < 9; i += 2) {
    odd += parseInt(tckn[i]);
  }
  
  for (let i = 1; i < 9; i += 2) {
    even += parseInt(tckn[i]);
  }
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(tckn[i]);
  }
  
  const c10 = (odd * 7 - even) % 10;
  const c11 = sum % 10;
  
  return c10 === parseInt(tckn[9]) && c11 === parseInt(tckn[10]);
}

// Kredi kartı numarası formatını düzenleyen yardımcı fonksiyon
export function formatCreditCardNumber(value: string): string {
  if (!value) return "";
  
  // Sadece rakamları al
  const v = value.replace(/\D/g, "");
  
  // 16 karakterden fazlasını kes
  const cardNumber = v.substring(0, 16);
  
  // 4'lü gruplar halinde formatla
  const parts = [];
  for (let i = 0; i < cardNumber.length; i += 4) {
    parts.push(cardNumber.substring(i, i + 4));
  }
  
  return parts.join(" ");
}

// Kredi kartı son kullanma tarihini formatla
export function formatExpiryDate(value: string): string {
  if (!value) return "";
  
  // Sadece rakamları al
  const v = value.replace(/\D/g, "");
  
  // 4 karakterden fazlasını kes
  const expiry = v.substring(0, 4);
  
  // Ay ve yıl olarak formatla
  if (expiry.length > 2) {
    return `${expiry.substring(0, 2)}/${expiry.substring(2)}`;
  }
  
  return expiry;
}

// Rastgele ID oluşturan yardımcı fonksiyon
export function generateId(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

