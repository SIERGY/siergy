import pool from "@/lib/db";
import { NextResponse } from "next/server";

// Fungsi Read (Ambil Data)
export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }
    const result = await pool.query(
      "SELECT * FROM master_tanah ORDER BY id ASC",
    );
    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

// Fungsi Update (Edit Data)
export async function PUT(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        { status: "error", message: "Koneksi database tidak tersedia" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { id, nilai_n, nilai_p, nilai_k, nilai_ph, keterangan } = body;

    const updateQuery = `
      UPDATE master_tanah 
      SET nilai_n = $1, nilai_p = $2, nilai_k = $3, nilai_ph = $4, keterangan = $5 
      WHERE id = $6 RETURNING *
    `;
    const values = [nilai_n, nilai_p, nilai_k, nilai_ph, keterangan, id];

    const result = await pool.query(updateQuery, values);

    return NextResponse.json({ status: "success", data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
