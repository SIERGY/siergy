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
      "SELECT COUNT(*) FROM data_panen_desa WHERE CAST(tahun AS TEXT) ILIKE $1 OR musim_tanam ILIKE $1",
      [searchPattern],
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // 🌟 Pakai LEFT JOIN untuk narik nama kondisi_lahan dari master_tanah
    const result = await pool.query(
      `SELECT p.*, t.kondisi_lahan 
       FROM data_panen_desa p
       LEFT JOIN master_tanah t ON p.id_tanah = t.id
       WHERE CAST(p.tahun AS TEXT) ILIKE $1 OR p.musim_tanam ILIKE $1 
       ORDER BY p.tahun DESC, p.musim_tanam ASC 
       LIMIT $2 OFFSET $3`,
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

    // 🌟 Tangkap id_user dan id_tanah
    const {
      id_user,
      id_tanah,
      tahun,
      musim_tanam,
      luas_lahan_ha,
      total_produksi_ton,
    } = await request.json();

    const insertQuery = `
      INSERT INTO data_panen_desa (id_user, id_tanah, tahun, musim_tanam, luas_lahan_ha, total_produksi_ton)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      id_user,
      id_tanah,
      tahun,
      musim_tanam,
      luas_lahan_ha,
      total_produksi_ton,
    ]);

    return NextResponse.json({ status: "success", data: result.rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          status: "error",
          message: "Data untuk Tahun dan Musim tersebut sudah ada!",
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

export async function PUT(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    // 🌟 Tangkap id_user dan id_tanah
    const {
      id,
      id_user,
      id_tanah,
      tahun,
      musim_tanam,
      luas_lahan_ha,
      total_produksi_ton,
    } = await request.json();

    const updateQuery = `
      UPDATE data_panen_desa 
      SET id_user = $1, id_tanah = $2, tahun = $3, musim_tanam = $4, luas_lahan_ha = $5, total_produksi_ton = $6
      WHERE id = $7 RETURNING *
    `;
    const result = await pool.query(updateQuery, [
      id_user,
      id_tanah,
      tahun,
      musim_tanam,
      luas_lahan_ha,
      total_produksi_ton,
      id,
    ]);

    return NextResponse.json({ status: "success", data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { status: "error", message: "ID tidak ditemukan" },
        { status: 400 },
      );

    await pool.query("DELETE FROM data_panen_desa WHERE id = $1", [id]);
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
