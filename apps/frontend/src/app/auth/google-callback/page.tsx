'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthTokenCookie } from '@/lib/auth';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setAuthTokenCookie(token);
      router.replace('/');
    } else {
      router.replace('/login?error=google');
    }
  }, [params, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#6b7280' }}>กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}
