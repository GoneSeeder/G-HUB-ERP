'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { clearAuthTokenCookie } from '@/lib/auth';

interface MeResponse {
  roles: string[];
  apps: string[];
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [canSeeAdmin, setCanSeeAdmin] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>('/api/auth/me')
      .then((me) => {
        setCanSeeAdmin(me.roles.includes('admin') && me.apps.includes('admin'));
      })
      .catch(() => setCanSeeAdmin(false));
  }, []);

  const logout = () => {
    clearAuthTokenCookie();
    router.push('/login');
    router.refresh();
  };

  const navLinkClass = (path: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      pathname.startsWith(path)
        ? 'bg-blue-700 text-white shadow-sm'
        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
    }`;

  return (
    <div className="h-screen overflow-hidden bg-[#e7eef6] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/hub"
              className="flex h-12 w-12 items-center justify-center rounded-xl transition hover:bg-blue-50"
            >
              <img
                src="/g-hub-nav-logo.png"
                alt="G-HUB"
                className="h-11 w-11 rounded-xl object-contain"
              />
            </Link>
            <nav className="flex items-center gap-2">
              <Link className={navLinkClass('/hub')} href="/hub">
                Hub
              </Link>
              {canSeeAdmin ? (
                <Link className={navLinkClass('/admin')} href="/admin">
                  Admin Dashboard
                </Link>
              ) : null}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="toolbar-btn"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="h-[calc(100vh-73px)] w-full overflow-hidden p-4">{children}</main>
    </div>
  );
}
