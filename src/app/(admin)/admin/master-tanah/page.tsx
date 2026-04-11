'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';

export default function MasterTanahPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal edit
  const [editingData, setEditingData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ambil data pas halaman diload
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/master-tanah');
      const json = await res.json();
      if (json.status === 'success') setData(json.data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi saat tombol Edit diklik
  const handleEditClick = (item: any) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  // Fungsi simpan perubahan ke database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/master-tanah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData(); // Refresh tabel
      }
    } catch (err) {
      alert("Gagal menyimpan data!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Master Data Tanah</h2>
        <p className="text-sm text-gray-500 mb-6">
          Nilai kandungan kimia ini (N, P, K, pH) akan digunakan sebagai nilai bawaan (default) saat petani memilih kondisi lahan mereka di form prediksi.
        </p>

        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-t border-gray-200">
                  <th className="p-4 font-semibold">Kondisi Lahan</th>
                  <th className="p-4 font-semibold">Nitrogen (N)</th>
                  <th className="p-4 font-semibold">Fosfor (P)</th>
                  <th className="p-4 font-semibold">Kalium (K)</th>
                  <th className="p-4 font-semibold">pH</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{item.kondisi_lahan}</td>
                    <td className="p-4 text-gray-600">{item.nilai_n}</td>
                    <td className="p-4 text-gray-600">{item.nilai_p}</td>
                    <td className="p-4 text-gray-600">{item.nilai_k}</td>
                    <td className="p-4 text-gray-600">{item.nilai_ph}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        title="Edit Nilai"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EDIT (Muncul kalau isModalOpen true) */}
      {isModalOpen && editingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Edit: {editingData.kondisi_lahan}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nitrogen (N)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={editingData.nilai_n}
                    onChange={(e) => setEditingData({...editingData, nilai_n: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fosfor (P)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={editingData.nilai_p}
                    onChange={(e) => setEditingData({...editingData, nilai_p: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kalium (K)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={editingData.nilai_k}
                    onChange={(e) => setEditingData({...editingData, nilai_k: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">pH Tanah</label>
                  <input 
                    type="number" step="0.1" required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={editingData.nilai_ph}
                    onChange={(e) => setEditingData({...editingData, nilai_ph: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan Sumber/Asumsi</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                  value={editingData.keterangan}
                  onChange={(e) => setEditingData({...editingData, keterangan: e.target.value})}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
