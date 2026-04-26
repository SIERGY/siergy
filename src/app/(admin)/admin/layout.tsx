"use client";

import "@/app/globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CloudRain,
  Wheat,
  Map,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sprout,
  User,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // Track hydration
  const { user, logout } = useAuthStore();

  // Wait for Zustand persist hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check screen size for responsive
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Menu items dengan filtering berdasarkan role
  const getMenuItems = () => {
    const allMenus = [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Master Tanah", path: "/admin/master-tanah", icon: Map },
      { name: "Kelola Iklim", path: "/admin/iklim", icon: CloudRain },
      { name: "Kelola Panen", path: "/admin/panen", icon: Wheat },
    ];

    // Jika user belum load atau role petugas
    if (!user || user.role === "petugas") {
      return allMenus.filter(
        (item) =>
          item.path === "/admin/master-tanah" ||
          item.path === "/admin/iklim" ||
          item.path === "/admin/panen",
      );
    }

    // Admin bisa lihat semua
    return allMenus;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Get current page title
  const currentTitle =
    menuItems.find((m) => m.path === pathname)?.name || "Admin Panel";

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={` print:hidden
          fixed md:relative z-50 h-screen bg-white shadow-2xl transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobile ? (sidebarOpen ? "left-0" : "-left-64") : collapsed ? "w-20" : "w-64"}
          ${isMobile ? "w-64" : ""}
        `}
      >
        {/* Logo / Judul */}
        <div
          className={`
          h-16 flex items-center border-b border-gray-100 px-4
          ${collapsed && !isMobile ? "justify-center" : "justify-between"}
        `}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <Sprout className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" />
            {(!collapsed || isMobile) && (
              <div>
                <h1 className="text-lg font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {user ? `Hi, ${user.username}` : "Admin"}
                </h1>
                <p className="text-xs text-gray-400">Pisangsambo</p>
              </div>
            )}
          </Link>

          {/* Collapse button (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                  ${collapsed && !isMobile ? "justify-center" : ""}
                `}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-green-600"
                      : "group-hover:text-green-500 transition-colors"
                  }
                />
                {(!collapsed || isMobile) && <span>{item.name}</span>}
                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout di Bawah */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`
              flex w-full items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group
              ${collapsed && !isMobile ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} />
            {(!collapsed || isMobile) && <span>Keluar</span>}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Keluar
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR (Header) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Desktop collapse indicator spacer */}
            {!isMobile && !collapsed && <div className="w-0" />}

            <h2 className="text-base sm:text-lg font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 print:hidden">
            

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user ? `Hi, ${user.username}` : "Admin"}
                </p>
                <p className="text-xs text-gray-400">Pisangsambo</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 print:overflow-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
