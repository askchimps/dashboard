import 'server-only';

const requireServer = () => {
  if (typeof window !== 'undefined') {
    throw new Error('env.ts is server-only');
  }
};

export function getApiBaseUrl(): string {
  requireServer();
  return process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';
}

export function getSessionCookieName(): string {
  requireServer();
  return process.env.SESSION_COOKIE_NAME ?? 'askchimps_session';
}

export function getSessionCookieSecure(): boolean {
  requireServer();
  return process.env.SESSION_COOKIE_SECURE === '1';
}
