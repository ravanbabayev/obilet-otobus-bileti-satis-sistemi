'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, Menu, X, Bus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const isLoggedIn = !!user;
  const userName = user ? `${user.ad} ${user.soyad}` : '';

  // Kullanıcı durumunu kontrol et
  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Kullanıcı verisi okunamadı:', error);
          localStorage.removeItem('user');
        }
      }
    };

    checkUser();

    // Storage event listener (farklı tab'larda logout durumu için)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bus className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-red-600">OBilet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/seferler" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Seferler
            </Link>
            <Link 
              href="/hakkimizda" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Hakkımızda
            </Link>
            <Link 
              href="/iletisim" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              İletişim
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{userName}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profilim
                    </Link>
                    <Link
                      href="/biletlerim"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Biletlerim
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/giris"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/seferler" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Seferler
              </Link>
              <Link 
                href="/hakkimizda" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/iletisim" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 