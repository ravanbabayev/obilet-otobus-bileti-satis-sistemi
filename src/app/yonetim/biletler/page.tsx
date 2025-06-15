"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Bilet {
  bilet_id: number;
  musteri_id: number;
  sefer_id: number;
  koltuk_no: number;
  bilet_tarihi: string;
  bilet_saati: string;
  bilet_durumu: 'AKTIF' | 'IPTAL' | 'KULLANILDI';
  ucret: number;
  satis_yapan_personel: string;
  notlar: string;
  musteri_ad: string;
  musteri_soyad: string;
  tc_kimlik_no: string;
  musteri_telefon: string;
  musteri_email: string;
  kalkis_tarihi: string;
  kalkis_saati: string;
  varis_tarihi: string;
  varis_saati: string;
  plaka: string;
  firma_adi: string;
  kalkis_istasyon: string;
  kalkis_il: string;
  kalkis_ilce: string;
  varis_istasyon: string;
  varis_il: string;
  varis_ilce: string;
  odeme_turu?: string;
  odeme_durum?: string;
}

interface Firma {
  firma_id: number;
  firma_adi: string;
}

export default function BiletYonetimi() {
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDurum, setSelectedDurum] = useState('TUMU');
  const [selectedFirma, setSelectedFirma] = useState('TUMU');
  const [selectedTarih, setSelectedTarih] = useState('');
  
  // Modal state'leri
  const [selectedBilet, setSelectedBilet] = useState<Bilet | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    notlar: '',
    koltuk_no: ''
  });

  // Bilet listesini getir
  const fetchBiletler = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        durum: selectedDurum,
        firma_id: selectedFirma,
        tarih: selectedTarih
      });

      const response = await fetch(`/api/biletler?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBiletler(Array.isArray(data) ? data : []);
      } else {
        console.error('Bilet listesi alınamadı:', data.error);
        setBiletler([]);
      }
    } catch (error) {
      console.error('Bilet listesi yüklenirken hata:', error);
      setBiletler([]);
    } finally {
      setLoading(false);
    }
  };

  // Firmaları getir
  const fetchFirmalar = async () => {
    try {
      const response = await fetch('/api/firmalar');
      const data = await response.json();
      if (response.ok) {
        setFirmalar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error);
    }
  };

  // Bilet detayını modal'da aç
  const openDetailModal = async (bilet: Bilet) => {
    try {
      setDetailLoading(bilet.bilet_id);
      const response = await fetch(`/api/biletler/${bilet.bilet_id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedBilet(data);
        setIsDetailModalOpen(true);
      } else {
        alert('Bilet detayı alınamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Bilet detayı yüklenirken hata:', error);
      alert('Bilet detayı yüklenirken hata oluştu');
    } finally {
      setDetailLoading(null);
    }
  };

  // Edit modal'ı aç
  const openEditModal = (bilet: Bilet) => {
    setSelectedBilet(bilet);
    setEditForm({
      notlar: bilet.notlar || '',
      koltuk_no: bilet.koltuk_no.toString()
    });
    setIsEditModalOpen(true);
  };

  // Bilet güncelle
  const handleUpdateBilet = async () => {
    if (!selectedBilet) return;

    try {
      const response = await fetch(`/api/biletler/${selectedBilet.bilet_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notlar: editForm.notlar,
          koltuk_no: editForm.koltuk_no ? parseInt(editForm.koltuk_no) : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bilet başarıyla güncellendi');
        setIsEditModalOpen(false);
        fetchBiletler();
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Bilet güncellenirken hata:', error);
      alert('Bilet güncellenirken hata oluştu');
    }
  };

  // Bilet iptal et
  const handleCancelBilet = async (biletId: number) => {
    if (!confirm('Bu bileti iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/biletler/${biletId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bilet başarıyla iptal edildi');
        fetchBiletler();
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Bilet iptal edilirken hata:', error);
      alert('Bilet iptal edilirken hata oluştu');
    }
  };

  // Bilet durumu badge rengi
  const getDurumBadgeVariant = (durum: string) => {
    switch (durum) {
      case 'AKTIF':
        return 'default';
      case 'KULLANILDI':
        return 'secondary';
      case 'IPTAL':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Bilet durumu ikonu
  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'AKTIF':
        return <CheckCircle className="h-4 w-4" />;
      case 'KULLANILDI':
        return <Eye className="h-4 w-4" />;
      case 'IPTAL':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchBiletler();
    fetchFirmalar();
  }, [searchTerm, selectedDurum, selectedFirma, selectedTarih]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/yonetim">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Yönetim Paneli
                </Button>
              </Link>
              <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bilet Yönetimi</h1>
                <p className="text-sm text-gray-500">Satılan biletleri görüntüle ve yönet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchBiletler}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <Link href="/bilet-sat">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Bilet Sat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreleme ve Arama */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Filtreleme ve Arama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Genel Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="İsim, TC, telefon, plaka..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Durum */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bilet Durumu</label>
                <Select value={selectedDurum} onValueChange={setSelectedDurum}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tümü</SelectItem>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="KULLANILDI">Kullanıldı</SelectItem>
                    <SelectItem value="IPTAL">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Firma */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Firma</label>
                <Select value={selectedFirma} onValueChange={setSelectedFirma}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tüm Firmalar</SelectItem>
                    {firmalar.map((firma) => (
                      <SelectItem key={firma.firma_id} value={firma.firma_id.toString()}>
                        {firma.firma_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tarih */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bilet Tarihi</label>
                <Input
                  type="date"
                  value={selectedTarih}
                  onChange={(e) => setSelectedTarih(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bilet Listesi */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Bilet Listesi ({loading ? '...' : biletler.length} bilet)
              </CardTitle>
              {biletler.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Excel'e Aktar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Biletler yükleniyor...</p>
              </div>
            ) : biletler.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Henüz bilet bulunamadı</p>
                <p className="text-sm text-gray-500">Filtreleri değiştirerek tekrar deneyin</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Bilet No</th>
                      <th className="text-left p-3 font-semibold">Müşteri</th>
                      <th className="text-left p-3 font-semibold">Güzergah</th>
                      <th className="text-left p-3 font-semibold">Tarih/Saat</th>
                      <th className="text-left p-3 font-semibold">Koltuk</th>
                      <th className="text-left p-3 font-semibold">Firma/Plaka</th>
                      <th className="text-left p-3 font-semibold">Ücret</th>
                      <th className="text-left p-3 font-semibold">Durum</th>
                      <th className="text-left p-3 font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biletler.map((bilet) => (
                      <tr key={bilet.bilet_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-semibold text-purple-600">#{bilet.bilet_id}</div>
                          <div className="text-xs text-gray-500">
                            {bilet.bilet_tarihi} {bilet.bilet_saati}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{bilet.musteri_ad} {bilet.musteri_soyad}</div>
                          <div className="text-sm text-gray-600">{bilet.tc_kimlik_no}</div>
                          <div className="text-xs text-gray-500">{bilet.musteri_telefon}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{bilet.kalkis_il}</span>
                            <span>→</span>
                            <span>{bilet.varis_il}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {bilet.kalkis_istasyon} → {bilet.varis_istasyon}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{bilet.kalkis_tarihi}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{bilet.kalkis_saati}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono">
                            {bilet.koltuk_no}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-sm">{bilet.firma_adi}</div>
                          <div className="text-xs text-gray-500 font-mono">{bilet.plaka}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-green-600">
                            ₺{Number(bilet.ucret).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </div>
                          {bilet.odeme_turu && (
                            <div className="text-xs text-gray-500">{bilet.odeme_turu}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={getDurumBadgeVariant(bilet.bilet_durumu)}
                            className="flex items-center space-x-1"
                          >
                            {getDurumIcon(bilet.bilet_durumu)}
                            <span>{bilet.bilet_durumu}</span>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailModal(bilet)}
                              disabled={detailLoading === bilet.bilet_id}
                            >
                              {detailLoading === bilet.bilet_id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {bilet.bilet_durumu === 'AKTIF' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(bilet)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBilet(bilet.bilet_id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Bilet Detay Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bilet Detayları - #{selectedBilet?.bilet_id}</DialogTitle>
          </DialogHeader>
          
          {selectedBilet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                    <p className="font-semibold">{selectedBilet.musteri_ad} {selectedBilet.musteri_soyad}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">TC Kimlik No</label>
                    <p className="font-mono">{selectedBilet.tc_kimlik_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p>{selectedBilet.musteri_telefon}</p>
                  </div>
                  {selectedBilet.musteri_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">E-posta</label>
                      <p>{selectedBilet.musteri_email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sefer Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Sefer Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Güzergah</label>
                    <p className="font-semibold">{selectedBilet.kalkis_il} → {selectedBilet.varis_il}</p>
                    <p className="text-sm text-gray-600">{selectedBilet.kalkis_istasyon} → {selectedBilet.varis_istasyon}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kalkış</label>
                      <p>{selectedBilet.kalkis_tarihi} {selectedBilet.kalkis_saati}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Varış</label>
                      <p>{selectedBilet.varis_tarihi} {selectedBilet.varis_saati}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Firma & Araç</label>
                    <p className="font-semibold">{selectedBilet.firma_adi}</p>
                    <p className="text-sm text-gray-600 font-mono">{selectedBilet.plaka}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Koltuk No</label>
                    <p className="font-mono text-lg">{selectedBilet.koltuk_no}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bilet Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bilet Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bilet Durumu</label>
                    <div>
                      <Badge variant={getDurumBadgeVariant(selectedBilet.bilet_durumu)} className="flex items-center space-x-1 w-fit">
                        {getDurumIcon(selectedBilet.bilet_durumu)}
                        <span>{selectedBilet.bilet_durumu}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ücret</label>
                    <p className="text-2xl font-bold text-green-600">
                      ₺{Number(selectedBilet.ucret).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Satış Tarihi</label>
                    <p>{selectedBilet.bilet_tarihi} {selectedBilet.bilet_saati}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Satış Yapan</label>
                    <p>{selectedBilet.satis_yapan_personel}</p>
                  </div>
                  {selectedBilet.odeme_turu && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ödeme Türü</label>
                      <p>{selectedBilet.odeme_turu}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notlar */}
              {selectedBilet.notlar && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedBilet.notlar}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bilet Düzenleme Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bilet Düzenle - #{selectedBilet?.bilet_id}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Koltuk Numarası</label>
              <Input
                type="number"
                value={editForm.koltuk_no}
                onChange={(e) => setEditForm({...editForm, koltuk_no: e.target.value})}
                placeholder="Koltuk numarası"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notlar</label>
              <Textarea
                value={editForm.notlar}
                onChange={(e) => setEditForm({...editForm, notlar: e.target.value})}
                placeholder="Bilet notları..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                İptal
              </Button>
              <Button onClick={handleUpdateBilet}>
                Güncelle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 