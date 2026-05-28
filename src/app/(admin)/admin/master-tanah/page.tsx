"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import ModalWrapper from "@/components/modal/ModalWrapper";
import TableSkeleton from "@/components/skeleton/TableMasterTanahSkeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const initialFormState = {
  id: null,
  kondisi_lahan: "",
  nilai_n: "",
  nilai_p: "",
  nilai_k: "",
  nilai_ph: "",
  keterangan: "",
};

export default function MasterTanahPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 5;

  // Modal States
  const [formData, setFormData] = useState<any>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Ambil Data
  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/master-tanah?page=${page}&limit=${limit}&search=${search}`,
      );
      const json = await res.json();
      if (json.status === "success") {
        setData(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
      }
    } catch (err) {
      console.error("Gagal ambil data", err);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setFormData(item);
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Simpan (POST / PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalMode === "add" ? "POST" : "PUT";

    const payload = {
      ...formData,
      id_user: user?.id || null,
    };

    try {
      const res = await fetch("/api/master-tanah", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData(currentPage, searchTerm);
        Swal.fire({
          icon: "success",
          title: `Data berhasil ${modalMode === "add" ? "ditambahkan" : "diupdate"}`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const err = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data",
          text: err.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan data",
        text: "Terjadi kesalahan saat menyimpan data.",
      });
    }
  };

  // Hapus (DELETE)
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/master-tanah?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        if (data.length === 1 && currentPage > 1)
          setCurrentPage((prev) => prev - 1);
        else fetchData(currentPage, searchTerm);
        Swal.fire({
          icon: "success",
          title: "Data berhasil dihapus",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus data",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch(
        `/api/master-tanah?limit=1000&search=${searchTerm}`,
      );
      const json = await res.json();

      if (json.status === "success") {
        const dataSiapExport = json.data.map((item: any, index: number) => ({
          No: index + 1,
          "Kondisi Lahan": item.kondisi_lahan,
          "Nitrogen (N)": item.nilai_n,
          "Fosfor (P)": item.nilai_p,
          "Kalium (K)": item.nilai_k,
          "pH Tanah": item.nilai_ph,
          Keterangan: item.keterangan || "-",
        }));

        const ws = XLSX.utils.json_to_sheet(dataSiapExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Master Data Tanah");

        const tanggal = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `Master_Data_Tanah_${tanggal}.xlsx`);

        Swal.fire({
          icon: "success",
          title: "Export Excel berhasil",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengekspor data",
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Master Data Tanah
            </h2>
            <p className="text-sm text-gray-500 max-w-xl">
              Nilai kandungan kimia ini (N, P, K, pH) akan digunakan sebagai
              nilai bawaan (default) saat petani memilih kondisi lahan mereka di
              form prediksi.
            </p>
          </div>

          <div className="col-span-3 grid-cols-1 gap-4 w-full">
            <div className="flex justify-end mb-2 gap-1 md:gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 text-green-600 hover:bg-green-700 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 border border-green-600 hover:border-green-700"
              >
                <FileSpreadsheet size={16} />
                Ekspor Excel
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                <Plus size={16} /> Tambah Data
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Cari lahan..."
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

        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-semibold">Kondisi Lahan</th>
                    <th className="p-4 font-semibold text-center">N</th>
                    <th className="p-4 font-semibold text-center">P</th>
                    <th className="p-4 font-semibold text-center">K</th>
                    <th className="p-4 font-semibold text-center">pH</th>
                    <th className="p-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-800">
                          {item.kondisi_lahan}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {item.nilai_n}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {item.nilai_p}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {item.nilai_k}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {item.nilai_ph}
                        </td>
                        <td className="p-4 text-center space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors inline-flex"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors inline-flex"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Pencarian tidak menemukan data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
              <span className="text-sm text-gray-500">
                Menampilkan <span className="font-semibold">{data.length}</span>{" "}
                dari <span className="font-semibold">{totalItems}</span> data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-lg border">
                  Halaman {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || totalPages === 0}
                  className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODALS TETAP SAMA */}
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Data Lahan" : "Edit Data Lahan"}
      >
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
              Kondisi Lahan
            </label>
            <input
              type="text"
              required
              placeholder="Cth: Subur (Lahan Basah)"
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              value={formData.kondisi_lahan}
              onChange={(e) =>
                setFormData({ ...formData, kondisi_lahan: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Nitrogen (N)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                value={formData.nilai_n}
                onChange={(e) =>
                  setFormData({ ...formData, nilai_n: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Fosfor (P)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                value={formData.nilai_p}
                onChange={(e) =>
                  setFormData({ ...formData, nilai_p: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Kalium (K)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                value={formData.nilai_k}
                onChange={(e) =>
                  setFormData({ ...formData, nilai_k: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                pH Tanah
              </label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                value={formData.nilai_ph}
                onChange={(e) =>
                  setFormData({ ...formData, nilai_ph: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
              Keterangan Sumber
            </label>
            <input
              type="text"
              required
              placeholder="Cth: Asumsi Rata-rata"
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end pt-4 mt-2 border-t">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-green-600/20"
            >
              <Save size={18} /> Simpan Data
            </button>
          </div>
        </form>
      </ModalWrapper>

      <ModalWrapper
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Lahan?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Anda yakin ingin menghapus data <b>{itemToDelete?.kondisi_lahan}</b>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md shadow-red-600/20"
            >
              Ya, Hapus!
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
