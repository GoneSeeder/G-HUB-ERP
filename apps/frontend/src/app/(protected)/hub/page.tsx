'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppCard } from '@/components/ui/app-card';
import {
  CardIcon,
  InventoryIcon,
  ListIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageShell } from '@/components/ui/page-shell';
import { LoadingState } from '@/components/ui/loading-state';
import { clearAuthTokenCookie } from '@/lib/auth';
import { queryOptions } from '@/lib/queries';

type HubAppMeta = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: 'users' | 'booking' | 'card' | 'list' | 'lecture' | 'report' | 'hr';
};

const informationApps = [
  'information-name-list',
  'information-booking',
  'information-bonus-card',
  'information-member',
  'information-lecture-room',
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

const humansourceCard = {
  id: 'humansource-module',
  code: 'humansource',
  eyebrow: 'People Ops',
  title: 'Humansource',
  description: 'Modern HR workspace สำหรับข้อมูลองค์กร พนักงาน Payroll และรายงาน',
  accent: 'bg-indigo-50 text-indigo-600',
  icon: 'hr' as const,
};

const appHrefByCode: Record<string, string | undefined> = {
  'information-member': '/information/member',
  'information-bonus-card': '/information/bonus-card',
  'information-booking': '/information/booking',
  'information-name-list': '/information/name-list',
  'information-lecture-room': '/information/lecture-room',
  'information-report': '/information/report',
  humansource: '/humansource/dashboard',
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
  'information-lecture-room': {
    eyebrow: 'Data management',
    title: 'Lecture Room',
    description: 'Manage lecture rooms, speaker information, and daily lecture schedules',
    accent: 'bg-pink-50 text-pink-600',
    icon: 'lecture',
  },
  'information-report': {
    eyebrow: 'Report',
    title: 'Reports',
    description: 'Operational reports and analytics dashboard',
    accent: 'bg-sky-50 text-sky-600',
    icon: 'report',
  },
};

export default function HubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery(queryOptions.me);
  const {
    data: availableApps = [],
    isLoading: appsLoading,
    isError: appsError,
  } = useQuery(queryOptions.apps);

  useEffect(() => {
    if (!profileError && !appsError) return;

    queryClient.clear();
    clearAuthTokenCookie();
    setError('Your session has expired. Please sign in again.');
    router.push('/login');
  }, [appsError, profileError, queryClient, router]);

  const loading = profileLoading || appsLoading;

  if (loading) {
    return <LoadingState label="Loading hub..." className="h-full" />;
  }

  if (error) {
    return (
      <div className="erp-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  const apps = profile
    ? availableApps.filter((app) => profile.apps.includes(app.code))
    : [];
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
        <section className="erp-content-enter space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-sm font-semibold text-slate-950">Information</h2>
              <p className="text-xs font-light text-slate-500">
                Daily operation modules and master data
              </p>
            </div>
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
        <section className="erp-content-enter space-y-3">
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

      <section className="erp-content-enter space-y-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-semibold text-slate-950">Human Resource</h2>
          <p className="text-xs font-light text-slate-500">
            HR workspace — พนักงาน เงินเดือน การประเมิน และรายงาน
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AppCard
            href={appHrefByCode[humansourceCard.code]}
            eyebrow="Human Resource"
            title="Humansource (HR)"
            description="จัดการข้อมูลพนักงาน เงินเดือน การประเมิน และรายงาน HR ครบวงจร"
            code="HR"
            icon={
              <HubIconBadge accent={humansourceCard.accent}>
                <HubIcon type={humansourceCard.icon} />
              </HubIconBadge>
            }
          />
        </div>
      </section>

      {canSeeSales ? (
      <section className="erp-content-enter space-y-3">
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
  if (type === 'booking') return <BookingHubIcon />;
  if (type === 'lecture') return <LectureHubIcon />;
  if (type === 'report') return <ReportHubIcon />;
  if (type === 'hr') return <UsersIcon />;
  return <ListIcon />;
}

function BookingHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M7 2.75A.75.75 0 0 1 7.75 2h.5a.75.75 0 0 1 .75.75V4h6V2.75A.75.75 0 0 1 15.75 2h.5a.75.75 0 0 1 .75.75V4h.75A3.25 3.25 0 0 1 21 7.25v10.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V7.25A3.25 3.25 0 0 1 6.25 4H7V2.75ZM5 9v8.75C5 18.44 5.56 19 6.25 19h11.5c.69 0 1.25-.56 1.25-1.25V9H5Zm11.53 3.53-4.25 4.25a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47 3.72-3.72a.75.75 0 1 1 1.06 1.06Z" />
    </svg>
  );
}

function LectureHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M4.5 4A2.5 2.5 0 0 0 2 6.5v8A2.5 2.5 0 0 0 4.5 17H11v2H8.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5H13v-2h6.5a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 19.5 4h-15Zm2 4.25A1.25 1.25 0 1 1 9 8.25a1.25 1.25 0 0 1-2.5 0Zm4.25-.5h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5Zm0 3h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM5.75 13.5c0-1.24 1.01-2.25 2.25-2.25h.5c1.24 0 2.25 1.01 2.25 2.25V14h-5v-.5Z" />
    </svg>
  );
}

function ReportHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M6.75 2.5A2.75 2.75 0 0 0 4 5.25v13.5a2.75 2.75 0 0 0 2.75 2.75h10.5A2.75 2.75 0 0 0 20 18.75V8.62a2.75 2.75 0 0 0-.8-1.94L15.82 3.3a2.75 2.75 0 0 0-1.94-.8H6.75Zm7.5 1.95V7c0 .41.34.75.75.75h2.55l-3.3-3.3ZM8 17.25a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0v2.5Zm3.25 0a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0v5Zm3.25 0a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 1.5 0v3.5Zm2.5.75a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-1.5 0v6.5c0 .41.34.75.75.75Z" />
    </svg>
  );
}
