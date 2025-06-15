"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  ArrowLeft, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  User,
  Calendar,
  RefreshCw,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Musteri {
  musteri_id: number;
  ad: string;
  soyad: string;
  tc_kimlik_no: string;
  telefon: string;
  email?: string;
  created_at: string;
  bilet_sayisi?: number;
  toplam_harcama?: number;
  son_satin_alma?: string;
}

export default function MusteriYonetimi() {
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMusteri, setSelectedMusteri] = useState<Musteri | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    tc_kimlik_no: '',
    telefon: '',
    email: ''
  });

  // Müşteri listesini getir
  const fetchMusteriler = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm
      });

      const response = await fetch(`/api/musteriler?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMusteriler(Array.isArray(data) ? data : []);
      } else {
        console.error('Müşteri listesi alınamadı:', data.error);
        setMusteriler([]);
      }
    } catch (error) {
      console.error('Müşteri listesi yüklenirken hata:', error);
      setMusteriler([]);
    } finally {
      setLoading(false);
    }
  };

  // Müşteri detayını modal'da aç
  const openDetailModal = (musteri: Musteri) => {
    setSelectedMusteri(musteri);
    setIsDetailModalOpen(true);
  };

  // Yeni müşteri modal'ı aç
  const openAddModal = () => {
    setFormData({
      ad: '',
      soyad: '',
      tc_kimlik_no: '',
      telefon: '',
      email: ''
    });
    setIsAddModalOpen(true);
  };

  // Düzenleme modal'ı aç
  const openEditModal = (musteri: Musteri) => {
    setSelectedMusteri(musteri);
    setFormData({
      ad: musteri.ad,
      soyad: musteri.soyad,
      tc_kimlik_no: musteri.tc_kimlik_no,
      telefon: musteri.telefon,
      email: musteri.email || ''
    });
    setIsEditModalOpen(true);
  };

  // Müşteri ekle
  const handleAddMusteri = async () => {
    try {
      const response = await fetch('/api/musteriler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Müşteri başarıyla eklendi",
        });
        setIsAddModalOpen(false);
        fetchMusteriler();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Müşteri eklenirken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Müşteri eklenirken hata:', error);
      toast({
        title: "Hata",
        description: "Müşteri eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Müşteri güncelle
  const handleUpdateMusteri = async () => {
    if (!selectedMusteri) return;

    try {
      const response = await fetch(`/api/musteriler/${selectedMusteri.musteri_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Müşteri başarıyla güncellendi",
        });
        setIsEditModalOpen(false);
        fetchMusteriler();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Müşteri güncellenirken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
      toast({
        title: "Hata",
        description: "Müşteri güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Müşteri sil
  const handleDeleteMusteri = async (musteriId: number) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/musteriler/${musteriId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Müşteri başarıyla silindi",
        });
        fetchMusteriler();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Müşteri silinirken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
      toast({
        title: "Hata",
        description: "Müşteri silinirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const resetForm = () => {
    setFormData({
      ad: '',
      soyad: '',
      tc_kimlik_no: '',
      telefon: '',
      email: ''
    });
  };

  useEffect(() => {
    fetchMusteriler();
  }, [searchTerm]);

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
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Müşteri Yönetimi</h1>
                <p className="text-sm text-gray-500">Müşteri bilgilerini görüntüle ve yönet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchMusteriler}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Müşteri
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Arama ve Filtreleme */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Arama ve Filtreleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Genel Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="İsim, TC, telefon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Müşteri Listesi */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Müşteri Listesi ({loading ? '...' : musteriler.length} müşteri)
              </CardTitle>
              {musteriler.length > 0 && (
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
                <p className="text-gray-600">Müşteriler yükleniyor...</p>
              </div>
            ) : musteriler.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Henüz müşteri bulunamadı</p>
                <p className="text-sm text-gray-500">Yeni müşteri eklemek için yukarıdaki butonu kullanın</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Müşteri</th>
                      <th className="text-left p-3 font-semibold">İletişim</th>
                      <th className="text-left p-3 font-semibold">TC Kimlik</th>
                      <th className="text-left p-3 font-semibold">Kayıt Tarihi</th>
                      <th className="text-left p-3 font-semibold">İstatistik</th>
                      <th className="text-left p-3 font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {musteriler.map((musteri) => (
                      <tr key={musteri.musteri_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{musteri.ad} {musteri.soyad}</div>
                              <div className="text-sm text-gray-500">ID: {musteri.musteri_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              <span>{musteri.telefon}</span>
                            </div>
                            {musteri.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                <span>{musteri.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-sm">{musteri.tc_kimlik_no}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            <span>{formatDate(musteri.created_at)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1 text-sm">
                            <div>
                              <Badge variant="outline">
                                {musteri.bilet_sayisi || 0} bilet
                              </Badge>
                            </div>
                            {musteri.toplam_harcama && (
                              <div className="text-green-600 font-medium">
                                {formatCurrency(musteri.toplam_harcama)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailModal(musteri)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(musteri)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMusteri(musteri.musteri_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Müşteri Detay Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Müşteri Detayları - {selectedMusteri?.ad} {selectedMusteri?.soyad}</DialogTitle>
          </DialogHeader>
          
          {selectedMusteri && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                    <p className="font-semibold">{selectedMusteri.ad} {selectedMusteri.soyad}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">TC Kimlik No</label>
                    <p className="font-mono">{selectedMusteri.tc_kimlik_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p>{selectedMusteri.telefon}</p>
                  </div>
                  {selectedMusteri.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">E-posta</label>
                      <p>{selectedMusteri.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Toplam Bilet</label>
                    <p className="text-2xl font-bold text-blue-600">{selectedMusteri.bilet_sayisi || 0}</p>
                  </div>
                  {selectedMusteri.toplam_harcama && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Toplam Harcama</label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedMusteri.toplam_harcama)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                    <p>{formatDate(selectedMusteri.created_at)}</p>
                  </div>
                  {selectedMusteri.son_satin_alma && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Son Satın Alma</label>
                      <p>{formatDate(selectedMusteri.son_satin_alma)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Müşteri Ekleme Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ad">Ad *</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({...formData, ad: e.target.value})}
                  placeholder="Müşteri adı"
                />
              </div>
              <div>
                <Label htmlFor="soyad">Soyad *</Label>
                <Input
                  id="soyad"
                  value={formData.soyad}
                  onChange={(e) => setFormData({...formData, soyad: e.target.value})}
                  placeholder="Müşteri soyadı"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tc_kimlik_no">TC Kimlik No *</Label>
              <Input
                id="tc_kimlik_no"
                value={formData.tc_kimlik_no}
                onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value})}
                placeholder="11 haneli TC kimlik numarası"
                maxLength={11}
              />
            </div>
            
            <div>
              <Label htmlFor="telefon">Telefon *</Label>
              <Input
                id="telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                placeholder="05XX XXX XX XX"
              />
            </div>
            
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ornek@email.com"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button onClick={handleAddMusteri}>
                Müşteri Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Müşteri Düzenleme Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle - {selectedMusteri?.ad} {selectedMusteri?.soyad}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_ad">Ad *</Label>
                <Input
                  id="edit_ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({...formData, ad: e.target.value})}
                  placeholder="Müşteri adı"
                />
              </div>
              <div>
                <Label htmlFor="edit_soyad">Soyad *</Label>
                <Input
                  id="edit_soyad"
                  value={formData.soyad}
                  onChange={(e) => setFormData({...formData, soyad: e.target.value})}
                  placeholder="Müşteri soyadı"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_tc_kimlik_no">TC Kimlik No *</Label>
              <Input
                id="edit_tc_kimlik_no"
                value={formData.tc_kimlik_no}
                onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value})}
                placeholder="11 haneli TC kimlik numarası"
                maxLength={11}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_telefon">Telefon *</Label>
              <Input
                id="edit_telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                placeholder="05XX XXX XX XX"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_email">E-posta</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ornek@email.com"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button onClick={handleUpdateMusteri}>
                Güncelle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 