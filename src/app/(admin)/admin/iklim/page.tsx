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
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import ModalWrapper from "@/components/modal/ModalWrapper";
import TableSkeleton from "@/components/skeleton/TableIklimSkeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import Swal from "sweetalert2";

const initialFormState = {
  id: "",
  bulan: "JANUARI",
  tahun_berlaku: new Date().getFullYear(),
  curah_hujan_mm: "",
  suhu_rata_rata: "27.5",
  kelembapan_persen: "80",
  keterangan_sumber: "",
};

export default function KelolaIklimPage() {
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

  // Modal Normal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<any>(initialFormState);

  // Modal Hapus States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Tahun: 2024,
        Bulan: "JANUARI",
        "Curah Hujan (mm)": 150.5,
        "Suhu (°C)": 26.5,
        "Kelembapan (%)": 82,
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Iklim");
    XLSX.writeFile(wb, "Template_Upload_Iklim.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);

      const formattedData = rawData.map((row: any) => ({
        id_user: user?.id || null,
        username: user?.username || "Unknown",
        tahun_berlaku: row["Tahun"] || new Date().getFullYear(),
        bulan: row["Bulan"] || "JANUARI",
        curah_hujan_mm: parseFloat(row["Curah Hujan (mm)"] || 0),
        suhu_rata_rata: parseFloat(row["Suhu (°C)"] || 27.5),
        kelembapan_persen: parseFloat(row["Kelembapan (%)"] || 80),
        keterangan_sumber: "Upload Excel",
      }));

      setPreviewData(formattedData);
      setIsPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handlePreviewChange = (index: number, field: string, value: string) => {
    const newData = [...previewData];
    newData[index][field] = value;
    setPreviewData(newData);
  };

  const handleSavePreview = async () => {
    try {
      const res = await fetch("/api/iklim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      if (res.ok) {
        setIsPreviewModalOpen(false);
        setPreviewData([]);
        fetchData(1, "");

        Swal.fire({
          icon: "success",
          title: "Data berhasil disimpan",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const err = await res.json();

        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data",
          text: err.message,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan server",
      });
    }
  };

  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/iklim?page=${page}&limit=${limit}&search=${search}`,
      );
      const json = await response.json();
      if (json.status === "success") {
        setData(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
      }
    } catch (err) {
      console.error("Error fetching", err);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data iklim",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalMode === "tambah" ? "POST" : "PUT";

    const payload = {
      ...formData,
      id_user: user?.id || null,
      username: user?.username || "Unknown",
    };

    try {
      const res = await fetch("/api/iklim", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData(currentPage, searchTerm);
        setFormData(initialFormState);

        Swal.fire({
          icon: "success",
          title: `Data berhasil ${modalMode === "tambah" ? "ditambahkan" : "diperbarui"}`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const err = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data",
          text: err.message,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan server",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/iklim?id=${itemToDelete.id}`, {
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
      const res = await fetch(`/api/iklim?limit=1000&search=${searchTerm}`);
      const json = await res.json();

      if (json.status === "success") {
        const dataSiapExport = json.data.map((item: any, index: number) => ({
          No: index + 1,
          Tahun: item.tahun_berlaku,
          Bulan: item.bulan,
          "Curah Hujan (mm)": item.curah_hujan_mm,
          "Suhu (°C)": item.suhu_rata_rata,
          "Kelembapan (%)": item.kelembapan_persen,
          Keterangan: item.keterangan_sumber || "-",
        }));

        const ws = XLSX.utils.json_to_sheet(dataSiapExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Iklim");

        const tanggal = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `Rekap_Data_Iklim_${tanggal}.xlsx`);

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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* HEADER & SEARCH BAR */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Kelola Data Iklim
            </h2>
            <p className="text-gray-500 text-sm max-w-xl">
              Input data cuaca bulanan via form, atau gunakan fitur Excel untuk
              upload massal sekaligus.
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-3 h-fit">
            {/* Action Buttons */}
            <div className="col-span-2 gap-2 flex flex-wrap justify-end md:px-3">
              <button
                onClick={downloadTemplate}
                className="flex whitespace-nowrap items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} /> Template
              </button>

              <label className="flex whitespace-nowrap items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Upload size={16} /> Upload
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <button
                onClick={handleExportExcel}
                className="flex whitespace-nowrap items-center gap-2 text-green-600 hover:bg-green-700 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-green-600 hover:border-green-700"
              >
                <FileSpreadsheet size={16} /> Export Excel
              </button>

              <button
                onClick={() => {
                  setModalMode("tambah");
                  setFormData(initialFormState);
                  setIsModalOpen(true);
                }}
                className="flex whitespace-nowrap items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Tambah
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="search"
                placeholder="Cari tahun / bulan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {data.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  Pencarian tidak menemukan data iklim.
                </div>
              ) : (
                data.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-800 text-base">
                          {item.tahun_berlaku}
                        </span>
                        <span className="text-gray-600 text-sm ml-2">
                          {item.bulan}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setModalMode("edit");
                            setFormData({ ...item });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">C. Hujan</p>
                        <p className="text-blue-600 font-medium">
                          {item.curah_hujan_mm} mm
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Suhu</p>
                        <p className="text-orange-500 font-medium">
                          {item.suhu_rata_rata} °C
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Lembab</p>
                        <p className="text-teal-600 font-medium">
                          {item.kelembapan_persen}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse min-w-150">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs sm:text-sm border-b border-gray-200">
                    <th className="p-3 sm:p-4 font-semibold">Tahun</th>
                    <th className="p-3 sm:p-4 font-semibold">Bulan</th>
                    <th className="p-3 sm:p-4 font-semibold text-right">
                      C. Hujan (mm)
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-right">
                      Suhu (°C)
                    </th>
                    <th className="p-3 sm:p-4 font-semibold text-right">
                      Lembab (%)
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
                        Pencarian tidak menemukan data iklim.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 sm:p-4 font-bold text-gray-800 text-sm">
                          {item.tahun_berlaku}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-600 text-sm">
                          {item.bulan}
                        </td>
                        <td className="p-3 sm:p-4 text-blue-600 font-medium text-right text-sm">
                          {item.curah_hujan_mm}
                        </td>
                        <td className="p-3 sm:p-4 text-orange-500 font-medium text-right text-sm">
                          {item.suhu_rata_rata}
                        </td>
                        <td className="p-3 sm:p-4 text-teal-600 font-medium text-right text-sm">
                          {item.kelembapan_persen}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => {
                                setModalMode("edit");
                                setFormData({ ...item });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                            >
                              <Edit2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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

      {/* Preview Modal */}
      <ModalWrapper
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Preview Data Excel (Editable)"
        maxWidth="max-w-4xl"
      >
        <div className="p-4 sm:p-5">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-4">
            <b>Perhatian:</b> Silakan periksa kembali data di bawah ini. Anda
            bisa mengedit angkanya langsung di dalam kotak tabel jika ada
            kesalahan sebelum menyimpannya ke sistem.
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[50vh] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-125">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200">
                    Tahun
                  </th>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200">
                    Bulan
                  </th>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200">
                    C. Hujan (mm)
                  </th>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200">
                    Suhu (°C)
                  </th>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200">
                    Lembab (%)
                  </th>
                  <th className="p-2 sm:p-3 font-semibold border-b border-gray-200 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-1.5 sm:p-2">
                      <input
                        type="number"
                        className="w-16 sm:w-20 p-1 sm:p-1.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={row.tahun_berlaku}
                        onChange={(e) =>
                          handlePreviewChange(
                            idx,
                            "tahun_berlaku",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-1.5 sm:p-2">
                      <input
                        type="text"
                        className="w-20 sm:w-24 p-1 sm:p-1.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 uppercase text-sm"
                        value={row.bulan}
                        onChange={(e) =>
                          handlePreviewChange(idx, "bulan", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-1.5 sm:p-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 sm:w-full p-1 sm:p-1.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={row.curah_hujan_mm}
                        onChange={(e) =>
                          handlePreviewChange(
                            idx,
                            "curah_hujan_mm",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-1.5 sm:p-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 sm:w-full p-1 sm:p-1.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={row.suhu_rata_rata}
                        onChange={(e) =>
                          handlePreviewChange(
                            idx,
                            "suhu_rata_rata",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-1.5 sm:p-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 sm:w-full p-1 sm:p-1.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={row.kelembapan_persen}
                        onChange={(e) =>
                          handlePreviewChange(
                            idx,
                            "kelembapan_persen",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-1.5 sm:p-2 text-center">
                      <button
                        onClick={() =>
                          setPreviewData(
                            previewData.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-4 sm:pt-5 border-t border-gray-100 mt-3 sm:mt-4">
            <button
              onClick={handleSavePreview}
              className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all shadow-md text-sm sm:text-base"
            >
              <Upload size={16} className="sm:w-4 sm:h-4" /> Simpan Data Excel
              ke Database
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Form Modal */}
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "tambah" ? "Input Data Iklim" : "Edit Data Iklim"}
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
                className="w-full border rounded-lg p-2 sm:p-2.5 text-sm"
                value={formData.tahun_berlaku}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tahun_berlaku: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Bulan
              </label>
              <select
                className="w-full border rounded-lg p-2 sm:p-2.5 text-sm"
                value={formData.bulan}
                onChange={(e) =>
                  setFormData({ ...formData, bulan: e.target.value })
                }
              >
                {[
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
                ].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                C. Hujan (mm)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2 sm:p-2.5 text-sm"
                value={formData.curah_hujan_mm}
                onChange={(e) =>
                  setFormData({ ...formData, curah_hujan_mm: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Suhu (°C)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2 sm:p-2.5 text-sm"
                value={formData.suhu_rata_rata}
                onChange={(e) =>
                  setFormData({ ...formData, suhu_rata_rata: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Lembab (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded-lg p-2 sm:p-2.5 text-sm"
                value={formData.kelembapan_persen}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kelembapan_persen: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 sm:pt-5 border-t">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base"
            >
              <Save size={16} className="sm:w-4 sm:h-4" /> Simpan
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
          <AlertCircle
            size={28}
            className="sm:w-8 sm:h-8 text-red-600 mx-auto mb-3 sm:mb-4"
          />
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
            Hapus Data?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
            Yakin menghapus data{" "}
            <b>
              {itemToDelete?.bulan} {itemToDelete?.tahun_berlaku}
            </b>
            ?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg text-sm"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-sm"
            >
              Ya, Hapus!
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
