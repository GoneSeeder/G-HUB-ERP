import { clearAuthTokenCookie, getAuthTokenFromCookie, isSessionIdleExpired } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  clearAuthTokenCookie();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

function handleUnauthorized() {
  redirectToLogin();
  throw new Error(SESSION_EXPIRED_MESSAGE);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthTokenFromCookie();
  if (!token || isSessionIdleExpired()) {
    handleUnauthorized();
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    if (response.status === 413) {
      throw new Error('File too large');
    }

    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiUpload<T>(path: string, file: Blob): Promise<T> {
  const token = getAuthTokenFromCookie();
  if (!token || isSessionIdleExpired()) {
    handleUnauthorized();
  }

  const headers = new Headers();
  headers.set('Content-Type', file.type || 'application/octet-stream');
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: file,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    if (response.status === 413) {
      throw new Error('File too large');
    }

    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
