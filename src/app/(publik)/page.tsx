"use client";

import { useState, useEffect } from "react";
import {
  Leaf,
  Calendar,
  Droplets,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  CloudRain,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

export default function Homepage() {
  const [tanahList, setTanahList] = useState<any[]>([]);
  const [loadingTanah, setLoadingTanah] = useState(true);

  // Form State - MULTI BULAN (array)
  const [selectedTanah, setSelectedTanah] = useState("");
  const [selectedBulanList, setSelectedBulanList] = useState<string[]>([
    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
  ]);

  // Hasil State
  const [loadingPrediksi, setLoadingPrediksi] = useState(false);
  const [hasilPrediksi, setHasilPrediksi] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [manualTanah, setManualTanah] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
  });
  // Fetch Master Tanah saat halaman dibuka
  useEffect(() => {
    const fetchTanah = async () => {
      try {
        const res = await fetch("/api/master-tanah");
        const json = await res.json();
        if (json.status === "success") {
          setTanahList(json.data);
          if (json.data.length > 0)
            setSelectedTanah(json.data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTanah(false);
      }
    };
    fetchTanah();
  }, []);

  const handlePrediksi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedBulanList.length === 0) {
      setErrorMsg("Pilih minimal 1 bulan untuk dianalisis");
      return;
    }

    setLoadingPrediksi(true);
    setHasilPrediksi(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/prediksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tanah: !isExpertMode ? Number(selectedTanah) : null,
          filter_bulan: selectedBulanList,
          is_expert: isExpertMode,
          manual_tanah: isExpertMode
            ? {
                N: parseFloat(manualTanah.N),
                P: parseFloat(manualTanah.P),
                K: parseFloat(manualTanah.K),
                ph: parseFloat(manualTanah.ph),
              }
            : null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setHasilPrediksi(data);
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan");
      }
    } catch (err) {
      setErrorMsg("Gagal menghubungi server prediksi.");
    } finally {
      setLoadingPrediksi(false);
    }
  };

  const toggleBulan = (bulan: string) => {
    setSelectedBulanList((prev) => {
      if (prev.includes(bulan)) {
        return prev.filter((b) => b !== bulan);
      } else {
        return [...prev, bulan];
      }
    });
  };

  const selectAllBulan = () => {
    setSelectedBulanList([...bulanList]);
  };

  const clearAllBulan = () => {
    setSelectedBulanList([]);
  };

  const bulanList = [
    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
    "MEI",
    "JUNI",
    "JULI",
    "AGUSTUS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DESEMBER",
  ];

  // Helper untuk badge status
  const getStatusBadge = (status: string) => {
    if (status === "DIREKOMENDASIKAN") {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "✓ DIREKOMENDASIKAN",
      };
    }
    return {
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      bg: "bg-red-100",
      text: "text-red-800",
      label: "✗ TIDAK DIREKOMENDASIKAN",
    };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* HEADER SECTION */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-700 text-sm font-semibold">
            <TrendingUp size={16} />
            AI Precision Agriculture
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Cek Kecocokan{" "}
            <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Masa Tanam
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gunakan kecerdasan buatan untuk memprediksi apakah lahan Anda cocok
            untuk ditanami padi pada periode tertentu berdasarkan data cuaca.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
          <div className="h-2 bg-linear-to-r from-green-500 to-emerald-500"></div>
          <form onSubmit={handlePrediksi} className="p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Kondisi Lahan */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Leaf size={18} className="text-green-600" />
                    Kondisi Lahan Saat Ini
                  </label>

                  {/* Checkbox Expert Mode */}
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-green-600 transition">
                    <input
                      type="checkbox"
                      className="rounded text-green-600 focus:ring-green-500"
                      checked={isExpertMode}
                      onChange={(e) => setIsExpertMode(e.target.checked)}
                    />
                    Saya tahu nilai NPK tanah saya
                  </label>
                </div>

                {isExpertMode ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-green-50 p-3 rounded-xl border border-green-200 animate-in fade-in zoom-in duration-300">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nitrogen (N)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Misal: 85"
                        value={manualTanah.N}
                        onChange={(e) =>
                          setManualTanah({ ...manualTanah, N: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Fosfor (P)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Misal: 45"
                        value={manualTanah.P}
                        onChange={(e) =>
                          setManualTanah({ ...manualTanah, P: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Kalium (K)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Misal: 40"
                        value={manualTanah.K}
                        onChange={(e) =>
                          setManualTanah({ ...manualTanah, K: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        pH Tanah
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Misal: 6.5"
                        value={manualTanah.ph}
                        onChange={(e) =>
                          setManualTanah({ ...manualTanah, ph: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : // Dropdown Master Tanah Bawaan Lo
                loadingTanah ? (
                  <div className="p-3 border rounded-xl text-sm text-gray-500 animate-pulse bg-gray-50">
                    <Loader2 className="animate-spin inline mr-2" size={16} />
                    Memuat data tanah...
                  </div>
                ) : (
                  <select
                    value={selectedTanah}
                    onChange={(e) => setSelectedTanah(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50 transition-all"
                  >
                    {tanahList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.kondisi_lahan}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Info Ringkasan */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Calendar size={18} className="text-blue-500" />
                  Ringkasan Pilihan
                </label>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bulan terpilih:</span>
                    <span className="font-bold text-gray-900">
                      {selectedBulanList.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-sm text-green-600 font-medium">
                      {selectedBulanList.length > 0
                        ? "Siap dianalisis"
                        : "Pilih minimal 1 bulan"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilihan Bulan - Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <CloudRain size={18} className="text-blue-500" />
                  Pilih Bulan Tanam (Multi-select)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllBulan}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={clearAllBulan}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {bulanList.map((bulan) => {
                  const isSelected = selectedBulanList.includes(bulan);
                  return (
                    <button
                      key={bulan}
                      type="button"
                      onClick={() => toggleBulan(bulan)}
                      className={`
                        p-2 rounded-lg text-sm font-medium transition-all
                        ${
                          isSelected
                            ? "bg-green-500 text-white shadow-md scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {bulan.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Klik bulan untuk memilih/membatalkan. Pilih beberapa bulan
                untuk analisis periode tanam.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                loadingPrediksi ||
                tanahList.length === 0 ||
                selectedBulanList.length === 0
              }
              className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loadingPrediksi ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Menganalisis {selectedBulanList.length} bulan...
                </>
              ) : (
                <>
                  <Droplets size={20} />
                  Analisis Periode Tanam
                </>
              )}
            </button>
          </form>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle size={20} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HASIL PREDIKSI - MULTI BULAN */}
        {hasilPrediksi && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            {/* Summary Card */}
            <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={24} />
                <h3 className="text-lg font-semibold">Ringkasan Analisis AI</h3>
              </div>
              <p className="text-green-100 mb-4">
                {hasilPrediksi.summary?.pesan}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-sm opacity-90">✓ Direkomendasikan</div>
                  <div className="font-bold text-xl">
                    {hasilPrediksi.summary?.rekomendasi?.length || 0} bulan
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-sm opacity-90">
                    ✗ Tidak Direkomendasikan
                  </div>
                  <div className="font-bold text-xl">
                    {hasilPrediksi.summary?.tidak_direkomendasikan?.length || 0}{" "}
                    bulan
                  </div>
                </div>
              </div>
            </div>

            {/* Detail per Bulan - Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} />
                  Detail Analisis Per Bulan
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bulan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Curah Hujan (mm)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hasilPrediksi.data?.map((item: any, idx: number) => {
                      const status = getStatusBadge(item.status_padi);
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {item.bulan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            <div className="flex items-center gap-2">
                              <CloudRain size={14} className="text-blue-400" />
                              {item.curah_hujan} mm
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Metadata / Sumber Data */}
            {hasilPrediksi.metadata && (
              <div className="text-center text-xs text-gray-400">
                {hasilPrediksi.metadata.sumber_data} •{" "}
                {hasilPrediksi.metadata.waktu_prediksi?.split("T")[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
