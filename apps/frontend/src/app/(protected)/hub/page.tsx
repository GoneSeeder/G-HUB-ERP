'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthTokenCookie } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

interface MeResponse {
  sub: string;
  username: string;
  name: string;
  roles: string[];
  apps: string[];
}

interface AppItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

const informationApps = [
  'information-member',
  'information-bonus-card',
  'information-booking',
];

const appHrefByCode: Record<string, string | undefined> = {
  'information-member': '/information/member',
  'information-bonus-card': '/information/bonus-card',
  'information-booking': '/information/booking',
};

export default function HubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [me, availableApps] = await Promise.all([
          apiFetch<MeResponse>('/api/auth/me'),
          apiFetch<AppItem[]>('/api/apps'),
        ]);
        setProfile(me);
        setApps(availableApps.filter((app) => me.apps.includes(app.code)));
      } catch {
        clearAuthTokenCookie();
        setError('Your session has expired. Please sign in again.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return <p className="text-gray-600">Loading hub...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Hub</h1>
        <p className="mt-2 text-slate-600">Welcome back, {profile?.name}.</p>
      </div>
      {profile?.apps.includes('information') ? (
        <section className="overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                >
                  <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h4.1c.84 0 1.63.38 2.15 1.04l.72.92c.24.31.61.49 1 .49h4.53A2.75 2.75 0 0 1 21 9.2v8.05A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Information
                </h2>
                <p className="text-xs text-slate-500">
                  Application folder for information workflows
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps
              .filter((app) => informationApps.includes(app.code))
              .map((app) => (
                <Link
                  key={app.id}
                  href={appHrefByCode[app.code] ?? '#'}
                  className="flex min-h-28 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)]"
                  aria-disabled={!appHrefByCode[app.code]}
                >
                  <div className="flex w-14 items-center justify-center bg-blue-50 text-blue-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Zm3 1.25v2.5h10v-2.5H7Zm0 5v1.5h10v-1.5H7Zm0 4v1.5h6v-1.5H7Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 p-4">
                    <h3 className="truncate text-base font-semibold text-slate-950">
                      {app.name}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {app.description ?? 'No description'}
                    </p>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                      {app.code}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ) : (
        <div className="border border-white/60 bg-white/55 px-5 py-8 text-sm text-slate-600 shadow-[0_12px_26px_rgba(98,56,42,0.12)] backdrop-blur-sm">
          No apps are available for this user.
        </div>
      )}
    </section>
  );
}
