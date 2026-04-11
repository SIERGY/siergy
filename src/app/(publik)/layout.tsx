import Link from "next/link";
import { Sprout } from "lucide-react";

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-green-700 hover:opacity-80 transition-opacity"
            >
              <Sprout size={28} className="text-green-600" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                TaniSync Tirtajaya
              </span>
            </Link>

            {/* Menu Navigasi Publik */}
            <nav className="flex gap-6 text-sm font-semibold text-gray-600">
              <Link href="/" className="hover:text-green-600 transition-colors">
                Beranda
              </Link>
              <Link
                href="/kalkulator"
                className="hover:text-green-600 transition-colors"
              >
                Kalkulator
              </Link>
              <Link
                href="/statistik"
                className="hover:text-green-600 transition-colors"
              >
                Statistik Desa
              </Link>
            </nav>
          </div>

          <Link
            href="/login"
            className="text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors border border-green-200"
          >
            Masuk Admin
          </Link>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-5xl">{children}</div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sistem Informasi Pertanian Desa
          Pisangsambo. <br />
          Dikembangkan untuk Skripsi.
        </div>
      </footer>
    </div>
  );
}
