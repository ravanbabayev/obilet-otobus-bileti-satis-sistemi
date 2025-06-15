'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit2,
  Trash2,
  Truck,
  Users,
  Calendar,
  MapPin,
  AlertTriangle,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Otobus {
  otobus_id: number;
  plaka: string;
  model: string;
  koltuk_sayisi: number;
  aktif_mi: boolean;
  created_at: string;
  updated_at: string;
  firma_id: number;
  firma_adi: string;
  aktif_sefer_sayisi: number;
  satilan_bilet_sayisi: number;
}

interface Firma {
  firma_id: number;
  firma_adi: string;
}

interface Filters {
  search: string;
  firma_id: string;
  durum: string;
}

export default function AracYonetimiPage() {
  const [otobusler, setOtobusler] = useState<Otobus[]>([]);
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    firma_id: 'TUMU',
    durum: 'AKTIF'
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOtobus, setSelectedOtobus] = useState<Otobus | null>(null);
  const [formData, setFormData] = useState({
    plaka: '',
    model: '',
    koltuk_sayisi: '',
    firma_id: '',
    aktif_mi: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Otobüsleri getir
  const fetchOtobusler = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/otobusler?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setOtobusler(Array.isArray(data) ? data : []);
      } else {
        console.error('Otobüsler getirilemedi');
      }
    } catch (error) {
      console.error('Otobüs listesi alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Firmaları getir
  const fetchFirmalar = async () => {
    try {
      const response = await fetch('/api/firmalar');
      if (response.ok) {
        const data = await response.json();
        setFirmalar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Firmalar alınırken hata:', error);
    }
  };

  useEffect(() => {
    fetchFirmalar();
  }, []);

  useEffect(() => {
    fetchOtobusler();
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddOtobus = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/otobusler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Otobüs başarıyla eklendi.');
        setShowAddModal(false);
        setFormData({ plaka: '', model: '', koltuk_sayisi: '', firma_id: '', aktif_mi: true });
        fetchOtobusler();
      } else {
        alert(result.error || 'Otobüs eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Otobüs ekleme hatası:', error);
      alert('Otobüs eklenirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOtobus = async () => {
    if (!selectedOtobus) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/otobusler/${selectedOtobus.otobus_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Otobüs başarıyla güncellendi.');
        setShowEditModal(false);
        setSelectedOtobus(null);
        fetchOtobusler();
      } else {
        alert(result.error || 'Otobüs güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Otobüs güncelleme hatası:', error);
      alert('Otobüs güncellenirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOtobus = async (otobus: Otobus) => {
    if (!confirm(`${otobus.plaka} plakalı otobüsü silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/otobusler/${otobus.otobus_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Otobüs başarıyla silindi.');
        fetchOtobusler();
      } else {
        alert(result.error || 'Otobüs silinirken hata oluştu.');
      }
    } catch (error) {
      console.error('Otobüs silme hatası:', error);
      alert('Otobüs silinirken hata oluştu.');
    }
  };

  const openEditModal = (otobus: Otobus) => {
    setSelectedOtobus(otobus);
    setFormData({
      plaka: otobus.plaka,
      model: otobus.model,
      koltuk_sayisi: otobus.koltuk_sayisi.toString(),
      firma_id: otobus.firma_id.toString(),
      aktif_mi: otobus.aktif_mi
    });
    setShowEditModal(true);
  };

  const openDetailModal = (otobus: Otobus) => {
    setSelectedOtobus(otobus);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (aktif_mi: boolean) => {
    if (aktif_mi) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Pasif
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/yonetim"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
                <p className="text-gray-600">Otobüs filosunu yönetin</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Otobüs</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Plaka veya firma adı"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma
              </label>
              <select
                value={filters.firma_id}
                onChange={(e) => handleFilterChange('firma_id', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TUMU">Tüm Firmalar</option>
                {firmalar.map((firma) => (
                  <option key={firma.firma_id} value={firma.firma_id}>
                    {firma.firma_adi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.durum}
                onChange={(e) => handleFilterChange('durum', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TUMU">Tüm Durumlar</option>
                <option value="AKTIF">Aktif</option>
                <option value="PASIF">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Otobüs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Otobüsler ({otobusler.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Otobüsler yükleniyor...</p>
            </div>
          ) : otobusler.length === 0 ? (
            <div className="p-8 text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz otobüs bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {otobusler.map((otobus) => (
                <div key={otobus.otobus_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {otobus.plaka}
                          </h3>
                          {getStatusBadge(otobus.aktif_mi)}
                        </div>
                        <p className="text-gray-600 mt-1">
                          {otobus.firma_adi} • {otobus.model} • {otobus.koltuk_sayisi} koltuk
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{otobus.aktif_sefer_sayisi} aktif sefer</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{otobus.satilan_bilet_sayisi} satılan bilet</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailModal(otobus)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detayları Gör"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(otobus)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOtobus(otobus)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                        disabled={otobus.aktif_sefer_sayisi > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Otobüs Ekle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaka *
                </label>
                <input
                  type="text"
                  value={formData.plaka}
                  onChange={(e) => setFormData(prev => ({ ...prev, plaka: e.target.value }))}
                  placeholder="34 ABC 1234"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Mercedes Travego"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Koltuk Sayısı *
                </label>
                <input
                  type="number"
                  value={formData.koltuk_sayisi}
                  onChange={(e) => setFormData(prev => ({ ...prev, koltuk_sayisi: e.target.value }))}
                  placeholder="40"
                  min="10"
                  max="60"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma *
                </label>
                <select
                  value={formData.firma_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, firma_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Firma Seçin</option>
                  {firmalar.map((firma) => (
                    <option key={firma.firma_id} value={firma.firma_id}>
                      {firma.firma_adi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddOtobus}
                disabled={isSubmitting || !formData.plaka || !formData.model || !formData.koltuk_sayisi || !formData.firma_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOtobus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Otobüs Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaka *
                </label>
                <input
                  type="text"
                  value={formData.plaka}
                  onChange={(e) => setFormData(prev => ({ ...prev, plaka: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Koltuk Sayısı *
                </label>
                <input
                  type="number"
                  value={formData.koltuk_sayisi}
                  onChange={(e) => setFormData(prev => ({ ...prev, koltuk_sayisi: e.target.value }))}
                  min="10"
                  max="60"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma *
                </label>
                <select
                  value={formData.firma_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, firma_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Firma Seçin</option>
                  {firmalar.map((firma) => (
                    <option key={firma.firma_id} value={firma.firma_id}>
                      {firma.firma_adi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.aktif_mi}
                    onChange={(e) => setFormData(prev => ({ ...prev, aktif_mi: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleEditOtobus}
                disabled={isSubmitting || !formData.plaka || !formData.model || !formData.koltuk_sayisi || !formData.firma_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOtobus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Otobüs Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plaka
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedOtobus.plaka}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  {getStatusBadge(selectedOtobus.aktif_mi)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <p className="text-gray-900">{selectedOtobus.model}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Koltuk Sayısı
                  </label>
                  <p className="text-gray-900">{selectedOtobus.koltuk_sayisi}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firma
                  </label>
                  <p className="text-gray-900">{selectedOtobus.firma_adi}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aktif Sefer Sayısı
                  </label>
                  <p className="text-gray-900">{selectedOtobus.aktif_sefer_sayisi}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satılan Bilet Sayısı
                  </label>
                  <p className="text-gray-900">{selectedOtobus.satilan_bilet_sayisi}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oluşturma Tarihi
                  </label>
                  <p className="text-gray-900 text-sm">{formatDate(selectedOtobus.created_at)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Son Güncelleme
                  </label>
                  <p className="text-gray-900 text-sm">{formatDate(selectedOtobus.updated_at)}</p>
                </div>
              </div>

              {selectedOtobus.aktif_sefer_sayisi > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Bu otobüsün aktif seferleri bulunmaktadır
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Otobüsü silmek için önce tüm aktif seferlerini iptal etmeniz gerekmektedir.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 