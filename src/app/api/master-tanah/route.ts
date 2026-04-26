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
      "SELECT COUNT(*) FROM master_tanah WHERE kondisi_lahan ILIKE $1",
      [searchPattern],
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      "SELECT * FROM master_tanah WHERE kondisi_lahan ILIKE $1 ORDER BY id ASC LIMIT $2 OFFSET $3",
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
   
    const {
      id_user,
      kondisi_lahan,
      nilai_n,
      nilai_p,
      nilai_k,
      nilai_ph,
      keterangan,
    } = body;

    const insertQuery = `
      INSERT INTO master_tanah (id_user, kondisi_lahan, nilai_n, nilai_p, nilai_k, nilai_ph, keterangan) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      id_user,
      kondisi_lahan,
      nilai_n,
      nilai_p,
      nilai_k,
      nilai_ph,
      keterangan,
    ]);

    return NextResponse.json({ status: "success", data: result.rows[0] });
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
    const body = await request.json();
    // 🌟 Tangkap id_user dari frontend (Mencatat siapa yang terakhir ngedit)
    const {
      id,
      id_user,
      kondisi_lahan,
      nilai_n,
      nilai_p,
      nilai_k,
      nilai_ph,
      keterangan,
    } = body;

    const updateQuery = `
      UPDATE master_tanah 
      SET id_user = $1, kondisi_lahan = $2, nilai_n = $3, nilai_p = $4, nilai_k = $5, nilai_ph = $6, keterangan = $7 
      WHERE id = $8 RETURNING *
    `;
    const result = await pool.query(updateQuery, [
      id_user,
      kondisi_lahan,
      nilai_n,
      nilai_p,
      nilai_k,
      nilai_ph,
      keterangan,
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
    if (!pool)
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { status: "error", message: "ID diperlukan" },
        { status: 400 },
      );

    await pool.query("DELETE FROM master_tanah WHERE id = $1", [id]);

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
