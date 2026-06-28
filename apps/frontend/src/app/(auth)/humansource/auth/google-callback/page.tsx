'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthTokenCookie } from '@/lib/auth';
import { setHrSessionSnapshot, getHrSessionDestination } from '@/lib/hr-auth';
import { apiFetch } from '@/lib/api';
import type { HrSession } from '@/lib/hr-auth';

export default function HrGoogleCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/humansource/login?error=google');
      return;
    }

    setAuthTokenCookie(token);

    apiFetch<{ session: HrSession }>('/api/humansource/auth/login-with-ghub', { method: 'POST' })
      .then((data) => {
        setHrSessionSnapshot(data.session);
        router.replace(getHrSessionDestination(data.session));
      })
      .catch(() => {
        router.replace('/humansource/login?error=google');
      });
  }, [params, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}
