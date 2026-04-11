'use client'; // Wajib karena kita pakai hooks navigasi

import '@/app/globals.css'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CloudRain, 
  Wheat, 
  Map, 
  LogOut 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Daftar menu sesuai rancangan Sitemap kita sebelumnya
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Iklim', path: '/admin/iklim', icon: CloudRain },
    { name: 'Kelola Panen', path: '/admin/panen', icon: Wheat },
    { name: 'Master Tanah', path: '/admin/master-tanah', icon: Map },
  ];

  const handleLogout = async () => {
    console.log('Logging out...');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo / Judul */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-700">Admin Desa</h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout di Bawah */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR (Header) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {menuItems.find(m => m.path === pathname)?.name || 'Admin Panel'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin Pisangsambo</span>
          </div>
        </header>

        {/* Konten Halaman (Dashboard, Form, Tabel) akan dirender di sini */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
