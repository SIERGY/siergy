"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/kalkulator", label: "Kalkulator" },
    { href: "/statistik", label: "Statistik Desa" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo - Mobile friendly */}
          <div className="flex items-center gap-2 sm:gap-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 text-green-700 hover:opacity-80 transition-opacity shrink-0"
            >
              <Sprout size={22} className="text-green-600 sm:w-7 sm:h-7" />
              <span className="font-bold text-base sm:text-xl tracking-tight hidden xs:block">
                TaniSync Tirtajaya
              </span>
              <span className="font-bold text-base tracking-tight xs:hidden">
                TaniSync
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden sm:flex gap-4 md:gap-6 text-sm font-semibold">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      transition-colors relative
                      ${
                        active
                          ? "text-green-700"
                          : "text-gray-600 hover:text-green-600"
                      }
                    `}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-[1.15rem] left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Menu Button & Admin Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Admin Button - Hidden on mobile */}
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors border border-green-200"
            >
              Masuk Admin
            </Link>

            {/* Mobile Admin Button (compact) */}
            <Link
              href="/login"
              className="sm:hidden text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-full transition-colors border border-green-200"
            >
              Admin
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg text-gray-600 hover:bg-green-50 transition-colors"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`
            sm:hidden fixed left-0 right-0 bg-white border-b border-green-100 shadow-lg
            transition-all duration-300 ease-in-out overflow-hidden
            ${mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
          `}
          style={{ top: "64px" }}
        >
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 transition-colors font-medium border-b border-gray-100 last:border-0
                    ${
                      active
                        ? "bg-green-50 text-green-700 border-l-4 border-l-green-600"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col items-center py-8 sm:py-12 px-3 sm:px-6">
        <div className="w-full max-w-5xl">{children}</div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-5 sm:py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs sm:text-sm text-gray-500">
          <p className="leading-relaxed">
            &copy; {new Date().getFullYear()} Sistem Informasi Pertanian Desa
            Pisangsambo.
          </p>
          <p className="text-xs sm:text-xs mt-1">Dikembangkan untuk Skripsi.</p>
        </div>
      </footer>
    </div>
  );
}
