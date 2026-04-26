# Frontend Web - Prediksi Masa Tanam Padi Desa Pisangsambo

Direktori ini memuat _source code frontend_ berbasis **Next.js** untuk proyek "Rancang Bangun Sistem Informasi Prediksi Masa Tanam Komoditas Pertanian Berbasis Web pada Desa Pisangsambo".

Aplikasi ini bertindak sebagai antarmuka utama (UI) yang interaktif bagi pengguna (seperti petani atau penyuluh) untuk menginput parameter tanah dan iklim, lalu menampilkan visualisasi rekomendasi jadwal tanam yang dihasilkan oleh model Machine Learning di _backend_.

## ✨ Fitur Utama

- **Form Input Parameter:** Antarmuka responsif untuk memasukkan data uji tanah (N, P, K, pH) dan data iklim bulanan (Suhu, Kelembapan, Curah Hujan).
- **Integrasi API Real-time:** Menghubungkan _input user_ secara langsung dengan _microservice_ API Flask untuk mendapatkan prediksi secara instan.
- **Visualisasi Hasil:** Menampilkan status "Direkomendasikan" atau "Tidak Direkomendasikan" per bulan beserta ringkasan jadwal tanam terbaik.
- **Progressive Web App (PWA) Ready:** Arsitektur yang disiapkan untuk mendukung kapabilitas PWA, memungkinkan akses yang lebih cepat dan _app-like experience_ di perangkat _mobile_ pengguna.

## 🛠️ Prasyarat Sistem

Sebelum menjalankan _project_ ini secara lokal, pastikan lingkungan _development_ Anda telah terinstal:

- **Node.js** (Versi 20.x atau lebih baru disarankan)
- **npm** atau **yarn** atau **pnpm** (sebagai _package manager_)
- Server API Flask (backend ML) sudah berjalan di _environment_ terpisah.

## 🚀 Cara Menjalankan (Development)

1. **Masuk ke direktori web dan instal dependensi:**

   ```bash
   cd siergy
   npm install
   ```

2. **Konfigurasi Environment Variable:**
   Buat file `.env` di _root_ direktori `siergy` dan atur URL endpoint untuk API Flask.

   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=siergy
   DB_PASSWORD=yourpassword
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ML_API_URL=http://localhost:5000
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di _browser_ Anda untuk melihat hasil _render_ aplikasi.

## 📦 Skrip Tambahan

- `npm run build`: Melakukan _build production_ untuk optimasi performa halaman (SSG/SSR).
- `npm run start`: Menjalankan server _production_ setelah proses _build_ selesai.
- `npm run lint`: Memeriksa standar penulisan kode (_linting_) untuk menjaga kualitas _codebase_.

## 🌐 Catatan Deployment

Proyek Next.js ini sudah dikonfigurasi dan sangat dioptimalkan untuk di- _deploy_ melalui **Vercel**.
