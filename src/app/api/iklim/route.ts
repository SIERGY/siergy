import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. Tampil Data (GET)
export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    const result = await pool.query('SELECT * FROM data_iklim_tirtajaya ORDER BY tahun_berlaku DESC, id ASC');
    return NextResponse.json({ status: 'success', data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// 2. Simpan/Update Data (POST) - Bisa 1 baris atau banyak baris (CSV)
export async function POST(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    const body = await request.json();
    
    // Cek apakah data yang dikirim bentuknya Array (dari CSV) atau Object (Input Manual)
    const dataArray = Array.isArray(body) ? body : [body];

    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Mulai transaksi DB

      for (const item of dataArray) {
        const { bulan, tahun_berlaku, curah_hujan_mm, suhu_rata_rata, kelembapan_persen, keterangan_sumber } = item;
        
        // LOGIC UPSERT: Kalau bulan & tahun udah ada, UPDATE angkanya. Kalau belum, INSERT.
        const upsertQuery = `
          INSERT INTO data_iklim_tirtajaya 
          (bulan, tahun_berlaku, curah_hujan_mm, suhu_rata_rata, kelembapan_persen, keterangan_sumber)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (bulan, tahun_berlaku) 
          DO UPDATE SET 
            curah_hujan_mm = EXCLUDED.curah_hujan_mm,
            suhu_rata_rata = EXCLUDED.suhu_rata_rata,
            kelembapan_persen = EXCLUDED.kelembapan_persen,
            keterangan_sumber = EXCLUDED.keterangan_sumber
        `;
        
        await client.query(upsertQuery, [
          bulan.toUpperCase(), // Pastikan bulan selalu huruf besar
          tahun_berlaku, 
          curah_hujan_mm, 
          suhu_rata_rata, 
          kelembapan_persen, 
          keterangan_sumber || 'Input Manual Admin'
        ]);
      }

      await client.query('COMMIT'); // Simpan permanen
    } catch (err) {
      await client.query('ROLLBACK'); // Batalkan semua kalau ada yang error
      throw err;
    } finally {
      client.release(); // Kembalikan koneksi ke pool
    }

    return NextResponse.json({ status: 'success', message: 'Data iklim berhasil disimpan/diupdate' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// 3. Hapus Data (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ status: 'error', message: 'ID tidak ditemukan' }, { status: 400 });

    await pool.query('DELETE FROM data_iklim_tirtajaya WHERE id = $1', [id]);
    return NextResponse.json({ status: 'success', message: 'Data berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
