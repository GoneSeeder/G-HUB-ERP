'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { clearAuthTokenCookie, IDLE_TIMEOUT_MS, isSessionIdleExpired, touchSessionActivity } from '@/lib/auth';
import { FolderIcon, LogOutIcon } from '@/components/ui/icons';

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

  useEffect(() => {
    let lastTouch = 0;
    const resetIdleTimer = () => {
      const now = Date.now();
      if (now - lastTouch < 1000) {
        return;
      }
      lastTouch = now;
      touchSessionActivity();
    };

    const checkIdle = () => {
      if (isSessionIdleExpired()) {
        clearAuthTokenCookie();
        router.push('/login');
        router.refresh();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    const intervalId = window.setInterval(checkIdle, Math.min(IDLE_TIMEOUT_MS, 60 * 1000));

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
      window.clearInterval(intervalId);
    };
  }, [router]);

  const logout = () => {
    clearAuthTokenCookie();
    router.push('/login');
    router.refresh();
  };

  const navLinkClass = (path: string) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors ${
      pathname.startsWith(path)
        ? 'border-slate-200 bg-white text-slate-950'
        : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-950'
    }`;

  return (
    <div className="h-screen overflow-hidden bg-[#f5f8fc] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f5f8fc]/95 backdrop-blur">
        <div className="mx-auto flex min-h-12 max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-4">
            <Link
              href="/hub"
              className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-white"
            >
              <img
                src="/g-hub-nav-logo.png"
                alt="G-HUB"
                className="h-11 w-11 rounded-xl object-contain"
              />
            </Link>
            <nav className="flex items-center gap-2">
              {canSeeAdmin ? (
                <Link className={navLinkClass('/admin')} href="/admin">
                  <FolderIcon className="h-3.5 w-3.5" />
                  Admin Dashboard
                </Link>
              ) : null}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="toolbar-btn min-h-9 px-3"
          >
            <LogOutIcon className="erp-action-icon" />
            Log out
          </button>
        </div>
      </header>
      <main className="h-[calc(100vh-49px)] w-full overflow-auto px-4 py-6">{children}</main>
    </div>
  );
}
