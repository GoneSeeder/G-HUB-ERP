'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HrShell } from '@/components/humansource/hr-shell';
import { getHrSessionDestination, getHrSessionSnapshot } from '@/lib/hr-auth';

// HR auth pages render without the shell when they are colocated under this segment.
const HR_AUTH_PATHS = [
  '/humansource/login',
  '/humansource/signup',
  '/humansource/invite',
  '/humansource/pending',
  '/humansource/no-company',
  '/humansource/link-ghub',
];

export default function HumansourceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (HR_AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return <>{children}</>;
  }
  return <HrAccessGate>{children}</HrAccessGate>;
}

function HrAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getHrSessionSnapshot();
    if (!session) {
      router.replace('/humansource/login');
      return;
    }

    const destination = getHrSessionDestination(session);
    if (destination !== '/humansource') {
      router.replace(destination);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f8fb] text-sm font-medium text-slate-500">
        กำลังตรวจสอบสิทธิ์ HumanSource...
      </div>
    );
  }

  return <HrShell>{children}</HrShell>;
}
