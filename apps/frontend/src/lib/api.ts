import { clearAuthTokenCookie, getAuthTokenFromCookie, isSessionIdleExpired } from './auth';

const LOCAL_API_URL = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/?$/i;

export function getApiBaseUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (!configuredUrl || LOCAL_API_URL.test(configuredUrl)) {
    return '';
  }

  return configuredUrl.replace(/\/$/, '');
}

export function getRealtimeBaseUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (configuredUrl && !LOCAL_API_URL.test(configuredUrl)) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && LOCAL_API_URL.test(window.location.origin)) {
    return 'http://localhost:3001';
  }

  return configuredUrl.replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');
}

const API_URL = getApiBaseUrl();
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

type ApiErrorBody = {
  code?: string;
  message?: string | string[];
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: ApiErrorBody | null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  clearAuthTokenCookie();
  const p = window.location.pathname;
  const isLoginPage = p.startsWith('/login') || p.startsWith('/humansource/login');
  if (!isLoginPage) {
    window.location.assign(p.startsWith('/humansource') ? '/humansource/login' : '/login');
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

    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new ApiRequestError(
      message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code,
      errorBody,
    );
  }

  return (await response.json()) as T;
}

export async function publicApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new ApiRequestError(
      message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code,
      errorBody,
    );
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

    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message;
    throw new ApiRequestError(
      message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code,
      errorBody,
    );
  }

  return (await response.json()) as T;
}
