// TANPA 'use client' -> Ini adalah murni Server Component!
import pool from "@/lib/db";
import {
  CloudRain,
  Wheat,
  TrendingUp,
  Droplets,
  Thermometer,
  Calendar,
} from "lucide-react";

// Fungsi Fetching langsung dari DB (Jauh lebih cepat dari fetch API)
async function getStatistikData() {
  if (!pool) {
    throw new Error("Koneksi database tidak tersedia");
  }
  // Ambil iklim 1 tahun terakhir (12 data)
  const iklimRes = await pool.query(
    "SELECT * FROM data_iklim_tirtajaya ORDER BY tahun_berlaku DESC, id ASC LIMIT 12",
  );

  // Ambil panen 5 data terakhir
  const panenRes = await pool.query(
    "SELECT * FROM data_panen_desa ORDER BY tahun DESC, musim_tanam ASC LIMIT 5",
  );

  return {
    iklim: iklimRes.rows,
    panen: panenRes.rows,
  };
}

export default async function StatistikPage() {
  // Tunggu data ditarik dari database sebelum HTML dikirim ke browser
  const { iklim, panen } = await getStatistikData();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-0">
      {/* Header Halaman */}
      <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Transparansi <span className="text-green-600">Data Desa</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
          Algoritma Kecerdasan Buatan kami mengambil keputusan berdasarkan data
          historis cuaca BMKG dan produktivitas lahan nyata di Kecamatan
          Tirtajaya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
        {/* BAGIAN 1: TABEL IKLIM TERBARU */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-3 sm:p-4 border-b border-blue-100 flex items-center gap-2 sm:gap-3">
            <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="font-bold text-blue-900 text-sm sm:text-base">
              Rekap Cuaca Terbaru
            </h2>
            <span className="ml-auto text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
              {iklim.length} bulan
            </span>
          </div>

          {/* Mobile Card View - for small screens */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {iklim.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CloudRain className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Data belum tersedia</p>
              </div>
            ) : (
              iklim.map((item) => (
                <div
                  key={item.id}
                  className="p-4 space-y-2 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800 text-sm">
                      {item.bulan} {item.tahun_berlaku}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Droplets className="w-3.5 h-3.5" />
                      <span className="text-gray-600">Curah Hujan:</span>
                      <span className="font-semibold text-blue-700">
                        {item.curah_hujan_mm} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span className="text-gray-600">Suhu:</span>
                      <span className="font-semibold">
                        {item.suhu_rata_rata}°C
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 border-b">
                  <th className="px-4 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Bulan/Tahun
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Curah Hujan (mm)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Suhu (°C)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {iklim.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">
                      <CloudRain className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      Data belum tersedia
                    </td>
                  </tr>
                ) : (
                  iklim.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-3 font-medium text-gray-700 text-sm">
                        {item.bulan} {item.tahun_berlaku}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-blue-600 font-semibold">
                        {item.curah_hujan_mm}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-orange-500">
                        {item.suhu_rata_rata}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN 2: TABEL HISTORI PANEN */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-yellow-50 p-3 sm:p-4 border-b border-yellow-100 flex items-center gap-2 sm:gap-3">
            <Wheat className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            <h2 className="font-bold text-yellow-900 text-sm sm:text-base">
              Histori Panen Padi
            </h2>
            <span className="ml-auto text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
              {panen.length} data
            </span>
          </div>

          {/* Mobile Card View - for small screens */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {panen.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Wheat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Data belum tersedia</p>
              </div>
            ) : (
              panen.map((item) => (
                <div
                  key={item.id}
                  className="p-4 space-y-2 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">
                        {item.tahun}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 ml-2">
                        {item.musim_tanam}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Luas Lahan</p>
                      <p className="font-semibold text-gray-700">
                        {item.luas_lahan_ha} Ha
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Total Produksi</p>
                      <p className="font-semibold text-green-600">
                        {item.total_produksi_ton} Ton
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 border-b">
                  <th className="px-4 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider">
                    Tahun / Musim
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Luas Lahan (Ha)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Produksi (Ton)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {panen.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">
                      <Wheat className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      Data belum tersedia
                    </td>
                  </tr>
                ) : (
                  panen.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-medium text-gray-700">
                            {item.tahun}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                            {item.musim_tanam}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-gray-600">
                        {item.luas_lahan_ha}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-green-600 font-bold">
                        {item.total_produksi_ton}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Tambahan - Responsive */}
      <div className="bg-linear-to-r from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="bg-white/20 p-2.5 sm:p-3 rounded-full shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="font-bold text-base sm:text-lg md:hidden">
            Didukung Algoritma Random Forest
          </h3>
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg md:block hidden">
            Didukung Algoritma Random Forest
          </h3>
          <p className="text-green-50 text-xs sm:text-sm mt-0.5 sm:mt-1">
            Sistem ini menggunakan machine learning dengan akurasi tinggi untuk
            memetakan pola dari data di atas menjadi rekomendasi tanam yang
            presisi.
          </p>
        </div>
      </div>

      {/* Metadata info */}
      <div className="text-center text-xs text-gray-500 italic pt-2">
        *Data dapat diperbarui secara berkala oleh admin desa berdasarkan data
        iklim terbaru dari BMKG dan hasil panen aktual dari Dinas Pertanian.
        Sistem akan otomatis memproses data baru untuk meningkatkan akurasi
        prediksi masa tanam.
      </div>
    </div>
  );
}
