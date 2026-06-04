import type { Metadata } from 'next';
import { QueryProvider } from '@/components/query-provider';
import { DialogProvider } from '@/components/ui/dialog-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'G-HUB',
  description: 'Full-stack web application',
  icons: {
    icon: '/logo-ghub.png',
    shortcut: '/logo-ghub.png',
    apple: '/logo-ghub.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <DialogProvider>{children}</DialogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
