import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. READ (Tampil Data)
export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    // Urutkan dari tahun terbaru
    const result = await pool.query('SELECT * FROM data_panen_desa ORDER BY tahun DESC, musim_tanam ASC');
    return NextResponse.json({ status: 'success', data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// 2. CREATE (Tambah Data Baru)
export async function POST(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    const { tahun, musim_tanam, luas_lahan_ha, total_produksi_ton } = await request.json();
    
    const insertQuery = `
      INSERT INTO data_panen_desa (tahun, musim_tanam, luas_lahan_ha, total_produksi_ton)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await pool.query(insertQuery, [tahun, musim_tanam, luas_lahan_ha, total_produksi_ton]);
    
    return NextResponse.json({ status: 'success', data: result.rows[0] });
  } catch (error: any) {
    // Tangkap error kalau tahun & musim sama (Constraint UNIQUE)
    if (error.code === '23505') {
      return NextResponse.json({ status: 'error', message: 'Data untuk Tahun dan Musim tersebut sudah ada!' }, { status: 400 });
    }
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// 3. UPDATE (Edit Data)
export async function PUT(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }
    const { id, tahun, musim_tanam, luas_lahan_ha, total_produksi_ton } = await request.json();
    
    const updateQuery = `
      UPDATE data_panen_desa 
      SET tahun = $1, musim_tanam = $2, luas_lahan_ha = $3, total_produksi_ton = $4
      WHERE id = $5 RETURNING *
    `;
    const result = await pool.query(updateQuery, [tahun, musim_tanam, luas_lahan_ha, total_produksi_ton, id]);
    
    return NextResponse.json({ status: 'success', data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// 4. DELETE (Hapus Data)
export async function DELETE(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }

    // Ambil ID dari URL parameter (contoh: /api/panen?id=5)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ status: 'error', message: 'ID tidak ditemukan' }, { status: 400 });

    await pool.query('DELETE FROM data_panen_desa WHERE id = $1', [id]);
    return NextResponse.json({ status: 'success', message: 'Data berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
