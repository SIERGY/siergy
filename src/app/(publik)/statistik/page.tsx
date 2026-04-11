// TANPA 'use client' -> Ini adalah murni Server Component!
import pool from "@/lib/db";
import { CloudRain, Wheat, TrendingUp } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Halaman */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Transparansi <span className="text-green-600">Data Desa</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Algoritma Kecerdasan Buatan kami mengambil keputusan berdasarkan data
          historis cuaca BMKG dan produktivitas lahan nyata di Kecamatan
          Tirtajaya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* BAGIAN 1: TABEL IKLIM TERBARU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-3">
            <CloudRain className="text-blue-600" />
            <h2 className="font-bold text-blue-900">Rekap Cuaca Terbaru</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="pb-2">Bulan/Tahun</th>
                  <th className="pb-2 text-right">Hujan (mm)</th>
                  <th className="pb-2 text-right">Suhu (°C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {iklim.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400">
                      Data belum tersedia
                    </td>
                  </tr>
                ) : (
                  iklim.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">
                        {item.bulan} {item.tahun_berlaku}
                      </td>
                      <td className="py-3 text-right text-blue-600 font-semibold">
                        {item.curah_hujan_mm}
                      </td>
                      <td className="py-3 text-right text-orange-500">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-center gap-3">
            <Wheat className="text-yellow-600" />
            <h2 className="font-bold text-yellow-900">Histori Panen Padi</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="pb-2">Tahun / Musim</th>
                  <th className="pb-2 text-right">Lahan (Ha)</th>
                  <th className="pb-2 text-right">Produksi (Ton)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {panen.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400">
                      Data belum tersedia
                    </td>
                  </tr>
                ) : (
                  panen.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">
                        {item.tahun}{" "}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 ml-1">
                          {item.musim_tanam}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {item.luas_lahan_ha}
                      </td>
                      <td className="py-3 text-right text-green-600 font-bold">
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

      {/* Info Tambahan */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">
            Didukung Algoritma Random Forest
          </h3>
          <p className="text-green-50 text-sm mt-1">
            Sistem ini menggunakan machine learning dengan akurasi tinggi untuk
            memetakan pola dari data di atas menjadi rekomendasi tanam yang
            presisi.
          </p>
        </div>
      </div>
    </div>
  );
}
