import Link from 'next/link';

const adminMenu = [
  {
    title: 'Manage Users',
    description: 'Create and review username accounts',
    href: '/admin/users',
  },
];

export default function AdminDashboardPage() {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Manage users, permissions, and admin tools from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-36 overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md"
          >
            <div className="flex w-16 items-center justify-center bg-blue-50 text-blue-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-current"
              >
                <path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.24.47-2.35 1.27-3.28A12.1 12.1 0 0 0 8 13Zm8 0c-2.21 0-6 1.12-6 3.33V19h12v-2.67C22 14.12 18.21 13 16 13Z" />
              </svg>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.description}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-blue-500">
                Admin
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
