import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia_skripsi_zidan_2026_super_aman');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!pool) {
      return NextResponse.json({ status: 'error', message: 'Koneksi database tidak tersedia' }, { status: 500 });
    }

    const db = pool;

    // 1. Cari user berdasarkan username
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Username tidak ditemukan' }, { status: 401 });
    }

    const user = userResult.rows[0];

    // 2. Cek kecocokan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ status: 'error', message: 'Password salah bro!' }, { status: 401 });
    }

    // 3. Bikin Access Token (15 menit)
    const accessToken = await new SignJWT({ id: user.id, username: user.username, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(SECRET_KEY);

    // 4. Bikin Refresh Token (7 hari)
    const refreshToken = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(SECRET_KEY);

    // 5. Update Refresh Token di Database
    await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    // 6. Siapkan response dan tanam Cookies
    const response = NextResponse.json({ status: 'success', message: 'Login berhasil, selamat datang!' });
    
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, 
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, 
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan di server' }, { status: 500 });
  }
}
