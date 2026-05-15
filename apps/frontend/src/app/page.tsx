import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export default function Home() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    redirect('/hub');
  }
  redirect('/login');
}
