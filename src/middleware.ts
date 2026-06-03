import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? 'askchimps_session';

const PUBLIC_PATHS = ['/login', '/api/debug-env'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every route except Next internals and static asset files
    // (images + audio + video) served from /public.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|ogg|m4a|webm|mp4)).*)',
  ],
};
