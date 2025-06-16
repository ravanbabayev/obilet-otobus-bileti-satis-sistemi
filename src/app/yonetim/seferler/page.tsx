"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Sefer {
  sefer_id: number;
  kalkis_tarihi: string;
  kalkis_saati: string;
  varis_tarihi: string;
  varis_saati: string;
  fiyat: number;
  aktif_mi: boolean;
  sefer_durumu: string;
  created_at: string;
  updated_at: string;
  plaka: string;
  koltuk_sayisi: number;
  firma_adi: string;
  kalkis_il: string;
  kalkis_ilce: string;
  varis_il: string;
  varis_ilce: string;
  satilan_koltuk: number;
  bos_koltuk: number;
  otobus_id?: number;
  kalkis_istasyon_id?: number;
  varis_istasyon_id?: number;
}

interface Firma {
  firma_id: number;
  firma_adi: string;
}

interface Otobus {
  otobus_id: number;
  plaka: string;
  koltuk_sayisi: number;
  firma_id: number;
  firma_adi: string;
}

interface Istasyon {
  istasyon_id: number;
  istasyon_adi: string;
  il: string;
  ilce: string;
}

export default function SeferYonetimi() {
  const [seferler, setSeferler] = useState<Sefer[]>([]);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [otobusler, setOtobusler] = useState<Otobus[]>([]);
  const [istasyonlar, setIstasyonlar] = useState<Istasyon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [durumFilter, setDurumFilter] = useState("TUMU");
  const [firmaFilter, setFirmaFilter] = useState("TUMU");
  const [tarihFilter, setTarihFilter] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSefer, setSelectedSefer] = useState<Sefer | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    otobus_id: "",
    kalkis_istasyon_id: "",
    varis_istasyon_id: "",
    kalkis_tarihi: "",
    kalkis_saati: "",
    varis_tarihi: "",
    varis_saati: "",
    fiyat: ""
  });

  // Seferleri yükle
  const loadSeferler = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        durum: durumFilter,
        firma_id: firmaFilter,
        tarih: tarihFilter
      });
      
      const response = await fetch(`/api/seferler?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSeferler(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Seferler yüklenirken hata:', error);
      setSeferler([]);
    } finally {
      setLoading(false);
    }
  };

  // Firmaları yükle
  const loadFirmalar = async () => {
    try {
      const response = await fetch('/api/firmalar?durum=AKTIF');
      if (response.ok) {
        const data = await response.json();
        setFirmalar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error);
      setFirmalar([]);
    }
  };

  // Otobüsleri yükle
  const loadOtobusler = async (firma_id?: string) => {
    try {
      const params = firma_id ? `?firma_id=${firma_id}` : '';
      const response = await fetch(`/api/otobusler${params}`);
      if (response.ok) {
        const data = await response.json();
        setOtobusler(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Otobüsler yüklenirken hata:', error);
      setOtobusler([]);
    }
  };

  // İstasyonları yükle
  const loadIstasyonlar = async () => {
    try {
      const response = await fetch('/api/istasyonlar');
      if (response.ok) {
        const data = await response.json();
        setIstasyonlar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('İstasyonlar yüklenirken hata:', error);
      setIstasyonlar([]);
    }
  };

  useEffect(() => {
    loadSeferler();
  }, [searchTerm, durumFilter, firmaFilter, tarihFilter]);

  useEffect(() => {
    loadFirmalar();
    loadOtobusler();
    loadIstasyonlar();
  }, []);

  // Form temizle
  const clearForm = () => {
    setFormData({
      otobus_id: "",
      kalkis_istasyon_id: "",
      varis_istasyon_id: "",
      kalkis_tarihi: "",
      kalkis_saati: "",
      varis_tarihi: "",
      varis_saati: "",
      fiyat: ""
    });
  };

  // Sefer ekle
  const handleAddSefer = async () => {
    try {
      const response = await fetch('/api/seferler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          otobus_id: parseInt(formData.otobus_id),
          kalkis_istasyon_id: parseInt(formData.kalkis_istasyon_id),
          varis_istasyon_id: parseInt(formData.varis_istasyon_id),
          fiyat: parseFloat(formData.fiyat)
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Sefer başarıyla eklendi!');
        setShowAddModal(false);
        clearForm();
        loadSeferler();
      } else {
        alert(result.error || 'Sefer eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Sefer ekleme hatası:', error);
      alert('Sefer eklenirken hata oluştu');
    }
  };

  // Sefer güncelle
  const handleUpdateSefer = async () => {
    if (!selectedSefer) return;

    try {
      const response = await fetch(`/api/seferler/${selectedSefer.sefer_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          otobus_id: parseInt(formData.otobus_id),
          kalkis_istasyon_id: parseInt(formData.kalkis_istasyon_id),
          varis_istasyon_id: parseInt(formData.varis_istasyon_id),
          fiyat: parseFloat(formData.fiyat)
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Sefer başarıyla güncellendi!');
        setShowEditModal(false);
        clearForm();
        setSelectedSefer(null);
        loadSeferler();
      } else {
        alert(result.error || 'Sefer güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Sefer güncelleme hatası:', error);
      alert('Sefer güncellenirken hata oluştu');
    }
  };

  // Sefer sil
  const handleDeleteSefer = async () => {
    if (!selectedSefer) return;

    try {
      const response = await fetch(`/api/seferler/${selectedSefer.sefer_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Sefer başarıyla silindi!');
        setShowDeleteModal(false);
        setSelectedSefer(null);
        loadSeferler();
      } else {
        alert(result.error || 'Sefer silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Sefer silme hatası:', error);
      alert('Sefer silinirken hata oluştu');
    }
  };

  // Edit modal açmak için
  const openEditModal = async (sefer: Sefer) => {
    try {
      setEditLoading(true);
      console.log('Edit modal açılıyor, sefer:', sefer);
      
      // Sefer detayını API'dan al (ID'ler dahil)
      const response = await fetch(`/api/seferler/${sefer.sefer_id}`);
      if (response.ok) {
        const detailedSefer = await response.json();
        console.log('Detaylı sefer verisi:', detailedSefer);
        
        setSelectedSefer(detailedSefer);
        const formDataToSet = {
          otobus_id: detailedSefer.otobus_id?.toString() || "",
          kalkis_istasyon_id: detailedSefer.kalkis_istasyon_id?.toString() || "",
          varis_istasyon_id: detailedSefer.varis_istasyon_id?.toString() || "",
          kalkis_tarihi: detailedSefer.kalkis_tarihi_date ? new Date(detailedSefer.kalkis_tarihi_date).toISOString().split('T')[0] : "",
          kalkis_saati: detailedSefer.kalkis_saati ? detailedSefer.kalkis_saati.substring(0, 5) : "",
          varis_tarihi: detailedSefer.varis_tarihi_date ? new Date(detailedSefer.varis_tarihi_date).toISOString().split('T')[0] : "",
          varis_saati: detailedSefer.varis_saati ? detailedSefer.varis_saati.substring(0, 5) : "",
          fiyat: detailedSefer.fiyat?.toString() || ""
        };
        console.log('Form verisi ayarlanıyor:', formDataToSet);
        setFormData(formDataToSet);
        setShowEditModal(true);
      } else {
        alert('Sefer detayları yüklenemedi');
      }
    } catch (error) {
      console.error('Sefer detayı yüklenirken hata:', error);
      alert('Sefer detayları yüklenemedi');
    } finally {
      setEditLoading(false);
    }
  };

  // Detail modal açmak için
  const openDetailModal = async (sefer: Sefer) => {
    try {
      const response = await fetch(`/api/seferler/${sefer.sefer_id}`);
      if (response.ok) {
        const detailedSefer = await response.json();
        setSelectedSefer(detailedSefer);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Sefer detayı yüklenirken hata:', error);
    }
  };

  // Tarih ve saat formatlama
  const formatDate = (date: string) => {
    if (!date) return '--/--/----';
    try {
      return new Date(date).toLocaleDateString('tr-TR');
    } catch {
      return '--/--/----';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:MM formatına çevir
  };

  const getSeferDurumBadge = (sefer: Sefer) => {
    const durum = sefer.sefer_durumu || calculateSeferDurumu(sefer);
    switch(durum) {
      case 'TAMAMLANDI':
        return <Badge className="bg-gray-500 text-white">Tamamlandı</Badge>;
      case 'DEVAM_EDIYOR':
        return <Badge className="bg-yellow-500 text-white">Devam Ediyor</Badge>;
      case 'BEKLEMEDE':
        return <Badge className="bg-blue-500 text-white">Beklemede</Badge>;
      case 'PASIF':
        return <Badge className="bg-red-500 text-white">Pasif</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white">Bilinmiyor</Badge>;
    }
  };

  const calculateSeferDurumu = (sefer: Sefer) => {
    const now = new Date();
    const kalkisDateTime = new Date(sefer.kalkis_tarihi);
    const varisDateTime = new Date(sefer.varis_tarihi);
    
    if (varisDateTime < now) return 'TAMAMLANDI';
    if (kalkisDateTime <= now && varisDateTime > now) return 'DEVAM_EDIYOR';
    if (!sefer.aktif_mi) return 'PASIF';
    return 'BEKLEMEDE';
  };

  const canEditOrDelete = (sefer: Sefer) => {
    const durum = sefer.sefer_durumu || calculateSeferDurumu(sefer);
    return durum === 'BEKLEMEDE';
  };

  // Bugünün tarihi (input için)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Bus className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sefer Yönetimi</h1>
                <p className="text-sm text-gray-500">Seferleri ekle, düzenle ve yönet</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sefer
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Firma adı, plaka, güzergah ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={durumFilter} onValueChange={setDurumFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tümü</SelectItem>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={firmaFilter} onValueChange={setFirmaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Firma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tüm Firmalar</SelectItem>
                    {firmalar && firmalar.map((firma) => (
                      <SelectItem key={firma.firma_id} value={firma.firma_id.toString()}>
                        {firma.firma_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  value={tarihFilter}
                  onChange={(e) => setTarihFilter(e.target.value)}
                  placeholder="Tarih filtresi"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sefer Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Sefer Listesi ({seferler.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : seferler.length === 0 ? (
              <div className="text-center py-8">
                <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Sefer bulunamadı</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {seferler.map((sefer) => (
                  <div 
                    key={sefer.sefer_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {sefer.kalkis_il} → {sefer.varis_il}
                          </h3>
                          {getSeferDurumBadge(sefer)}
                          <Badge variant="outline">
                            {sefer.firma_adi}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDate(sefer.kalkis_tarihi)} {formatTime(sefer.kalkis_saati)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{sefer.plaka}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {sefer.satilan_koltuk}/{sefer.koltuk_sayisi} koltuk
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-green-600">
                            ₺{sefer.fiyat}
                          </span>
                          <span>
                            Boş: {sefer.bos_koltuk} koltuk
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(sefer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEditOrDelete(sefer) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(sefer)}
                              disabled={editLoading}
                            >
                              {editLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSefer(sefer);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Sefer Ekleme Modalı */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Sefer Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Otobüs</label>
              <Select value={formData.otobus_id} onValueChange={(value) => setFormData({...formData, otobus_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Otobüs seçin" />
                </SelectTrigger>
                <SelectContent>
                  {otobusler && otobusler.map((otobus) => (
                    <SelectItem key={otobus.otobus_id} value={otobus.otobus_id.toString()}>
                      {otobus.plaka} - {otobus.firma_adi} ({otobus.koltuk_sayisi} koltuk)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fiyat (₺)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.fiyat}
                onChange={(e) => setFormData({...formData, fiyat: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış İstasyonu</label>
              <Select value={formData.kalkis_istasyon_id} onValueChange={(value) => setFormData({...formData, kalkis_istasyon_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kalkış istasyonu" />
                </SelectTrigger>
                <SelectContent>
                  {istasyonlar && istasyonlar.map((istasyon) => (
                    <SelectItem key={istasyon.istasyon_id} value={istasyon.istasyon_id.toString()}>
                      {istasyon.istasyon_adi} - {istasyon.il}/{istasyon.ilce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış İstasyonu</label>
              <Select value={formData.varis_istasyon_id} onValueChange={(value) => setFormData({...formData, varis_istasyon_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Varış istasyonu" />
                </SelectTrigger>
                <SelectContent>
                  {istasyonlar && istasyonlar.map((istasyon) => (
                    <SelectItem key={istasyon.istasyon_id} value={istasyon.istasyon_id.toString()}>
                      {istasyon.istasyon_adi} - {istasyon.il}/{istasyon.ilce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış Tarihi</label>
              <Input
                type="date"
                min={today}
                value={formData.kalkis_tarihi}
                onChange={(e) => setFormData({...formData, kalkis_tarihi: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış Saati</label>
              <Input
                type="time"
                value={formData.kalkis_saati}
                onChange={(e) => setFormData({...formData, kalkis_saati: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış Tarihi</label>
              <Input
                type="date"
                min={formData.kalkis_tarihi || today}
                value={formData.varis_tarihi}
                onChange={(e) => setFormData({...formData, varis_tarihi: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış Saati</label>
              <Input
                type="time"
                value={formData.varis_saati}
                onChange={(e) => setFormData({...formData, varis_saati: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddSefer} className="bg-blue-600 hover:bg-blue-700">
              Sefer Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sefer Düzenleme Modalı */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sefer Düzenle #{selectedSefer?.sefer_id}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Otobüs</label>
              <Select 
                key={`edit-otobus-${selectedSefer?.sefer_id}`}
                value={formData.otobus_id} 
                onValueChange={(value) => setFormData({...formData, otobus_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Otobüs seçin" />
                </SelectTrigger>
                <SelectContent>
                  {otobusler && otobusler.map((otobus) => (
                    <SelectItem key={otobus.otobus_id} value={otobus.otobus_id.toString()}>
                      {otobus.plaka} - {otobus.firma_adi} ({otobus.koltuk_sayisi} koltuk)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fiyat (₺)</label>
              <Input
                key={`edit-fiyat-${selectedSefer?.sefer_id}`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.fiyat}
                onChange={(e) => setFormData({...formData, fiyat: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış İstasyonu</label>
              <Select 
                key={`edit-kalkis-${selectedSefer?.sefer_id}`}
                value={formData.kalkis_istasyon_id} 
                onValueChange={(value) => setFormData({...formData, kalkis_istasyon_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kalkış istasyonu" />
                </SelectTrigger>
                <SelectContent>
                  {istasyonlar && istasyonlar.map((istasyon) => (
                    <SelectItem key={istasyon.istasyon_id} value={istasyon.istasyon_id.toString()}>
                      {istasyon.istasyon_adi} - {istasyon.il}/{istasyon.ilce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış İstasyonu</label>
              <Select 
                key={`edit-varis-${selectedSefer?.sefer_id}`}
                value={formData.varis_istasyon_id} 
                onValueChange={(value) => setFormData({...formData, varis_istasyon_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Varış istasyonu" />
                </SelectTrigger>
                <SelectContent>
                  {istasyonlar && istasyonlar.map((istasyon) => (
                    <SelectItem key={istasyon.istasyon_id} value={istasyon.istasyon_id.toString()}>
                      {istasyon.istasyon_adi} - {istasyon.il}/{istasyon.ilce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış Tarihi</label>
              <Input
                key={`edit-kalkis-tarih-${selectedSefer?.sefer_id}`}
                type="date"
                value={formData.kalkis_tarihi}
                onChange={(e) => setFormData({...formData, kalkis_tarihi: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış Saati</label>
              <Input
                key={`edit-kalkis-saat-${selectedSefer?.sefer_id}`}
                type="time"
                value={formData.kalkis_saati}
                onChange={(e) => setFormData({...formData, kalkis_saati: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış Tarihi</label>
              <Input
                key={`edit-varis-tarih-${selectedSefer?.sefer_id}`}
                type="date"
                min={formData.kalkis_tarihi}
                value={formData.varis_tarihi}
                onChange={(e) => setFormData({...formData, varis_tarihi: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış Saati</label>
              <Input
                key={`edit-varis-saat-${selectedSefer?.sefer_id}`}
                type="time"
                value={formData.varis_saati}
                onChange={(e) => setFormData({...formData, varis_saati: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateSefer} className="bg-blue-600 hover:bg-blue-700">
              Sefer Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sefer Detay Modalı */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sefer Detayları</DialogTitle>
          </DialogHeader>
          
          {selectedSefer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Güzergah</h4>
                  <p className="text-gray-600">
                    {selectedSefer.kalkis_il} → {selectedSefer.varis_il}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Firma & Otobüs</h4>
                  <p className="text-gray-600">
                    {selectedSefer.firma_adi} - {selectedSefer.plaka}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Kalkış</h4>
                  <p className="text-gray-600">
                    {formatDate(selectedSefer.kalkis_tarihi)} {formatTime(selectedSefer.kalkis_saati)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Varış</h4>
                  <p className="text-gray-600">
                    {formatDate(selectedSefer.varis_tarihi)} {formatTime(selectedSefer.varis_saati)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Fiyat</h4>
                  <p className="text-gray-600">₺{selectedSefer.fiyat}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Durum</h4>
                  <Badge variant={selectedSefer.aktif_mi ? "default" : "secondary"}>
                    {selectedSefer.aktif_mi ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Koltuk Durumu</h4>
                  <p className="text-gray-600">
                    {selectedSefer.satilan_koltuk}/{selectedSefer.koltuk_sayisi} 
                    ({selectedSefer.bos_koltuk} boş)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Oluşturulma</h4>
                  <p className="text-gray-600">
                    {formatDate(selectedSefer.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sefer Silme Modalı */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sefer Sil</DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-600">
            Bu seferi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          
          {selectedSefer && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">
                {selectedSefer.kalkis_il} → {selectedSefer.varis_il}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedSefer.kalkis_tarihi)} {formatTime(selectedSefer.kalkis_saati)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleDeleteSefer}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sefer Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 