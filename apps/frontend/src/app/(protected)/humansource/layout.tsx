import { ReactNode } from 'react';
import { HrShell } from '@/components/humansource/hr-shell';

export default function HumansourceLayout({ children }: { children: ReactNode }) {
  return <HrShell>{children}</HrShell>;
}
