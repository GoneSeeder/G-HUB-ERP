'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppCard } from '@/components/ui/app-card';
import {
  CardIcon,
  FolderIcon,
  InventoryIcon,
  ListIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageShell } from '@/components/ui/page-shell';
import { apiFetch } from '@/lib/api';
import { clearAuthTokenCookie } from '@/lib/auth';

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

type HubAppMeta = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: 'users' | 'booking' | 'card' | 'list' | 'report';
};

const informationApps = [
  'information-name-list',
  'information-booking',
  'information-bonus-card',
  'information-member',
  'information-report',
];

const salesCards = [
  {
    id: 'sales-sales-planned',
    code: 'sales-sales',
    eyebrow: 'Sales',
    title: 'Sales',
    description: 'Quotation and sales order workflow',
    accent: 'bg-indigo-50 text-indigo-600',
    icon: 'card' as const,
  },
  {
    id: 'sales-crm-planned',
    code: 'sales-crm',
    eyebrow: 'CRM',
    title: 'CRM',
    description: 'Customer pipeline and follow-up tracking',
    accent: 'bg-rose-50 text-rose-600',
    icon: 'users' as const,
  },
  {
    id: 'sales-pos-planned',
    code: 'sales-pos',
    eyebrow: 'POS',
    title: 'Point Of Sale (POS)',
    description: 'Retail checkout and daily sales register',
    accent: 'bg-amber-50 text-amber-600',
    icon: 'booking' as const,
  },
];

const appHrefByCode: Record<string, string | undefined> = {
  'information-member': '/information/member',
  'information-bonus-card': '/information/bonus-card',
  'information-booking': '/information/booking',
  'information-name-list': '/information/name-list',
};

const appMetaByCode: Record<string, HubAppMeta> = {
  'information-booking': {
    eyebrow: 'Operations',
    title: 'Booking',
    description: 'Import Main/Detail files and review daily bookings',
    accent: 'bg-emerald-50 text-emerald-600',
    icon: 'booking',
  },
  'information-name-list': {
    eyebrow: 'Passenger Data',
    title: 'Name List',
    description: 'Passenger manifests and Excel import workflow',
    accent: 'bg-blue-50 text-blue-600',
    icon: 'list',
  },
  'information-member': {
    eyebrow: 'Master Data',
    title: 'Members',
    description: 'Agent and guide records used across operations',
    accent: 'bg-violet-50 text-violet-600',
    icon: 'users',
  },
  'information-bonus-card': {
    eyebrow: 'Document',
    title: 'Bonus Card',
    description: 'Create and verify bonus card records from bookings',
    accent: 'bg-orange-50 text-orange-600',
    icon: 'card',
  },
  'information-report': {
    eyebrow: 'Report',
    title: 'Reports',
    description: 'Operational reports and analytics dashboard',
    accent: 'bg-slate-100 text-slate-600',
    icon: 'report',
  },
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
    return (
      <div className="flex h-full items-center justify-center">
        <div className="erp-fade-in rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-500 shadow-sm">
          Loading hub...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="erp-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  const visibleInformationApps = apps.filter((app) =>
    informationApps.includes(app.code),
  );
  const canSeeInformation = profile?.apps.includes('information');
  const informationCards = canSeeInformation
    ? [
        ...visibleInformationApps,
        ...(visibleInformationApps.some((app) => app.code === 'information-report')
          ? []
          : [
              {
                id: 'information-report-planned',
                code: 'information-report',
                name: 'Reports',
                description: 'Operational reports and analytics dashboard',
              },
            ]),
      ]
    : [];
  const canSeeSupplyChain =
    profile?.apps.includes('inventory') ||
    profile?.apps.includes('inventory-stock');
  const canSeeSales =
    profile?.apps.includes('sales') ||
    salesCards.some((app) => profile?.apps.includes(app.code));
  const activeCount = visibleInformationApps.filter((app) => app.code !== 'information-report').length;
  const plannedCount = (canSeeSupplyChain ? 1 : 0) + (canSeeSales ? salesCards.length : 0);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <PageShell className="gap-6">
      <header className="erp-slide-down border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              G-HUB · ERP 2026
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">
              {greeting},{' '}
              <span className="text-[#0752d6]">
                {profile?.name ?? 'G-HUB Admin'}
              </span>
            </h1>
            <p className="mt-1 text-sm font-light text-slate-500">
              Select a module to start daily operations.
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-normal text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {activeCount} active
            </span>
            {plannedCount ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {plannedCount} planned
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {canSeeInformation ? (
        <section className="erp-slide-right space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-sm font-semibold text-slate-950">Information</h2>
              <p className="text-xs font-light text-slate-500">
                Daily operation modules and master data
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-normal text-slate-500">
              ERP 2026
            </span>
          </div>

          <div className="erp-hub-grid grid gap-3 md:grid-cols-2">
            {informationCards.map((app) => {
              const meta = appMetaByCode[app.code] ?? {
                eyebrow: 'Application',
                title: app.name,
                description: app.description ?? 'No description',
                accent: 'bg-slate-50 text-slate-500',
                icon: 'booking' as const,
              };

              return (
                <AppCard
                  key={app.id}
                  href={appHrefByCode[app.code]}
                  eyebrow={meta.eyebrow}
                  title={meta.title}
                  description={meta.description}
                  code={app.code.replace('information-', '')}
                  className="opacity-0"
                  disabled={app.code === 'information-report'}
                  icon={
                    <HubIconBadge accent={meta.accent}>
                      <HubIcon type={meta.icon} />
                    </HubIconBadge>
                  }
                />
              );
            })}
          </div>
        </section>
      ) : (
        <div className="erp-soft-card px-5 py-8 text-sm text-slate-600">
          No apps are available for this user.
        </div>
      )}

      {canSeeSupplyChain ? (
        <section className="erp-slide-left space-y-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-sm font-semibold text-slate-950">Supply Chain</h2>
            <p className="text-xs font-light text-slate-500">
              Stock and warehouse workflows
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <AppCard
              disabled
              eyebrow="Warehouse"
              title="Inventory"
              description="Stock receiving, issue, and inventory count workflow"
              code="inventory"
              icon={
                <HubIconBadge accent="bg-teal-50 text-teal-600">
                  <InventoryIcon />
                </HubIconBadge>
              }
            />
          </div>
        </section>
      ) : null}

      {canSeeSales ? (
      <section className="erp-slide-right space-y-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-semibold text-slate-950">Sales</h2>
          <p className="text-xs font-light text-slate-500">
            Customer and point of sale workflows
          </p>
        </div>

        <div className="erp-hub-grid grid gap-3 md:grid-cols-2">
          {salesCards.map((app) => (
            <AppCard
              key={app.id}
              disabled
              eyebrow={app.eyebrow}
              title={app.title}
              description={app.description}
              code={app.code.replace('sales-', '')}
              icon={
                <HubIconBadge accent={app.accent}>
                  <HubIcon type={app.icon} />
                </HubIconBadge>
              }
            />
          ))}
        </div>
      </section>
      ) : null}
    </PageShell>
  );
}

function HubIconBadge({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}
    >
      {children}
    </div>
  );
}

function HubIcon({ type }: { type: HubAppMeta['icon'] }) {
  if (type === 'users') return <UsersIcon />;
  if (type === 'card') return <CardIcon />;
  if (type === 'list') return <ListIcon />;
  if (type === 'report') return <FolderIcon />;
  return <FolderIcon />;
}
