import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia_skripsi_zidan_2026_super_aman",
);

export async function middleware(request: NextRequest) {
    // Cek halaman /admin - hanya admin_desa yang boleh
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const accessToken = request.cookies.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const user = await jwtVerify(accessToken, SECRET_KEY);
            
            // Cek apakah role-nya admin_desa
            if (user.payload.role === "admin_desa") {
                return NextResponse.next(); // Silakan masuk
            } else {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (error) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Cek halaman login - jika sudah login, redirect ke dashboard
    if (request.nextUrl.pathname === "/login") {
        const accessToken = request.cookies.get("accessToken")?.value;
        
        if (accessToken) {
            try {
                const user = await jwtVerify(accessToken, SECRET_KEY);
                
                if (user.payload.role === "admin_desa") {
                    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
                } else {
                    return NextResponse.redirect(new URL("/", request.url));
                }
            } catch (error) {
                return NextResponse.next();
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login"],
};
