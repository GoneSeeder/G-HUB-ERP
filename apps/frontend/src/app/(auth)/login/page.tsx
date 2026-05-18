'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthTokenCookie } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface LoginResponse {
  accessToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showPassword = username.trim().length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = (await response.json()) as LoginResponse;
      setAuthTokenCookie(data.accessToken);
      router.push('/hub');
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f9fd] px-4 py-10 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-100/70" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-[440px] rounded-[10px] border border-slate-200/80 bg-white/95 px-8 py-9 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <div className="mb-8">
          <div className="mb-6 flex justify-center">
            <img
              src="/g-hub-login-logo.png"
              alt="G-HUB"
              className="h-auto w-full max-w-[220px] rounded-md object-contain"
            />
          </div>
          <h1 className="text-[28px] font-semibold leading-tight text-slate-950">
            Welcome to G-HUB
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please sign in with your username to continue to G-HUB
          </p>
        </div>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Username</span>
            <span className="flex h-12 rounded-md border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <span className="flex w-12 items-center justify-center text-slate-400">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
                </svg>
              </span>
              <input
                type="text"
                required
                placeholder="Enter your username"
                value={username}
                onChange={(event) => {
                  const nextUsername = event.target.value;
                  setUsername(nextUsername);
                  if (!nextUsername.trim()) {
                    setPassword('');
                  }
                }}
                className="min-w-0 flex-1 bg-transparent pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </span>
          </label>

          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              showPassword
                ? 'max-h-24 translate-y-0 opacity-100'
                : 'max-h-0 -translate-y-3 opacity-0'
            }`}
          >
            <label className="block space-y-2 pb-1">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <span className="flex h-12 rounded-md border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <span className="flex w-12 items-center justify-center text-slate-400">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M17 8h-1V6c0-2.76-1.79-5-4-5S8 3.24 8 6v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-7-2c0-1.66.9-3 2-3s2 1.34 2 3v2h-4V6Z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required={showPassword}
                  disabled={!showPassword}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </span>
            </label>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-700 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-800 disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M17 8h-1V6c0-2.76-1.79-5-4-5S8 3.24 8 6v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-7-2c0-1.66.9-3 2-3s2 1.34 2 3v2h-4V6Z" />
          </svg>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="mt-8 flex justify-center text-xs text-slate-400">
          <span>© 2026 G-HUB. All rights reserved.</span>
        </div>
      </form>
    </main>
  );
}
