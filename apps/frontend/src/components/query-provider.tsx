'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

// Silence noisy recharts warnings (defaultProps deprecation) so they don't show
// up as "errors" in the Next.js dev overlay. Recharts 2.x still uses
// defaultProps on function components which React 18.3+ logs as an error.
function useSuppressRechartsWarnings() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (
        first.includes('Support for defaultProps will be removed') ||
        first.includes('defaultProps will be removed from function components')
      ) {
        return;
      }
      origError.apply(console, args as []);
    };
    return () => { console.error = origError; };
  }, []);
}

export function QueryProvider({ children }: { children: ReactNode }) {
  useSuppressRechartsWarnings();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

