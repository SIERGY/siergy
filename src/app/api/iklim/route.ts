import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const searchPattern = `%${search}%`;

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM data_iklim_tirtajaya WHERE CAST(tahun_berlaku AS TEXT) ILIKE $1 OR bulan ILIKE $1",
      [searchPattern],
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      "SELECT * FROM data_iklim_tirtajaya WHERE CAST(tahun_berlaku AS TEXT) ILIKE $1 OR bulan ILIKE $1 ORDER BY tahun_berlaku DESC, id ASC LIMIT $2 OFFSET $3",
      [searchPattern, limit, offset],
    );

    return NextResponse.json({
      status: "success",
      data: result.rows,
      pagination: { currentPage: page, totalPages, totalItems, limit },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const dataArray = Array.isArray(body) ? body : [body];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const item of dataArray) {
        // 🌟 Tangkap id_user dari setiap baris
        const {
          id_user,
          username,
          bulan,
          tahun_berlaku,
          curah_hujan_mm,
          suhu_rata_rata,
          kelembapan_persen,
          keterangan_sumber,
        } = item;

        if (!bulan || !tahun_berlaku) continue;

        // 🌟 Update Query: Tambahkan id_user
        const upsertQuery = `
          INSERT INTO data_iklim_tirtajaya 
          (id_user, bulan, tahun_berlaku, curah_hujan_mm, suhu_rata_rata, kelembapan_persen, keterangan_sumber)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (bulan, tahun_berlaku) 
          DO UPDATE SET 
            id_user = EXCLUDED.id_user,
            curah_hujan_mm = EXCLUDED.curah_hujan_mm,
            suhu_rata_rata = EXCLUDED.suhu_rata_rata,
            kelembapan_persen = EXCLUDED.kelembapan_persen,
            keterangan_sumber = EXCLUDED.keterangan_sumber
        `;

        await client.query(upsertQuery, [
          id_user, // Simpan ID User yang ngupload/input
          bulan.toString().toUpperCase(),
          tahun_berlaku,
          curah_hujan_mm,
          suhu_rata_rata,
          kelembapan_persen,
          keterangan_sumber || `Input Manual oleh ${username || "Unknown"}`,
        ]);
      }

      await client.query("COMMIT");
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }

    return NextResponse.json({
      status: "success",
      message: "Data iklim berhasil disinkronisasi",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    // 🌟 Tangkap id_user dari body
    const {
      id,
      id_user,
      bulan,
      tahun_berlaku,
      curah_hujan_mm,
      suhu_rata_rata,
      kelembapan_persen,
      keterangan_sumber,
    } = await request.json();

    // 🌟 Set id_user saat di-update
    const updateQuery = `
      UPDATE data_iklim_tirtajaya 
      SET id_user = $1, bulan = $2, tahun_berlaku = $3, curah_hujan_mm = $4, suhu_rata_rata = $5, kelembapan_persen = $6, keterangan_sumber = $7
      WHERE id = $8 RETURNING *
    `;
    const result = await pool.query(updateQuery, [
      id_user,
      bulan.toString().toUpperCase(),
      tahun_berlaku,
      curah_hujan_mm,
      suhu_rata_rata,
      kelembapan_persen,
      keterangan_sumber,
      id,
    ]);

    return NextResponse.json({ status: "success", data: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          status: "error",
          message: "Data iklim untuk Bulan dan Tahun tersebut sudah ada!",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!pool)
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { status: "error", message: "ID tidak ditemukan" },
        { status: 400 },
      );

    await pool.query("DELETE FROM data_iklim_tirtajaya WHERE id = $1", [id]);
    return NextResponse.json({
      status: "success",
      message: "Data berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
