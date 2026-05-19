import Link from 'next/link';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { ArrowLeftIcon, UsersIcon } from '@/components/ui/icons';

const adminMenu = [
  {
    title: 'Manage Users',
    description: 'Create accounts, assign roles, and control Hub access.',
    href: '/admin/users',
  },
];

export default function AdminDashboardPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Manage users, permissions, and admin tools from one place."
      />

      <DataPanel className="p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {adminMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[104px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50/35"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Admin
                  </p>
                  <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">
                    {item.title}
                  </h2>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#1478ff]">
                  <UsersIcon />
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Users
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0752d6] transition group-hover:translate-x-0.5">
                  Open <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </DataPanel>
    </PageShell>
  );
}
