"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Users,
  CloudRain,
  Wheat,
  Activity,
  CheckCircle,
  Calendar,
  Printer, // 🌟 Tambahan icon Printer
} from "lucide-react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const panenChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.status === "success") {
          setData(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useLayoutEffect(() => {
    if (!data || !data.grafik_bar || !data.grafik_pie || !data.grafik_panen)
      return;

    const maybeDisposeRoot = (divId: string) => {
      am5.array.each(am5.registry.rootElements, (root) => {
        if (root && root.dom.id === divId) {
          root.dispose();
        }
      });
    };

    maybeDisposeRoot("panen-chart");
    maybeDisposeRoot("bar-chart");
    maybeDisposeRoot("pie-chart");

    const rootPanen = am5.Root.new(panenChartRef.current!);
    const rootBar = am5.Root.new(barChartRef.current!);
    const rootPie = am5.Root.new(pieChartRef.current!);

    rootPanen.setThemes([am5themes_Animated.new(rootPanen)]);
    rootBar.setThemes([am5themes_Animated.new(rootBar)]);
    rootPie.setThemes([am5themes_Animated.new(rootPie)]);

    if (rootPanen._logo) rootPanen._logo.dispose();
    if (rootPie._logo) rootPie._logo.dispose();
    if (rootBar._logo) rootBar._logo.dispose();

    // ==========================================
    // 1. GRAFIK HISTORIS PANEN
    // ==========================================
    const chartPanen = rootPanen.container.children.push(
      am5xy.XYChart.new(rootPanen, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: rootPanen.verticalLayout,
      }),
    );

    const xRendererPanen = am5xy.AxisRendererX.new(rootPanen, {
      minGridDistance: 30,
    });
    const xAxisPanen = chartPanen.xAxes.push(
      am5xy.CategoryAxis.new(rootPanen, {
        categoryField: "tahun",
        renderer: xRendererPanen,
        tooltip: am5.Tooltip.new(rootPanen, {}),
      }),
    );

    const yAxisLahan = chartPanen.yAxes.push(
      am5xy.ValueAxis.new(rootPanen, {
        renderer: am5xy.AxisRendererY.new(rootPanen, {}),
      }),
    );

    const yRendererProd = am5xy.AxisRendererY.new(rootPanen, {
      opposite: true,
    });
    const yAxisProd = chartPanen.yAxes.push(
      am5xy.ValueAxis.new(rootPanen, { renderer: yRendererProd }),
    );

    const seriesLahan = chartPanen.series.push(
      am5xy.ColumnSeries.new(rootPanen, {
        name: "Luas Lahan (Ha)",
        xAxis: xAxisPanen,
        yAxis: yAxisLahan,
        valueYField: "luas_lahan_ha",
        categoryXField: "tahun",
        tooltip: am5.Tooltip.new(rootPanen, {}),
      }),
    );
    seriesLahan.columns.template.setAll({
      fill: am5.color(0x3b82f6),
      strokeOpacity: 0,
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      tooltipText: "Luas: {valueY} Ha",
      tooltipY: 0,
    });

    const seriesProd = chartPanen.series.push(
      am5xy.LineSeries.new(rootPanen, {
        name: "Total Produksi (Ton)",
        xAxis: xAxisPanen,
        yAxis: yAxisProd,
        valueYField: "total_produksi_ton",
        categoryXField: "tahun",
        tooltip: am5.Tooltip.new(rootPanen, {}),
      }),
    );
    seriesProd.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0xf59e0b),
      tooltipText: "Produksi: {valueY} Ton",
    });
    seriesProd.bullets.push(() =>
      am5.Bullet.new(rootPanen, {
        sprite: am5.Circle.new(rootPanen, {
          radius: 5,
          fill: am5.color(0xf59e0b),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          tooltipText: "Produksi: {valueY} Ton",
        }),
      }),
    );

    const legendPanen = chartPanen.children.push(
      am5.Legend.new(rootPanen, { centerX: am5.p50, x: am5.p50 }),
    );
    legendPanen.data.setAll(chartPanen.series.values);

    const panenDataFormatted = data.grafik_panen.map((item: any) => ({
      tahun: item.tahun.toString(),
      luas_lahan_ha: parseFloat(item.luas_lahan_ha),
      total_produksi_ton: parseFloat(item.total_produksi_ton),
    }));
    xAxisPanen.data.setAll(panenDataFormatted);
    seriesLahan.data.setAll(panenDataFormatted);
    seriesProd.data.setAll(panenDataFormatted);

    seriesLahan.appear(1000);
    seriesProd.appear(1000);
    chartPanen.appear(1000, 100);

    // ==========================================
    // 2. BAR CHART
    // ==========================================
    const chartBar = rootBar.container.children.push(
      am5xy.XYChart.new(rootBar, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 1,
      }),
    );

    let cursor = chartBar.set("cursor", am5xy.XYCursor.new(rootBar, {}));
    cursor.lineY.set("visible", false);

    let xRendererBar = am5xy.AxisRendererX.new(rootBar, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });
    xRendererBar.labels.template.setAll({
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });
    xRendererBar.grid.template.setAll({ location: 1 });

    const xAxisBar = chartBar.xAxes.push(
      am5xy.CategoryAxis.new(rootBar, {
        maxDeviation: 0.3,
        categoryField: "tanggal",
        renderer: xRendererBar,
        tooltip: am5.Tooltip.new(rootBar, {}),
      }),
    );

    const yAxisBar = chartBar.yAxes.push(
      am5xy.ValueAxis.new(rootBar, {
        renderer: am5xy.AxisRendererY.new(rootBar, { strokeOpacity: 0.1 }),
        maxDeviation: 0.3,
      }),
    );

    const seriesBar = chartBar.series.push(
      am5xy.ColumnSeries.new(rootBar, {
        name: "Akses",
        xAxis: xAxisBar,
        yAxis: yAxisBar,
        valueYField: "jumlah",
        sequencedInterpolation: true,
        categoryXField: "tanggal",
        tooltip: am5.Tooltip.new(rootBar, { labelText: "{jumlah} Prediksi" }),
      }),
    );

    seriesBar.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      fill: am5.color(0x059669),
      strokeOpacity: 0,
      tooltipText: "Tanggal: {categoryX}\nTotal: {valueY} Prediksi",
      tooltipY: 0,
    });

    const barDataFormatted = data.grafik_bar.map((item: any) => ({
      tanggal: item.tanggal,
      jumlah: parseInt(item.jumlah),
    }));
    xAxisBar.data.setAll(barDataFormatted);
    seriesBar.data.setAll(barDataFormatted);

    seriesBar.appear(1000);
    chartBar.appear(1000, 100);

    // ==========================================
    // 3. PIE CHART
    // ==========================================
    const chartPie = rootPie.container.children.push(
      am5percent.PieChart.new(rootPie, {
        layout: rootPie.verticalLayout,
        innerRadius: am5.percent(50),
      }),
    );

    const seriesPie = chartPie.series.push(
      am5percent.PieSeries.new(rootPie, {
        valueField: "value",
        categoryField: "name",
        alignLabels: false,
      }),
    );

    seriesPie
      .get("colors")
      ?.set("colors", [am5.color(0x10b981), am5.color(0xef4444)]);
    seriesPie.labels.template.set("forceHidden", true);
    seriesPie.ticks.template.set("forceHidden", true);
    seriesPie.slices.template.set("tooltipText", "{category}: {value} Bulan");

    const pieDataFormatted = data.grafik_pie.map((item: any) => ({
      name: item.name,
      value: parseInt(item.value),
    }));
    seriesPie.data.setAll(pieDataFormatted);

    const legendPie = chartPie.children.push(
      am5.Legend.new(rootPie, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      }),
    );
    legendPie.data.setAll(seriesPie.dataItems);

    seriesPie.appear(1000, 100);

    return () => {
      rootPanen.dispose();
      rootBar.dispose();
      rootPie.dispose();
    };
  }, [data]);

  // 🌟 FUNGSI CETAK PDF
  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    // 🌟 Tambahan print:bg-white print:p-0 agar background bersih saat di-print
    <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:p-0">
      {/* 1. HEADER SECTION - Disembunyikan saat Print */}
      <div className="bg-linear-to-r from-green-700 to-emerald-600 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg text-white print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold">
            Selamat Datang, Administrator! 👋
          </h1>
          <p className="text-green-50 mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm md:text-base">
            Ini adalah pusat analitik Sistem Prediksi Masa Tanam Desa
            Pisangsambo.
          </p>
        </div>
        {/* Tombol Export PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-white text-green-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-bold shadow-md transition-colors w-full md:w-auto justify-center"
        >
          <Printer size={20} /> Cetak Laporan PDF
        </button>
      </div>

      {/* HEADER KHUSUS PRINT (Hanya muncul di kertas PDF) */}
      <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase">
          Laporan Evaluasi Pertanian & Prediksi AI
        </h1>
        <p className="text-gray-600">
          Pemerintah Desa Pisangsambo, Kecamatan Tirtajaya - Dicetak:{" "}
          {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* 2. KPI CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Tambahan print:shadow-none print:border-gray-300 agar tinta printer efisien */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition print:shadow-none print:border-gray-300">
          <div className="p-3 sm:p-4 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Users size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mb-0.5 sm:mb-1">
              Total Penggunaan AI
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800">
              {data?.kpi.total_penggunaan}{" "}
              <span className="text-xs sm:text-sm text-gray-400 font-medium">
                Kali
              </span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition print:shadow-none print:border-gray-300">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <CloudRain size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mb-0.5 sm:mb-1">
              Update Cuaca Aktif
            </p>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 uppercase">
              {data?.kpi.cuaca_terakhir}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition print:shadow-none print:border-gray-300">
          <div className="p-3 sm:p-4 bg-yellow-50 text-yellow-600 rounded-xl shrink-0">
            <Wheat size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mb-0.5 sm:mb-1">
              Produktivitas Panen
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {data?.kpi.rata_produktivitas}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION - Responsive */}
      {/* Tambahan print:break-inside-avoid agar grafik tidak terpotong pindah halaman */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:break-inside-avoid">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
          Evaluasi Historis Panen Desa
        </h3>
        <p className="text-xs text-gray-500 mb-4 sm:mb-6">
          Perbandingan Luas Lahan (Hektare) terhadap Total Produksi Padi (Ton).
        </p>
        <div
          ref={panenChartRef}
          id="panen-chart"
          style={{ width: "100%", height: "300px", minHeight: "300px" }}
          className="w-full h-75 sm:h-87.5 md:h-100"
        ></div>
      </div>

      {/* Container Grafik Kecil, print:block agar tidak kesempitan di kertas */}
      <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 print:block">
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 print:shadow-none print:mb-6 print:break-inside-avoid">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            Tren Penggunaan Fitur Prediksi
          </h3>
          <div
            ref={barChartRef}
            id="bar-chart"
            style={{ width: "100%", height: "280px" }}
            className="w-full h-70 sm:h-75"
          ></div>
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:break-inside-avoid">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
            Rasio Keputusan AI
          </h3>
          <p className="text-xs text-gray-500 mb-4 sm:mb-6">
            Berdasarkan detail bulan yang diprediksi.
          </p>
          <div
            ref={pieChartRef}
            id="pie-chart"
            style={{ width: "100%", height: "280px" }}
            className="w-full h-70 sm:h-75"
          ></div>
        </div>
      </div>

      {/* 4. ACTIVITY LOG TABLE - DISEMBUNYIKAN SAAT PRINT */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">
            Riwayat Interaksi Publik Terkini
          </h3>
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            Real-time Data
          </span>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {data?.log_terbaru.map((log: any, idx: number) => (
            <div
              key={idx}
              className="p-4 space-y-2 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <Calendar size={12} />
                  {new Date(log.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {log.ip_address}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium border border-emerald-100">
                  {log.is_expert_mode ? "Custom Expert" : log.kondisi_lahan}
                </span>
                {log.is_expert_mode ? (
                  <span className="flex items-center gap-1 text-orange-600 text-xs">
                    <CheckCircle size={12} /> Manual
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-blue-600 text-xs">
                    <Users size={12} /> Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Waktu Akses
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  IP Address
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Profil Lahan
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                  Mode Input
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.log_terbaru.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 font-mono text-xs">
                    {log.ip_address}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-medium border border-emerald-100 text-xs sm:text-sm">
                      {log.is_expert_mode ? "Custom Expert" : log.kondisi_lahan}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    {log.is_expert_mode ? (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-orange-600 text-xs sm:text-sm">
                        <CheckCircle size={14} className="sm:w-4 sm:h-4" />{" "}
                        Manual
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-blue-600 text-xs sm:text-sm">
                        <Users size={14} className="sm:w-4 sm:h-4" /> Default
                        Master
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
