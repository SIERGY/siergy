"use client";

import { useState } from "react";
import { Calculator, Wheat, Package, Scale, Info } from "lucide-react";

export default function KalkulatorPage() {
  const [luas, setLuas] = useState("");
  const [satuan, setSatuan] = useState("hektare");

  const konversiKeHa =
    satuan === "bata" ? parseFloat(luas) * 0.0014 : parseFloat(luas);

  const estimasiPanenTon = (konversiKeHa * 6.5).toFixed(2);
  const butuhBenihKg = (konversiKeHa * 25).toFixed(1);
  const butuhUreaKg = (konversiKeHa * 200).toFixed(0);
  const butuhNPKKg = (konversiKeHa * 100).toFixed(0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2 sm:space-y-4 px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Kalkulator <span className="text-green-600">Pertanian</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Hitung estimasi hasil panen dan kebutuhan sarana produksi pertanian
          (Saprodi) berdasarkan luas lahan yang Anda miliki di Desa Pisangsambo.
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="p-4 sm:p-6 bg-green-50 border-b border-green-100 flex items-center gap-2 sm:gap-3">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          <h2 className="font-bold text-green-900 text-base sm:text-lg">
            Masukkan Luas Lahan
          </h2>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
                Angka Luas Lahan
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Contoh: 1.5 atau 100"
                className="w-full p-2.5 sm:p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50 text-sm sm:text-base"
                value={luas}
                onChange={(e) => setLuas(e.target.value)}
              />
            </div>
            <div className="sm:w-1/3">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
                Satuan Lahan
              </label>
              <select
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="w-full p-2.5 sm:p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50 text-sm sm:text-base"
              >
                <option value="hektare">Hektare (Ha)</option>
                <option value="bata">Bata / Tumbak</option>
              </select>
            </div>
          </div>

          {luas && parseFloat(luas) > 0 && (
            <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-100">
              <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-4 flex items-center gap-1">
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                Hasil Perhitungan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Card Panen */}
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 p-4 sm:p-5 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-800 mb-1.5 sm:mb-2">
                    <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">
                      Estimasi Panen
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-600">
                    {estimasiPanenTon}{" "}
                    <span className="text-xs sm:text-base font-medium text-yellow-800/70">
                      Ton
                    </span>
                  </div>
                  <p className="text-xs text-yellow-600/70 mt-1 sm:mt-2">
                    Berdasarkan lahan{" "}
                    {satuan === "bata"
                      ? `${luas} bata`
                      : `${konversiKeHa.toFixed(2)} Ha`}
                  </p>
                </div>

                {/* Card Benih */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 sm:p-5 rounded-xl border border-green-100">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-green-800 mb-1.5 sm:mb-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">
                      Kebutuhan Benih
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-green-600">
                    {butuhBenihKg}{" "}
                    <span className="text-xs sm:text-base font-medium text-green-800/70">
                      Kg
                    </span>
                  </div>
                  <p className="text-xs text-green-600/70 mt-1 sm:mt-2">
                    ~{Math.ceil(parseFloat(butuhBenihKg) / 25)} karung @25kg
                  </p>
                </div>
              </div>

              {/* Card Pupuk */}
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-4 sm:p-5 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-800 mb-2 sm:mb-3">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">
                    Estimasi Kebutuhan Pupuk
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-8">
                  <div className="flex-1 min-w-20">
                    <p className="text-xs sm:text-sm text-blue-600/80 font-medium">
                      Urea
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">
                      {parseInt(butuhUreaKg).toLocaleString()}{" "}
                      <span className="text-sm font-medium">Kg</span>
                    </p>
                    <p className="text-xs text-blue-600/50">
                      ~{Math.ceil(parseInt(butuhUreaKg) / 50)} karung @50kg
                    </p>
                  </div>
                  <div className="flex-1 min-w-20">
                    <p className="text-xs sm:text-sm text-blue-600/80 font-medium">
                      NPK
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">
                      {parseInt(butuhNPKKg).toLocaleString()}{" "}
                      <span className="text-sm font-medium">Kg</span>
                    </p>
                    <p className="text-xs text-blue-600/50">
                      ~{Math.ceil(parseInt(butuhNPKKg) / 50)} karung @50kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Info tambahan untuk satuan bata */}
              {satuan === "bata" && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                  * 1 Bata/Tumbak = 14 m² | Luas Anda:{" "}
                  {(parseFloat(luas) * 14).toLocaleString()} m² ={" "}
                  {konversiKeHa.toFixed(4)} Hektare
                </div>
              )}
            </div>
          )}

          {/* Empty state when no input */}
          {(!luas || parseFloat(luas) === 0) && (
            <div className="mt-4 sm:mt-8 p-6 sm:p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Masukkan luas lahan di atas untuk melihat hasil perhitungan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
