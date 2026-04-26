'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sprout, Home, ArrowLeft, Search, Map, CloudRain, Wheat } from 'lucide-react';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y:0 });
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Glow effect interval
    const interval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 2000);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Map className="absolute top-20 left-10 w-8 h-8 text-green-300 animate-float opacity-50" />
        <CloudRain className="absolute top-40 right-20 w-6 h-6 text-blue-300 animate-float-delayed opacity-50" />
        <Wheat className="absolute bottom-32 left-20 w-10 h-10 text-yellow-300 animate-float opacity-30" />
        <Sprout className="absolute bottom-20 right-32 w-12 h-12 text-green-400 animate-float-delayed opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Card dengan efek glassmorphism */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50 transform transition-all duration-500 hover:scale-105">
          
          {/* 404 Number dengan efek glow */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 
                className={`text-8xl md:text-9xl font-black bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-500 ${
                  isGlowing ? 'drop-shadow-lg' : ''
                }`}
                style={{
                  textShadow: isGlowing 
                    ? '0 0 30px rgba(34, 197, 94, 0.3)' 
                    : 'none'
                }}
              >
                404
              </h1>
              {/* Animated underline */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-transparent via-green-500 to-transparent rounded-full animate-pulse"></div>
            </div>
            
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-sm font-medium text-red-700">Halaman Tidak Ditemukan</span>
            </div>
          </div>

          {/* Pesan Error */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Oops! Lahan yang Kamu Cari Sedang Liburan 🌾
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sepertinya halaman yang kamu tuju sedang tidak tersedia, 
              telah dipindahkan, atau mungkin tersesat di sawah sebelah.
            </p>
          </div>

          {/* Saran Aksi */}
          <div className="bg-white/50 rounded-xl p-4 mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              💡 Beberapa saran untukmu:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Periksa kembali URL yang kamu masukkan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Pastikan tidak ada typo di alamat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Coba navigasi melalui menu utama</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Kembali ke halaman sebelumnya</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                <Home size={18} />
                Kembali ke Beranda
              </span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-semibold border border-gray-200 transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={18} />
              Halaman Sebelumnya
            </button>
          </div>

         
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="italic">
            "Setiap langkah yang tersesat adalah kesempatan untuk menemukan jalan baru." 
            <br />- Petani Bijak 🌱
          </p>
        </div>
      </div>

      <div 
        className="fixed pointer-events-none z-50 w-32 h-32 rounded-full bg-linear-to-r from-green-400/20 to-emerald-400/20 blur-xl transition-all duration-150 ease-out"
        style={{
          left: mousePosition.x - 64,
          top: mousePosition.y - 64,
        }}
      />
    </div>
  );
}
