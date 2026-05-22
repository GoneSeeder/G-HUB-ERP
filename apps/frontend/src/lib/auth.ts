export const AUTH_COOKIE_NAME = 'ghub_access_token';
export const SESSION_ACTIVITY_KEY = 'ghub_last_activity_at';
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function setAuthTokenCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  touchSessionActivity();
}

export function clearAuthTokenCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_ACTIVITY_KEY);
  }
}

export function touchSessionActivity() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()));
}

export function isSessionIdleExpired() {
  if (typeof window === 'undefined') {
    return false;
  }

  const raw = window.localStorage.getItem(SESSION_ACTIVITY_KEY);
  const lastActivity = raw ? Number(raw) : Date.now();
  if (!raw) {
    touchSessionActivity();
    return false;
  }

  return Date.now() - lastActivity > IDLE_TIMEOUT_MS;
}
