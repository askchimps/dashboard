import 'server-only';

const requireServer = () => {
  if (typeof window !== 'undefined') {
    throw new Error('env.ts is server-only');
  }
};

export function getApiBaseUrl(): string {
  requireServer();
  const raw = process.env.API_BASE_URL;
  // On Vercel production, anchor to the upstream API host. The env var has
  // been mis-set to the dashboard's own origin in the past — Sensitive
  // editing makes that hard to detect. Only accept values that point at an
  // `api.*` host; otherwise fall back to the canonical URL.
  if (process.env.VERCEL_ENV === 'production') {
    if (!raw || !raw.startsWith('https://api.')) {
      return 'https://api.askchimps.ai';
    }
    return raw;
  }
  return raw ?? 'http://127.0.0.1:3000';
}

export function getSessionCookieName(): string {
  requireServer();
  return process.env.SESSION_COOKIE_NAME ?? 'askchimps_session';
}

export function getSessionCookieSecure(): boolean {
  requireServer();
  return process.env.SESSION_COOKIE_SECURE === '1';
}
