import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    vercel_env: process.env.VERCEL_ENV,
    api_base_url: process.env.API_BASE_URL,
    session_cookie_name: process.env.SESSION_COOKIE_NAME,
    session_cookie_secure: process.env.SESSION_COOKIE_SECURE,
    has_api: typeof process.env.API_BASE_URL,
  });
}
