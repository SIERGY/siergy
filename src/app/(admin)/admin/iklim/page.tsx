'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';

export default function KelolaIklimPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    bulan: 'JANUARI', tahun_berlaku: new Date().getFullYear(),
    curah_hujan_mm: '', suhu_rata_rata: '27.5', kelembapan_persen: '80', keterangan_sumber: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/iklim');
      const json = await res.json();
      if (json.status === 'success') setData(json.data);
    } catch (err) {
      console.error("Error fetching", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC MANUAL INPUT ---
  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data bulan ini?")) return;
    await fetch(`/api/iklim?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/iklim', {
        method: 'POST', // POST kita udah pintar (Upsert)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  // --- LOGIC UPLOAD CSV ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      
      // Asumsi format CSV baris pertama (Header): Bulan,Tahun,CurahHujan,Suhu,Lembab
      const records = [];
      for (let i = 1; i < lines.length; i++) { // Mulai dari 1 untuk skip header
        const [bulan, tahun, ch, suhu, lembab] = lines[i].split(',');
        if (bulan && tahun && ch) {
          records.push({
            bulan: bulan.trim(),
            tahun_berlaku: parseInt(tahun.trim()),
            curah_hujan_mm: parseFloat(ch.trim()),
            suhu_rata_rata: suhu ? parseFloat(suhu.trim()) : 27.5, // Default BPS
            kelembapan_persen: lembab ? parseFloat(lembab.trim()) : 80.0, // Default BPS
            keterangan_sumber: 'Upload CSV'
          });
        }
      }

      // Kirim array ke API
      try {
        const res = await fetch('/api/iklim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(records),
        });
        if (res.ok) {
          alert("Data CSV Berhasil Diupload & Disinkronisasi!");
          fetchData();
        }
      } catch (err) {
        alert("Gagal memproses CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Data Iklim</h2>
          <p className="text-gray-500 text-sm">Data cuaca bulanan Tirtajaya (Hujan, Suhu, Kelembapan).</p>
        </div>
        
        <div className="flex gap-3">
          {/* Tombol Upload CSV Hidden, dipicu oleh label */}
          <label className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer shadow-sm">
            <Upload size={18} /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={() => {
              setFormData({ bulan: 'JANUARI', tahun_berlaku: new Date().getFullYear(), curah_hujan_mm: '', suhu_rata_rata: '27.5', kelembapan_persen: '80', keterangan_sumber: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Input Manual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data iklim...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold">Tahun</th>
                  <th className="p-4 font-semibold">Bulan</th>
                  <th className="p-4 font-semibold text-right">Curah Hujan (mm)</th>
                  <th className="p-4 font-semibold text-right">Suhu (°C)</th>
                  <th className="p-4 font-semibold text-right">Kelembapan (%)</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">{item.tahun_berlaku}</td>
                    <td className="p-4 text-gray-600">{item.bulan}</td>
                    <td className="p-4 text-blue-600 font-medium text-right">{item.curah_hujan_mm}</td>
                    <td className="p-4 text-orange-500 font-medium text-right">{item.suhu_rata_rata}</td>
                    <td className="p-4 text-teal-600 font-medium text-right">{item.kelembapan_persen}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL INPUT MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Input Data Iklim</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Berlaku</label>
                  <input type="number" required className="w-full border p-2.5 rounded-lg"
                    value={formData.tahun_berlaku} onChange={(e) => setFormData({...formData, tahun_berlaku: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  <select className="w-full border p-2.5 rounded-lg" value={formData.bulan} onChange={(e) => setFormData({...formData, bulan: e.target.value})}>
                    {['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">C. Hujan (mm)</label>
                  <input type="number" step="0.01" required className="w-full border p-2 text-sm rounded-lg" value={formData.curah_hujan_mm} onChange={(e) => setFormData({...formData, curah_hujan_mm: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Suhu (°C)</label>
                  <input type="number" step="0.01" required className="w-full border p-2 text-sm rounded-lg" value={formData.suhu_rata_rata} onChange={(e) => setFormData({...formData, suhu_rata_rata: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lembab (%)</label>
                  <input type="number" step="0.01" required className="w-full border p-2 text-sm rounded-lg" value={formData.kelembapan_persen} onChange={(e) => setFormData({...formData, kelembapan_persen: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Data (Keterangan)</label>
                <input type="text" className="w-full border p-2.5 rounded-lg text-sm" placeholder="Contoh: CH dari BMKG, Suhu BPS" value={formData.keterangan_sumber} onChange={(e) => setFormData({...formData, keterangan_sumber: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                  <Save size={18} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
