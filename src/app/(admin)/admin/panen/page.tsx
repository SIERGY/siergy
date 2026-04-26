"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Wheat,
  FileSpreadsheet, 
} from "lucide-react";
import ModalWrapper from "@/components/modal/ModalWrapper";
import TableSkeleton from "@/components/skeleton/TablePanenSkeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import * as XLSX from "xlsx";

const initialFormState = {
  id: "",
  id_tanah: "",
  tahun: new Date().getFullYear(),
  musim_tanam: "Tahunan",
  luas_lahan_ha: "",
  total_produksi_ton: "",
};

export default function KelolaPanenPage() {
  const { user } = useAuthStore();

  const [data, setData] = useState<any[]>([]);
  const [tanahList, setTanahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 5;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<any>(initialFormState);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchMasterTanah = async () => {
    try {
      const res = await fetch("/api/master-tanah?limit=100");
      const json = await res.json();
      if (json.status === "success") setTanahList(json.data);
    } catch (err) {
      console.error("Error fetching tanah", err);
    }
  };

  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/panen?page=${page}&limit=${limit}&search=${search}`,
      );
      const json = await res.json();
      if (json.status === "success") {
        setData(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
      }
    } catch (err) {
      console.error("Error fetching", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterTanah();
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const handleTambah = () => {
    setModalMode("tambah");
    setFormData({
      ...initialFormState,
      id_tanah: tanahList.length > 0 ? tanahList[0].id : "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setModalMode("edit");
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/panen?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        if (data.length === 1 && currentPage > 1)
          setCurrentPage((prev) => prev - 1);
        else fetchData(currentPage, searchTerm);
      }
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalMode === "tambah" ? "POST" : "PUT";

    const payload = {
      ...formData,
      id_user: user?.id || null,
    };

    try {
      const res = await fetch("/api/panen", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchData(currentPage, searchTerm);
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch(`/api/panen?limit=1000&search=${searchTerm}`);
      const json = await res.json();

      if (json.status === "success") {
        const dataSiapExport = json.data.map((item: any, index: number) => ({
          "No": index + 1,
          "Tahun": item.tahun,
          "Musim Tanam": item.musim_tanam,
          "Profil Lahan": item.kondisi_lahan || "Lahan Tidak Diketahui",
          "Luas Lahan (Ha)": parseFloat(item.luas_lahan_ha),
          "Total Produksi (Ton)": parseFloat(item.total_produksi_ton),
          "Produktivitas (Ton/Ha)": parseFloat((item.total_produksi_ton / item.luas_lahan_ha).toFixed(2)),
        }));

        const ws = XLSX.utils.json_to_sheet(dataSiapExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Histori Panen");

        const tanggal = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Rekap_Data_Panen_${tanggal}.xlsx`);
      }
    } catch (error) {
      alert("Gagal melakukan export Excel!");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* HEADER & SEARCH BAR */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Kelola Data Panen
            </h2>
            <p className="text-gray-500 text-sm max-w-xl">
              Catat histori produksi padi Desa Pisangsambo setiap musim.
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-3 h-fit">
            <div className="flex justify-end gap-1 md:gap-2 md:px-3">
              
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 text-green-600 hover:bg-green-700 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 border border-green-600 hover:border-green-700"
              >
                <FileSpreadsheet size={16} /> Export Excel
              </button>

              <button
                onClick={handleTambah}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                <Plus size={16} /> Tambah Data
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Cari tahun / musim..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
              />
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <button type="submit" className="hidden"></button>
            </form>
          </div>
        </div>

        {/* KONTEN TABEL ATAU SKELETON */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {data.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  Pencarian tidak menemukan data histori panen.
                </div>
              ) : (
                data.map((item) => {
                  const produktivitas = (
                    parseFloat(item.total_produksi_ton) /
                    parseFloat(item.luas_lahan_ha)
                  ).toFixed(2);
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-gray-800 text-lg">
                            {item.tahun}
                          </span>
                          <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 ml-2 mb-1">
                            {item.musim_tanam}
                          </span>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Wheat size={12} />{" "}
                            {item.kondisi_lahan || "Lahan Tidak Diketahui"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-200">
                        <div>
                          <p className="text-gray-500 text-xs">Luas Lahan</p>
                          <p className="font-medium text-gray-700">
                            {item.luas_lahan_ha} Ha
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">
                            Total Produksi
                          </p>
                          <p className="font-medium text-gray-700">
                            {item.total_produksi_ton} Ton
                          </p>
                        </div>
                        <div className="col-span-2 bg-green-50 p-2 rounded flex justify-between items-center border border-green-100">
                          <span className="text-green-800 text-xs font-bold">
                            Produktivitas
                          </span>
                          <span className="text-green-700 font-black">
                            {produktivitas} Ton/Ha
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs sm:text-sm border-b border-gray-200">
                    <th className="p-3 sm:p-4 font-semibold">Tahun</th>
                    <th className="p-3 sm:p-4 font-semibold">Musim / Lahan</th>
                    <th className="p-3 sm:p-4 font-semibold text-right">
                      Luas (Ha)
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-right">
                      Produksi (Ton)
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-right text-blue-600">
                      Prod. (Ton/Ha)
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Pencarian tidak menemukan data histori panen.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => {
                      const produktivitas = (
                        parseFloat(item.total_produksi_ton) /
                        parseFloat(item.luas_lahan_ha)
                      ).toFixed(2);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 sm:p-4 font-bold text-gray-800 text-sm">
                            {item.tahun}
                          </td>
                          <td className="p-3 sm:p-4 text-gray-600 text-sm">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 font-medium">
                              {item.musim_tanam}
                            </span>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Wheat size={12} /> {item.kondisi_lahan || "-"}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-gray-600 text-right text-sm">
                            {item.luas_lahan_ha}
                          </td>
                          <td className="p-3 sm:p-4 text-gray-600 text-right font-medium text-sm">
                            {item.total_produksi_ton}
                          </td>
                          <td className="p-3 sm:p-4 text-blue-600 font-bold text-right text-sm bg-blue-50/30">
                            {produktivitas}
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                                title="Edit"
                              >
                                <Edit2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                                title="Hapus"
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
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

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-5 sm:mt-6 pt-4 border-t border-gray-100 gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Menampilkan <span className="font-semibold">{data.length}</span>{" "}
                dari <span className="font-semibold">{totalItems}</span> data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
                </button>
                <span className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-lg border">
                  Halaman {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || totalPages === 0}
                  className="p-1.5 sm:p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <ChevronRight size={16} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "tambah" ? "Tambah Histori Panen" : "Edit Data Panen"
        }
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Tahun
              </label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                value={formData.tahun}
                onChange={(e) =>
                  setFormData({ ...formData, tahun: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Musim Tanam
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                value={formData.musim_tanam}
                onChange={(e) =>
                  setFormData({ ...formData, musim_tanam: e.target.value })
                }
              >
                <option value="Tahunan">Setahun Penuh</option>
                <option value="Rendeng">Rendeng (Hujan)</option>
                <option value="Gadu">Gadu (Kemarau)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
              Profil Lahan Pertanian
            </label>
            <select
              required
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-gray-50"
              value={formData.id_tanah}
              onChange={(e) =>
                setFormData({ ...formData, id_tanah: e.target.value })
              }
            >
              <option value="" disabled>
                -- Pilih Lahan --
              </option>
              {tanahList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.kondisi_lahan}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Luas Lahan Panen (Ha)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Contoh: 1200"
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 pr-10 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  value={formData.luas_lahan_ha}
                  onChange={(e) =>
                    setFormData({ ...formData, luas_lahan_ha: e.target.value })
                  }
                />
                <span className="absolute right-3 top-2 sm:top-2.5 text-sm text-gray-400 font-medium">
                  Ha
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Total Produksi (Ton)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Contoh: 7500"
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 pr-12 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  value={formData.total_produksi_ton}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_produksi_ton: e.target.value,
                    })
                  }
                />
                <span className="absolute right-3 top-2 sm:top-2.5 text-sm text-gray-400 font-medium">
                  Ton
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 sm:pt-5 border-t border-gray-100 mt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all active:scale-95 shadow-md shadow-green-600/20"
            >
              <Save size={16} className="sm:w-4 sm:h-4" /> Simpan Data
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Delete Modal */}
      <ModalWrapper
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="p-5 sm:p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 mb-3 sm:mb-4">
            <AlertCircle size={28} className="text-red-600 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
            Hapus Histori Panen?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
            Anda yakin menghapus data panen tahun <b>{itemToDelete?.tahun}</b>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-sm transition-colors shadow-md shadow-red-600/20"
            >
              Ya, Hapus!
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
