import { apiFetch } from './api';

export const QUERY_STALE_TIME_MS = 30 * 1000;

export interface MeResponse {
  sub?: string;
  username?: string;
  name?: string;
  roles: string[];
  apps: string[];
}

export interface AppItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export const queryKeys = {
  me: ['auth', 'me'] as const,
  apps: ['apps'] as const,
};

export const queryOptions = {
  me: {
    queryKey: queryKeys.me,
    queryFn: () => apiFetch<MeResponse>('/api/auth/me'),
    staleTime: QUERY_STALE_TIME_MS,
  },
  apps: {
    queryKey: queryKeys.apps,
    queryFn: () => apiFetch<AppItem[]>('/api/apps'),
    staleTime: QUERY_STALE_TIME_MS,
  },
};
