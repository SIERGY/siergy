import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia_skripsi_zidan_2026_super_aman",
);

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathName = request.nextUrl.pathname;

  // 1. Perlindungan Halaman Admin
  if (pathName.startsWith("/admin")) {
    // Kalau gak punya token, tendang ke login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(accessToken, SECRET_KEY);
      const userRole = payload.role as string;

      // BLOKIR PETUGAS: Kalau petugas maksa buka Dashboard, lempar ke kelola tanah
      if (pathName === "/admin/dashboard" && userRole === "petugas") {
        return NextResponse.redirect(
          new URL("/admin/master-tanah", request.url),
        );
      }

      return NextResponse.next();
    } catch (error) {
      // Token expired atau palsu (dimanipulasi), tendang ke login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  // 2. Cegah Admin Login Dua Kali
  if (request.nextUrl.pathname === "/login") {
    if (accessToken) {
      try {
        // Kalau tokennya masih valid, langsung arahkan ke dashboard
        const { payload } = await jwtVerify(accessToken, SECRET_KEY);
        const userRole = payload.role as string;

        if (userRole === "petugas") {
          return NextResponse.redirect(
            new URL("/admin/master-tanah", request.url),
          );
        } else {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        }
      } catch (error) {
        // Token kadaluarsa, biarkan di halaman login
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
