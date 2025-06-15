"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Building,
  Navigation,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Istasyon {
  istasyon_id: number;
  istasyon_adi: string;
  il: string;
  ilce: string;
  adres: string;
  aktif_mi: boolean;
  created_at: string;
  updated_at: string;
}

// Türkiye'nin illeri
const TURKIYE_ILLERI = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin",
  "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
  "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan",
  "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function IstasyonYonetimi() {
  const { toast } = useToast();
  const [istasyonlar, setIstasyonlar] = useState<Istasyon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ilFilter, setIlFilter] = useState("TUMU");
  const [durumFilter, setDurumFilter] = useState("AKTIF");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIstasyon, setSelectedIstasyon] = useState<Istasyon | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    istasyon_adi: "",
    il: "",
    ilce: "",
    adres: "",
    aktif_mi: true
  });

  // İstasyonları yükle
  const loadIstasyonlar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        il: ilFilter,
        durum: durumFilter
      });
      
      const response = await fetch(`/api/istasyonlar?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIstasyonlar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('İstasyonlar yüklenirken hata:', error);
      setIstasyonlar([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIstasyonlar();
  }, [searchTerm, ilFilter, durumFilter]);

  // Form temizle
  const clearForm = () => {
    setFormData({
      istasyon_adi: "",
      il: "",
      ilce: "",
      adres: "",
      aktif_mi: true
    });
  };

  // İstasyon ekle
  const handleAddIstasyon = async () => {
    try {
      setEditLoading(true);
      const response = await fetch('/api/istasyonlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: data.message || "İstasyon başarıyla eklendi.",
        });
        setShowAddModal(false);
        clearForm();
        loadIstasyonlar();
      } else {
        toast({
          title: "Hata",
          description: data.error || "İstasyon eklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İstasyon eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // İstasyon güncelle
  const handleUpdateIstasyon = async () => {
    if (!selectedIstasyon) return;

    try {
      setEditLoading(true);
      const response = await fetch(`/api/istasyonlar/${selectedIstasyon.istasyon_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: data.message || "İstasyon başarıyla güncellendi.",
        });
        setShowEditModal(false);
        clearForm();
        setSelectedIstasyon(null);
        loadIstasyonlar();
      } else {
        toast({
          title: "Hata",
          description: data.error || "İstasyon güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İstasyon güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // İstasyon sil
  const handleDeleteIstasyon = async () => {
    if (!selectedIstasyon) return;

    try {
      setEditLoading(true);
      const response = await fetch(`/api/istasyonlar/${selectedIstasyon.istasyon_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: data.message || "İstasyon başarıyla silindi.",
        });
        setShowDeleteModal(false);
        setSelectedIstasyon(null);
        loadIstasyonlar();
      } else {
        toast({
          title: "Hata",
          description: data.error || "İstasyon silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İstasyon silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Düzenleme modalını aç
  const openEditModal = (istasyon: Istasyon) => {
    setSelectedIstasyon(istasyon);
    setFormData({
      istasyon_adi: istasyon.istasyon_adi,
      il: istasyon.il,
      ilce: istasyon.ilce,
      adres: istasyon.adres || "",
      aktif_mi: istasyon.aktif_mi
    });
    setShowEditModal(true);
  };

  // Detay modalını aç
  const openDetailModal = (istasyon: Istasyon) => {
    setSelectedIstasyon(istasyon);
    setShowDetailModal(true);
  };

  // Tarih formatlama
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Benzersiz iller listesi
  const uniqueIller = Array.from(new Set(istasyonlar.map(i => i.il))).sort();

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
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">İstasyon Yönetimi</h1>
                <p className="text-sm text-gray-500">İstasyonları ekle, düzenle ve yönet</p>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                clearForm();
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni İstasyon
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="İstasyon adı, il, ilçe veya adres ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={ilFilter} onValueChange={setIlFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="İl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tüm İller</SelectItem>
                    {uniqueIller.map((il) => (
                      <SelectItem key={il} value={il}>
                        {il}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={durumFilter} onValueChange={setDurumFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                    <SelectItem value="TUMU">Tümü</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İstasyon Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>İstasyon Listesi ({istasyonlar.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : istasyonlar.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">İstasyon bulunamadı</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {istasyonlar.map((istasyon) => (
                  <div 
                    key={istasyon.istasyon_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {istasyon.istasyon_adi}
                          </h3>
                          <Badge variant={istasyon.aktif_mi ? "default" : "secondary"}>
                            {istasyon.aktif_mi ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4" />
                            <span>{istasyon.il} / {istasyon.ilce}</span>
                          </div>
                          {istasyon.adres && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span className="truncate">{istasyon.adres}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Oluşturulma: {formatDate(istasyon.created_at)}</span>
                          {istasyon.updated_at !== istasyon.created_at && (
                            <span>Son güncelleme: {formatDate(istasyon.updated_at)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(istasyon)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(istasyon)}
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
                            setSelectedIstasyon(istasyon);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600"
                          disabled={!istasyon.aktif_mi}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ekleme Modalı */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni İstasyon Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="istasyon_adi">İstasyon Adı *</Label>
                <Input
                  id="istasyon_adi"
                  value={formData.istasyon_adi}
                  onChange={(e) => setFormData({...formData, istasyon_adi: e.target.value})}
                  placeholder="İstasyon adını girin"
                />
              </div>
              <div>
                <Label htmlFor="il">İl *</Label>
                <Select value={formData.il} onValueChange={(value) => setFormData({...formData, il: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TURKIYE_ILLERI.map((il) => (
                      <SelectItem key={il} value={il}>
                        {il}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ilce">İlçe *</Label>
                <Input
                  id="ilce"
                  value={formData.ilce}
                  onChange={(e) => setFormData({...formData, ilce: e.target.value})}
                  placeholder="İlçe adını girin"
                />
              </div>
              <div>
                <Label htmlFor="adres">Adres</Label>
                <Textarea
                  id="adres"
                  value={formData.adres}
                  onChange={(e) => setFormData({...formData, adres: e.target.value})}
                  placeholder="Adres bilgisini girin (opsiyonel)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  clearForm();
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleAddIstasyon}
                disabled={editLoading || !formData.istasyon_adi || !formData.il || !formData.ilce}
              >
                {editLoading ? "Ekleniyor..." : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Düzenleme Modalı */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>İstasyon Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_istasyon_adi">İstasyon Adı *</Label>
                <Input
                  id="edit_istasyon_adi"
                  value={formData.istasyon_adi}
                  onChange={(e) => setFormData({...formData, istasyon_adi: e.target.value})}
                  placeholder="İstasyon adını girin"
                />
              </div>
              <div>
                <Label htmlFor="edit_il">İl *</Label>
                <Select value={formData.il} onValueChange={(value) => setFormData({...formData, il: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TURKIYE_ILLERI.map((il) => (
                      <SelectItem key={il} value={il}>
                        {il}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_ilce">İlçe *</Label>
                <Input
                  id="edit_ilce"
                  value={formData.ilce}
                  onChange={(e) => setFormData({...formData, ilce: e.target.value})}
                  placeholder="İlçe adını girin"
                />
              </div>
              <div>
                <Label htmlFor="edit_adres">Adres</Label>
                <Textarea
                  id="edit_adres"
                  value={formData.adres}
                  onChange={(e) => setFormData({...formData, adres: e.target.value})}
                  placeholder="Adres bilgisini girin (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_aktif_mi"
                  checked={formData.aktif_mi}
                  onChange={(e) => setFormData({...formData, aktif_mi: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="edit_aktif_mi">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditModal(false);
                  clearForm();
                  setSelectedIstasyon(null);
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleUpdateIstasyon}
                disabled={editLoading || !formData.istasyon_adi || !formData.il || !formData.ilce}
              >
                {editLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detay Modalı */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>İstasyon Detayları</DialogTitle>
            </DialogHeader>
            {selectedIstasyon && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">İstasyon Adı</Label>
                  <p className="text-lg font-semibold">{selectedIstasyon.istasyon_adi}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">İl</Label>
                    <p>{selectedIstasyon.il}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">İlçe</Label>
                    <p>{selectedIstasyon.ilce}</p>
                  </div>
                </div>
                {selectedIstasyon.adres && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Adres</Label>
                    <p>{selectedIstasyon.adres}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Durum</Label>
                  <div className="flex items-center mt-1">
                    {selectedIstasyon.aktif_mi ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-600">Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-red-600">Pasif</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Oluşturulma</Label>
                    <p>{formatDate(selectedIstasyon.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Son Güncelleme</Label>
                    <p>{formatDate(selectedIstasyon.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowDetailModal(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Modalı */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>İstasyon Silme Onayı</DialogTitle>
            </DialogHeader>
            {selectedIstasyon && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  <strong>{selectedIstasyon.istasyon_adi}</strong> istasyonunu silmek istediğinizden emin misiniz?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Bu işlem istasyonu pasif duruma getirecektir. İstasyonun aktif seferleri varsa silinemez.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedIstasyon(null);
                }}
              >
                İptal
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteIstasyon}
                disabled={editLoading}
              >
                {editLoading ? "Siliniyor..." : "Sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 