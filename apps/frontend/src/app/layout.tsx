import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
