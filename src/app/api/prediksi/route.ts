import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!pool) {
      return NextResponse.json(
        {
          status: "error",
          message: "Koneksi database tidak tersedia",
        },
        { status: 500 },
      );
    }

    const { id_tanah, filter_bulan, is_expert, manual_tanah } =
      await request.json();

    if (
      !filter_bulan ||
      !Array.isArray(filter_bulan) ||
      filter_bulan.length === 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Filter bulan harus berupa array dan tidak boleh kosong",
        },
        { status: 400 },
      );
    }

    let tanahData = { N: 0, P: 0, K: 0, ph: 0, nama: "" };

    if (is_expert && manual_tanah) {
      if (
        !manual_tanah.N ||
        !manual_tanah.P ||
        !manual_tanah.K ||
        !manual_tanah.ph
      ) {
        return NextResponse.json(
          {
            status: "error",
            message:
              "Data tanah manual tidak lengkap. Harus mengisi N, P, K, dan pH",
          },
          { status: 400 },
        );
      }

      tanahData = {
        N: parseFloat(manual_tanah.N),
        P: parseFloat(manual_tanah.P),
        K: parseFloat(manual_tanah.K),
        ph: parseFloat(manual_tanah.ph),
        nama: `Input Manual (N:${manual_tanah.N}, P:${manual_tanah.P}, K:${manual_tanah.K}, pH:${manual_tanah.ph})`,
      };

      if (
        isNaN(tanahData.N) ||
        isNaN(tanahData.P) ||
        isNaN(tanahData.K) ||
        isNaN(tanahData.ph)
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "Data tanah manual harus berupa angka yang valid",
          },
          { status: 400 },
        );
      }
    } else {
      if (!id_tanah) {
        return NextResponse.json(
          {
            status: "error",
            message: "ID tanah tidak ditemukan",
          },
          { status: 400 },
        );
      }

      const tanahRes = await pool.query(
        "SELECT * FROM master_tanah WHERE id = $1",
        [id_tanah],
      );
      if (tanahRes.rows.length === 0) {
        return NextResponse.json(
          {
            status: "error",
            message: "Data tanah tidak ditemukan",
          },
          { status: 404 },
        );
      }

      const t = tanahRes.rows[0];
      tanahData = {
        N: parseFloat(t.nilai_n),
        P: parseFloat(t.nilai_p),
        K: parseFloat(t.nilai_k),
        ph: parseFloat(t.nilai_ph),
        nama: t.kondisi_lahan,
      };
    }

    const bulanQuery = filter_bulan
      .map((bulan: string) => `'${bulan.toUpperCase()}'`)
      .join(",");
    const iklimRes = await pool.query(`
      SELECT * FROM data_iklim_tirtajaya 
      WHERE bulan IN (${bulanQuery})
      ORDER BY 
        CASE bulan
          WHEN 'JANUARI' THEN 1
          WHEN 'FEBRUARI' THEN 2
          WHEN 'MARET' THEN 3
          WHEN 'APRIL' THEN 4
          WHEN 'MEI' THEN 5
          WHEN 'JUNI' THEN 6
          WHEN 'JULI' THEN 7
          WHEN 'AGUSTUS' THEN 8
          WHEN 'SEPTEMBER' THEN 9
          WHEN 'OKTOBER' THEN 10
          WHEN 'NOPEMBER' THEN 11
          WHEN 'DESEMBER' THEN 12
        END
    `);

    if (iklimRes.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Data iklim untuk bulan ${filter_bulan.join(", ")} tidak tersedia di sistem.`,
        },
        { status: 404 },
      );
    }

    const foundBulans = iklimRes.rows.map((row: any) => row.bulan);
    const missingBulans = filter_bulan.filter(
      (bulan: string) => !foundBulans.includes(bulan.toUpperCase()),
    );

    if (missingBulans.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Data iklim untuk bulan ${missingBulans.join(", ")} tidak tersedia`,
        },
        { status: 404 },
      );
    }

    const mlPayload = {
      tanah: {
        N: tanahData.N,
        P: tanahData.P,
        K: tanahData.K,
        ph: tanahData.ph,
      },
      data_iklim: iklimRes.rows.map((iklim: any) => ({
        bulan: iklim.bulan,
        suhu: parseFloat(iklim.suhu_rata_rata),
        kelembaban: parseFloat(iklim.kelembapan_persen),
        curah_hujan: parseFloat(iklim.curah_hujan_mm),
      })),
    };

    console.log("🚀 Payload ke Python:", JSON.stringify(mlPayload, null, 2));

    let pythonRes;
    try {
      pythonRes = await fetch(`${process.env.ML_API_URL}/api/prediksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
        signal: AbortSignal.timeout(30000),
      });

      if (!pythonRes.ok) {
        throw new Error(`HTTP ${pythonRes.status}: ${pythonRes.statusText}`);
      }

      const rekomendasiData = await pythonRes.json();
      console.log("✅ Hasil prediksi dari Python:", rekomendasiData);

      if (!rekomendasiData.data || !rekomendasiData.summary) {
        throw new Error(
          "Response dari Python tidak memiliki format yang valid",
        );
      }

      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("remote-addr") ||
        "Anonymous";

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const db_id_tanah = is_expert ? null : Number(id_tanah);
        const headerQuery = `
          INSERT INTO log_prediksi_header 
          (ip_address, id_tanah, is_expert_mode, manual_n, manual_p, manual_k, manual_ph)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `;
        const headerValues = [
          ip,
          db_id_tanah,
          is_expert || false,
          is_expert ? tanahData.N : null,
          is_expert ? tanahData.P : null,
          is_expert ? tanahData.K : null,
          is_expert ? tanahData.ph : null,
        ];

        const headerRes = await client.query(headerQuery, headerValues);
        const headerId = headerRes.rows[0].id;

        for (const item of rekomendasiData.data) {
          const iklimRow = iklimRes.rows.find(
            (row: any) => row.bulan === item.bulan,
          );
          const id_iklim = iklimRow ? iklimRow.id : null;

          const detailQuery = `
            INSERT INTO log_prediksi_detail
            (id_log_header, id_iklim, bulan_prediksi, status_rekomendasi)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(detailQuery, [
            headerId,
            id_iklim,
            item.bulan,
            item.status_padi,
          ]);
        }

        await client.query("COMMIT");
        console.log(
          "✅ Log Prediksi berhasil disimpan ke Database (Header-Detail)",
        );
      } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("⚠️ Gagal menyimpan log transaksi:", dbError);
      } finally {
        client.release();
      }

      return NextResponse.json({
        status: "success",
        data: rekomendasiData.data,
        summary: rekomendasiData.summary,
        metadata: {
          tanah_dipakai: tanahData.nama,
          bulan_diperiksa: filter_bulan,
          total_bulan: filter_bulan.length,
          sumber_data: "AI Model (Python)",
          waktu_prediksi: new Date().toISOString(),
          is_expert: is_expert || false,
        },
      });
    } catch (fetchError: any) {
      console.error("❌ Gagal konek ke Python API:", fetchError);

      return NextResponse.json(
        {
          status: "error",
          message: "Layanan AI (Python) sedang offline atau tidak merespons.",
          error_detail: fetchError.message,
          solution: `Pastikan server Python Flask berjalan di ${process.env.ML_API_URL}`,
          endpoints: [
            `${process.env.ML_API_URL}/api/prediksi (POST) - Endpoint untuk prediksi rekomendasi tanaman`,
            `${process.env.ML_API_URL}/ (GET) - Cek apakah server Python menyala`,
          ],
          hint: "Jalankan: python app.py atau flask run",
        },
        { status: 503 },
      );
    }
  } catch (error: any) {
    console.error("❌ Error di API route:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Terjadi kesalahan pada server",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
