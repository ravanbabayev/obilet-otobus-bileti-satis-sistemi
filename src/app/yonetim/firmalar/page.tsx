"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  ArrowLeft, 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Bus,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Firma {
  firma_id: number;
  firma_adi: string;
  telefon: string;
  email: string;
  vergi_no: string;
  merkez_adres: string;
  aktif_mi: boolean;
  created_at: string;
  updated_at: string;
  otobus_sayisi: number;
  toplam_sefer_sayisi: number;
  ortalama_puan: number;
}

export default function FirmaYonetimi() {
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [durumFilter, setDurumFilter] = useState("TUMU");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFirma, setSelectedFirma] = useState<Firma | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firma_adi: "",
    telefon: "",
    email: "",
    vergi_no: "",
    merkez_adres: ""
  });

  // Firmaları yükle
  const loadFirmalar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        durum: durumFilter
      });
      
      const response = await fetch(`/api/firmalar?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFirmalar(data);
      }
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFirmalar();
  }, [searchTerm, durumFilter]);

  // Form temizle
  const clearForm = () => {
    setFormData({
      firma_adi: "",
      telefon: "",
      email: "",
      vergi_no: "",
      merkez_adres: ""
    });
  };

  // Firma ekle
  const handleAddFirma = async () => {
    try {
      const response = await fetch('/api/firmalar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Firma başarıyla eklendi!');
        setShowAddModal(false);
        clearForm();
        loadFirmalar();
      } else {
        alert(result.error || 'Firma eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Firma ekleme hatası:', error);
      alert('Firma eklenirken hata oluştu');
    }
  };

  // Firma güncelle
  const handleUpdateFirma = async () => {
    if (!selectedFirma) return;

    try {
      const response = await fetch(`/api/firmalar/${selectedFirma.firma_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Firma başarıyla güncellendi!');
        setShowEditModal(false);
        clearForm();
        setSelectedFirma(null);
        loadFirmalar();
      } else {
        alert(result.error || 'Firma güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Firma güncelleme hatası:', error);
      alert('Firma güncellenirken hata oluştu');
    }
  };

  // Firma sil
  const handleDeleteFirma = async () => {
    if (!selectedFirma) return;

    try {
      const response = await fetch(`/api/firmalar/${selectedFirma.firma_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Firma başarıyla silindi!');
        setShowDeleteModal(false);
        setSelectedFirma(null);
        loadFirmalar();
      } else {
        alert(result.error || 'Firma silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Firma silme hatası:', error);
      alert('Firma silinirken hata oluştu');
    }
  };

  // Firma durumunu değiştir
  const handleToggleStatus = async (firma: Firma) => {
    try {
      const response = await fetch(`/api/firmalar/${firma.firma_id}/durum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktif_mi: !firma.aktif_mi })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(result.message);
        loadFirmalar();
      } else {
        alert(result.error || 'Durum değiştirilirken hata oluştu');
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      alert('Durum değiştirilirken hata oluştu');
    }
  };

  // Edit modal açmak için
  const openEditModal = (firma: Firma) => {
    setSelectedFirma(firma);
    setFormData({
      firma_adi: firma.firma_adi,
      telefon: firma.telefon,
      email: firma.email,
      vergi_no: firma.vergi_no,
      merkez_adres: firma.merkez_adres
    });
    setShowEditModal(true);
  };

  // Detail modal açmak için
  const openDetailModal = async (firma: Firma) => {
    try {
      const response = await fetch(`/api/firmalar/${firma.firma_id}`);
      if (response.ok) {
        const detailedFirma = await response.json();
        setSelectedFirma(detailedFirma);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Firma detayı yüklenirken hata:', error);
    }
  };

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
              <Building2 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Firma Yönetimi</h1>
                <p className="text-sm text-gray-500">Otobüs firmalarını ekle, düzenle ve yönet</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Firma
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Firma adı, telefon veya email ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={durumFilter} onValueChange={setDurumFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUMU">Tümü</SelectItem>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firma Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Firma Listesi ({firmalar.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : firmalar.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Firma bulunamadı</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {firmalar.map((firma) => (
                  <div 
                    key={firma.firma_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {firma.firma_adi}
                          </h3>
                          <Badge variant={firma.aktif_mi ? "default" : "secondary"}>
                            {firma.aktif_mi ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {firma.telefon}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {firma.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4" />
                            {firma.otobus_sayisi} Otobüs
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {firma.toplam_sefer_sayisi} Sefer
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{firma.merkez_adres}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(firma)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(firma)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(firma)}
                          className={firma.aktif_mi ? "text-red-600" : "text-green-600"}
                        >
                          {firma.aktif_mi ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFirma(firma);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600"
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
      </main>

      {/* Firma Ekleme Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yeni Firma Ekle</DialogTitle>
            <DialogDescription>
              Yeni otobüs firması bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firma_adi">Firma Adı</Label>
              <Input
                id="firma_adi"
                value={formData.firma_adi}
                onChange={(e) => setFormData({...formData, firma_adi: e.target.value})}
                placeholder="Metro Turizm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                placeholder="02124443455"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="info@firma.com.tr"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vergi_no">Vergi Numarası</Label>
              <Input
                id="vergi_no"
                value={formData.vergi_no}
                onChange={(e) => setFormData({...formData, vergi_no: e.target.value})}
                placeholder="1234567890"
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="merkez_adres">Merkez Adres</Label>
              <Textarea
                id="merkez_adres"
                value={formData.merkez_adres}
                onChange={(e) => setFormData({...formData, merkez_adres: e.target.value})}
                placeholder="İstanbul Otogarı, Bayrampaşa/İstanbul"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddFirma} className="bg-green-600 hover:bg-green-700">
              Firma Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Firma Düzenleme Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Firma Düzenle</DialogTitle>
            <DialogDescription>
              Firma bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_firma_adi">Firma Adı</Label>
              <Input
                id="edit_firma_adi"
                value={formData.firma_adi}
                onChange={(e) => setFormData({...formData, firma_adi: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_telefon">Telefon</Label>
              <Input
                id="edit_telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_vergi_no">Vergi Numarası</Label>
              <Input
                id="edit_vergi_no"
                value={formData.vergi_no}
                onChange={(e) => setFormData({...formData, vergi_no: e.target.value})}
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_merkez_adres">Merkez Adres</Label>
              <Textarea
                id="edit_merkez_adres"
                value={formData.merkez_adres}
                onChange={(e) => setFormData({...formData, merkez_adres: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateFirma} className="bg-blue-600 hover:bg-blue-700">
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Firma Detay Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Firma Detayları</DialogTitle>
          </DialogHeader>
          {selectedFirma && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedFirma.firma_adi}</h3>
                <Badge variant={selectedFirma.aktif_mi ? "default" : "secondary"}>
                  {selectedFirma.aktif_mi ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Telefon:</span>
                  <span>{selectedFirma.telefon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedFirma.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Vergi No:</span>
                  <span>{selectedFirma.vergi_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Otobüs Sayısı:</span>
                  <span>{selectedFirma.otobus_sayisi || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Toplam Sefer:</span>
                  <span>{selectedFirma.toplam_sefer_sayisi || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aktif Sefer:</span>
                  <span>{(selectedFirma as any).aktif_sefer_sayisi || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bugün Satış:</span>
                  <span>{(selectedFirma as any).bugun_satis_adedi || 0} bilet</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bugün Gelir:</span>
                  <span>{((selectedFirma as any).bugun_gelir || 0).toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-sm">Merkez Adres:</span>
                <p className="text-sm text-gray-600 mt-1">{selectedFirma.merkez_adres}</p>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Oluşturulma: {new Date(selectedFirma.created_at).toLocaleString('tr-TR')}</span>
                <span>Güncelleme: {new Date(selectedFirma.updated_at).toLocaleString('tr-TR')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Firma Silme Onay Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmayı Sil</DialogTitle>
            <DialogDescription>
              "{selectedFirma?.firma_adi}" firmasını silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz ve firmaya ait otobüsler de pasif hale gelecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleDeleteFirma}
              variant="destructive"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 