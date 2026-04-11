'use client';

import { useState } from 'react';
import { Calculator, Wheat, Package, Scale } from 'lucide-react';

export default function KalkulatorPage() {
  const [luas, setLuas] = useState('');
  const [satuan, setSatuan] = useState('hektare'); // hektare atau bata/tumbak

  // Konstanta Perhitungan (Berdasarkan rata-rata agronomi)
  // 1 Bata/Tumbak = 14 meter persegi = 0.0014 Hektare
  const konversiKeHa = satuan === 'bata' ? parseFloat(luas) * 0.0014 : parseFloat(luas);

  const estimasiPanenTon = (konversiKeHa * 6.5).toFixed(2); // Asumsi 6.5 Ton/Ha
  const butuhBenihKg = (konversiKeHa * 25).toFixed(1); // Asumsi 25 Kg/Ha
  const butuhUreaKg = (konversiKeHa * 200).toFixed(0); // 200 Kg/Ha
  const butuhNPKKg = (konversiKeHa * 100).toFixed(0); // 100 Kg/Ha

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Kalkulator <span className="text-green-600">Pertanian</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Hitung estimasi hasil panen dan kebutuhan sarana produksi pertanian (Saprodi) berdasarkan luas lahan yang Anda miliki di Desa Pisangsambo.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="p-6 bg-green-50 border-b border-green-100 flex items-center gap-3">
          <Calculator className="text-green-600" />
          <h2 className="font-bold text-green-900 text-lg">Masukkan Luas Lahan</h2>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Angka Luas Lahan</label>
              <input 
                type="number" step="0.01" min="0"
                placeholder="Contoh: 1.5 atau 100"
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50"
                value={luas}
                onChange={(e) => setLuas(e.target.value)}
              />
            </div>
            <div className="sm:w-1/3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Satuan Lahan</label>
              <select 
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50"
              >
                <option value="hektare">Hektare (Ha)</option>
                <option value="bata">Bata / Tumbak</option>
              </select>
            </div>
          </div>

          {luas && parseFloat(luas) > 0 && (
            <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Hasil Perhitungan</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card Panen */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Wheat size={20} /> <span className="font-semibold">Estimasi Panen</span>
                  </div>
                  <div className="text-3xl font-black text-yellow-600">
                    {estimasiPanenTon} <span className="text-base font-medium text-yellow-800/70">Ton</span>
                  </div>
                </div>

                {/* Card Benih */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Package size={20} /> <span className="font-semibold">Kebutuhan Benih</span>
                  </div>
                  <div className="text-3xl font-black text-green-600">
                    {butuhBenihKg} <span className="text-base font-medium text-green-800/70">Kg</span>
                  </div>
                </div>
              </div>

              {/* Card Pupuk */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800 mb-3">
                  <Scale size={20} /> <span className="font-semibold">Estimasi Kebutuhan Pupuk</span>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-blue-600/80 font-medium">Urea</p>
                    <p className="text-2xl font-bold text-blue-700">{butuhUreaKg} Kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600/80 font-medium">NPK</p>
                    <p className="text-2xl font-bold text-blue-700">{butuhNPKKg} Kg</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
