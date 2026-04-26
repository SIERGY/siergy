import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    

    // 1. KPI Utama
    const kpiPenggunaan = await pool.query('SELECT COUNT(*) FROM log_prediksi_header');
    
    // Hitung IP Unik (Warga Terbantu)
    const kpiWarga = await pool.query('SELECT COUNT(DISTINCT ip_address) FROM log_prediksi_header');
    
    const kpiCuaca = await pool.query('SELECT bulan, tahun_berlaku FROM data_iklim_tirtajaya ORDER BY tahun_berlaku DESC, id DESC LIMIT 1');
    
    // Hitung Rata-rata Produktivitas (Ton dibagi Ha)
    const kpiProduktivitas = await pool.query(`
      SELECT ROUND(AVG(total_produksi_ton / NULLIF(luas_lahan_ha, 0)), 2) as avg_prod 
      FROM data_panen_desa
    `);

    // 2. Data Grafik Historis Panen (Combo Chart)
    const chartPanen = await pool.query(`
      SELECT tahun, luas_lahan_ha, total_produksi_ton 
      FROM data_panen_desa 
      ORDER BY tahun ASC 
      LIMIT 10
    `);

    // 3. Data Grafik Bar (Tren 7 Hari Terakhir)
    const chartBar = await pool.query(`
      SELECT TO_CHAR(created_at, 'DD Mon') as tanggal, COUNT(id) as jumlah 
      FROM log_prediksi_header 
      GROUP BY TO_CHAR(created_at, 'DD Mon'), DATE(created_at)
      ORDER BY DATE(created_at) ASC 
      LIMIT 7
    `);

    // 4. Data Grafik Pie (Rasio Rekomendasi)
    const chartPie = await pool.query(`
      SELECT status_rekomendasi as name, COUNT(id) as value 
      FROM log_prediksi_detail 
      GROUP BY status_rekomendasi
    `);

    // 5. Data Tabel (5 Log Prediksi Terbaru)
    const logTerbaru = await pool.query(`
      SELECT h.ip_address, h.created_at, t.kondisi_lahan, h.is_expert_mode 
      FROM log_prediksi_header h 
      LEFT JOIN master_tanah t ON h.id_tanah = t.id 
      ORDER BY h.created_at DESC 
      LIMIT 5
    `);

    return NextResponse.json({
      status: 'success',
      data: {
        kpi: {
          total_penggunaan: parseInt(kpiPenggunaan.rows[0]?.count || '0'),
          warga_terbantu: parseInt(kpiWarga.rows[0]?.count || '0'),
          cuaca_terakhir: kpiCuaca.rows[0] ? `${kpiCuaca.rows[0].bulan} ${kpiCuaca.rows[0].tahun_berlaku}` : 'Belum Ada',
          rata_produktivitas: kpiProduktivitas.rows[0]?.avg_prod ? `${kpiProduktivitas.rows[0].avg_prod} Ton/Ha` : '0 Ton/Ha',
        },
        grafik_panen: chartPanen.rows,
        grafik_bar: chartBar.rows,
        grafik_pie: chartPie.rows,
        log_terbaru: logTerbaru.rows
      }
    });

  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
