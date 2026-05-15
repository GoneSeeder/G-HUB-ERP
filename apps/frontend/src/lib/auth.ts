export const AUTH_COOKIE_NAME = 'ghub_access_token';

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
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax`;
}

export function clearAuthTokenCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
