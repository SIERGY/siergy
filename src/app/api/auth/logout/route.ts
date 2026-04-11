import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'success', message: 'Logout berhasil' });
  
  // Hapus cookies dengan cara set Max-Age jadi 0
  response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
  response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });

  return response;
}
