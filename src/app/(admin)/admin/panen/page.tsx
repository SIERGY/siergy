'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function KelolaPanenPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'tambah' | 'edit'>('tambah');
  const [formData, setFormData] = useState({
    id: '', tahun: new Date().getFullYear(), musim_tanam: 'Tahunan', luas_lahan_ha: '', total_produksi_ton: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/panen');
      const json = await res.json();
      if (json.status === 'success') setData(json.data);
    } catch (err) {
      console.error("Error fetching", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Buka modal untuk Tambah
  const handleTambah = () => {
    setModalMode('tambah');
    setFormData({ id: '', tahun: new Date().getFullYear(), musim_tanam: 'Tahunan', luas_lahan_ha: '', total_produksi_ton: '' });
    setIsModalOpen(true);
  };

  // Buka modal untuk Edit
  const handleEdit = (item: any) => {
    setModalMode('edit');
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Eksekusi Hapus Data
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await fetch(`/api/panen?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  // Eksekusi Simpan (Tambah / Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalMode === 'tambah' ? 'POST' : 'PUT';
    
    try {
      const res = await fetch('/api/panen', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(json.message); // Munculin error kalau tahun double
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Data Panen</h2>
          <p className="text-gray-500 text-sm">Catat histori produksi padi Desa Pisangsambo setiap musim.</p>
        </div>
        <button 
          onClick={handleTambah}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data histori panen...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold">Tahun</th>
                  <th className="p-4 font-semibold">Musim Tanam</th>
                  <th className="p-4 font-semibold text-right">Luas Lahan (Ha)</th>
                  <th className="p-4 font-semibold text-right">Total Produksi (Ton)</th>
                  <th className="p-4 font-semibold text-right text-blue-600">Produktivitas (Ton/Ha)</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Belum ada data panen.</td></tr>
                ) : (
                  data.map((item) => {
                    // Kalkulasi produktivitas on the fly
                    const produktivitas = (parseFloat(item.total_produksi_ton) / parseFloat(item.luas_lahan_ha)).toFixed(2);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{item.tahun}</td>
                        <td className="p-4 text-gray-600">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                            {item.musim_tanam}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-right">{item.luas_lahan_ha}</td>
                        <td className="p-4 text-gray-600 text-right font-medium">{item.total_produksi_ton}</td>
                        <td className="p-4 text-blue-600 font-bold text-right">{produktivitas}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md" title="Hapus">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM (Dipakai untuk Tambah dan Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {modalMode === 'tambah' ? 'Tambah Histori Panen' : 'Edit Data Panen'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input 
                    type="number" required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={formData.tahun}
                    onChange={(e) => setFormData({...formData, tahun: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Musim Tanam</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={formData.musim_tanam}
                    onChange={(e) => setFormData({...formData, musim_tanam: e.target.value})}
                  >
                    <option value="Tahunan">Setahun Penuh</option>
                    <option value="Rendeng">Rendeng (Hujan)</option>
                    <option value="Gadu">Gadu (Kemarau)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luas Lahan Panen (Hektare)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.01" required placeholder="Contoh: 1200"
                    className="w-full border border-gray-300 rounded-lg p-2.5 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={formData.luas_lahan_ha}
                    onChange={(e) => setFormData({...formData, luas_lahan_ha: e.target.value})}
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400">Ha</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Produksi (Ton)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.01" required placeholder="Contoh: 7500"
                    className="w-full border border-gray-300 rounded-lg p-2.5 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={formData.total_produksi_ton}
                    onChange={(e) => setFormData({...formData, total_produksi_ton: e.target.value})}
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400">Ton</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save size={18} /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
