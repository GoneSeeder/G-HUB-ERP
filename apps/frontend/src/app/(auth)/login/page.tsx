'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@/components/ui/icons';
import { LoginCodeSliceBackground } from '@/components/ui/login-code-slice-background';
import { LoadingState } from '@/components/ui/loading-state';
import { SvgPageTransition } from '@/components/ui/svg-page-transition';
import { getApiBaseUrl } from '@/lib/api';
import { setAuthTokenCookie } from '@/lib/auth';
import { queryOptions } from '@/lib/queries';

const API_URL = getApiBaseUrl();
const LOGIN_TRANSITION_MS = 1700;
const HUB_LOADING_GRACE_MS = 2000;

interface LoginResponse {
  accessToken: string;
}

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
};

function getLoginErrorMessage(response: Response, data?: ApiErrorResponse) {
  const rawMessage = Array.isArray(data?.message)
    ? data?.message[0]
    : data?.message;
  const message = rawMessage?.trim();

  if (message && !message.includes('เธ')) {
    return message;
  }

  if (response.status === 401) {
    return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
  }

  if (response.status === 400) {
    return 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
  }

  return data?.error ?? 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง';
}

function isLoginResponse(data: LoginResponse | ApiErrorResponse | null): data is LoginResponse {
  return Boolean(data && 'accessToken' in data && data.accessToken);
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showHubLoading, setShowHubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showPassword = username.trim().length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const loginUsername = username.trim();
    const loginPassword = password.trim();

    if (!loginUsername) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    if (!loginPassword) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setError(null);
    setLoading(true);
    setShowHubLoading(false);
    let hubLoadingTimer: number | undefined;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = (await response.json().catch(() => null)) as
        | LoginResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        throw new Error(getLoginErrorMessage(response, data && !isLoginResponse(data) ? data : undefined));
      }

      if (!isLoginResponse(data)) {
        throw new Error('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
      }

      setAuthTokenCookie(data.accessToken);
      queryClient.clear();
      setLoading(false);
      setShowTransition(true);
      hubLoadingTimer = window.setTimeout(() => {
        setShowTransition(false);
        setShowHubLoading(true);
      }, LOGIN_TRANSITION_MS + HUB_LOADING_GRACE_MS);

      const hubDataReady = Promise.all([
        queryClient.prefetchQuery(queryOptions.me),
        queryClient.prefetchQuery(queryOptions.apps),
      ]);

      await hubDataReady;
      if (hubLoadingTimer) {
        window.clearTimeout(hubLoadingTimer);
      }
      router.push('/hub');
      router.refresh();
    } catch (submitError) {
      if (hubLoadingTimer) {
        window.clearTimeout(hubLoadingTimer);
      }
      setError(
        submitError instanceof Error ? submitError.message : 'Login failed',
      );
      setShowTransition(false);
      setShowHubLoading(false);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-slate-950">
      {showTransition ? <SvgPageTransition /> : null}
      {showHubLoading ? (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-white">
          <LoadingState label="Loading hub..." className="min-h-0" />
        </div>
      ) : null}
      <LoginCodeSliceBackground />
      {!showTransition ? <div className="erp-fade-in relative z-20 w-full max-w-[420px]">
        <form
          noValidate
          onSubmit={onSubmit}
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:px-8"
        >
          <div className="mb-7 text-center">
            <img
              src="/logo-login.png"
              alt="G-HUB"
              className="mx-auto h-auto w-full max-w-[148px] rounded-md object-contain"
            />
            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">Secure sign in</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-950">Welcome back</h1>
            <p className="mt-1 text-sm font-light text-slate-500">Continue to your G-HUB workspace.</p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Username</span>
              <span className="flex h-11 rounded-lg border border-slate-200 bg-white transition focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
                <span className="flex w-11 items-center justify-center text-slate-400">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter username"
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
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showPassword ? 'max-h-24 translate-y-0 opacity-100' : 'max-h-0 -translate-y-2 opacity-0'
              }`}
            >
              <label className="block space-y-1.5 pb-1">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <span className="flex h-11 rounded-lg border border-slate-200 bg-white transition focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
                  <span className="flex w-11 items-center justify-center text-slate-400">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M17 8h-1V6c0-2.76-1.79-5-4-5S8 3.24 8 6v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-7-2c0-1.66.9-3 2-3s2 1.34 2 3v2h-4V6Z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    required={showPassword}
                    disabled={!showPassword}
                    placeholder="Enter password"
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

          <button type="submit" disabled={loading || showTransition} className="toolbar-btn-primary mt-6 h-11 w-full rounded-lg">
            <CheckIcon className="h-4 w-4" />
            {loading && !showTransition ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>ERP 2026</span>
            <span className="font-medium text-slate-700">G-HUB</span>
          </div>
        </form>
      </div> : null}
    </main>
  );
}
