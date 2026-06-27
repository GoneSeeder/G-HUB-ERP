'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getHrSessionSnapshot,
  getHrSessionDestination,
  linkHrAccountWithCode,
  loginHrAccount,
  setHrSessionSnapshot,
} from '@/lib/hr-auth';

type AuthView = 'login' | 'pending' | 'disabled' | 'no-company' | 'link-code';
type LinkCodeState = 'idle' | 'loading' | 'expired' | 'invalid' | 'used' | 'success';

// ── Icons (stroke, 1.6px, currentColor) ──────────────────────────────────────

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconAlertCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconBan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconHash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconGhub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="m7 10 3 3 7-7" />
    </svg>
  );
}

function IconGoogle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HrLoginPage() {
  const router = useRouter();

  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const [linkCode, setLinkCode] = useState('');
  const [linkCodeState, setLinkCodeState] = useState<LinkCodeState>('idle');
  const [codeSeconds, setCodeSeconds] = useState(599);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('state') === 'disabled') {
      setView('disabled');
    }
  }, []);

  // Countdown timer for link code
  useEffect(() => {
    if (view !== 'link-code' || codeSeconds <= 0) return;
    const id = window.setInterval(
      () => setCodeSeconds(s => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [view, codeSeconds]);

  // Focus code input on enter link-code view
  useEffect(() => {
    if (view === 'link-code') {
      setTimeout(() => codeInputRef.current?.focus(), 80);
    }
  }, [view]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim();
    const trimPass = password.trim();

    const eErr = !trimEmail
      ? 'กรุณากรอก Email'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)
        ? 'รูปแบบ Email ไม่ถูกต้อง'
        : '';
    const pErr = !trimPass ? 'กรุณากรอกรหัสผ่าน' : '';

    setEmailError(eErr);
    setPasswordError(pErr);
    setFormError('');

    if (eErr) { setTimeout(() => emailRef.current?.focus(), 0); return; }
    if (pErr) { setTimeout(() => passwordRef.current?.focus(), 0); return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const session = await loginHrAccount(trimEmail, trimPass);

      if (session.accountStatus === 'disabled') {
        setView('disabled');
        return;
      }

      router.push(getHrSessionDestination(session));
      return;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCode = async (e: FormEvent) => {
    e.preventDefault();
    if (linkCode.length !== 6 || linkCodeState === 'loading') return;

    setLinkCodeState('loading');
    await new Promise(r => setTimeout(r, 700));

    const code = linkCode.toUpperCase();
    const sessionEmail = email.trim().toLowerCase() || getHrSessionSnapshot()?.email || '';
    const result = codeSeconds === 0
      ? 'expired'
      : sessionEmail
        ? (await linkHrAccountWithCode(sessionEmail, code)).result
        : 'invalid';

    if (result === 'expired') {
      setLinkCodeState('expired');
    } else if (result === 'used') {
      setLinkCodeState('used');
    } else if (result === 'success') {
      setLinkCodeState('success');
      setTimeout(() => router.push('/humansource'), 1400);
    } else {
      setLinkCodeState('invalid');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      const session = await loginHrAccount('google.user@gmail.com', 'google-oauth-mock');
      // Bypass: Google login treats account as already linked (no real OAuth yet)
      const linkedSession = { ...session, hasGhubLink: true };
      setHrSessionSnapshot(linkedSession);
      window.localStorage.setItem('g-hub.hr.ghub-linked', 'true');
      router.push(getHrSessionDestination(linkedSession));
    } catch {
      // Google OAuth ยังไม่เชื่อม backend — stub
    } finally {
      setGoogleLoading(false);
    }
  };

  const goToLinkCode = () => {
    setLinkCode('');
    setLinkCodeState('idle');
    setCodeSeconds(599);
    setView('link-code');
  };

  // ── Computed ─────────────────────────────────────────────────────────────────

  const isCodeExpired =
    linkCodeState === 'expired' ||
    (codeSeconds === 0 && linkCodeState !== 'success' && linkCodeState !== 'loading');

  const codeErrorMsg =
    linkCodeState === 'expired' || isCodeExpired
      ? 'รหัสนี้หมดอายุแล้ว กรุณาขอรหัสใหม่จาก HR'
      : linkCodeState === 'invalid'
        ? 'รหัสเชื่อมต่อไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
        : linkCodeState === 'used'
          ? 'รหัสนี้ถูกใช้ไปแล้ว กรุณาขอรหัสใหม่จาก HR'
          : null;

  const viewTitles: Record<AuthView, string> = {
    login: 'เข้าสู่ระบบ',
    pending: 'รอการอนุมัติ',
    disabled: 'บัญชีถูกระงับ',
    'no-company': 'เชื่อมต่อข้อมูลพนักงาน',
    'link-code': 'รหัสเชื่อมต่อ',
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="hr-login-root">
      {/* Decorative hex — visible on wide screens */}
      <div className="hr-login-decor" aria-hidden="true">
        <svg viewBox="0 0 120 138" fill="none" xmlns="http://www.w3.org/2000/svg" className="hr-login-decor__hex">
          <path d="M60 4L114 34V88L60 118L6 88V34L60 4Z" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="rgba(20,13,56,0.30)" />
          <path d="M60 18L100 42V82L60 106L20 82V42L60 18Z" stroke="rgba(167,139,250,0.20)" strokeWidth="1" fill="none" />
          <text x="60" y="63" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="800" fill="rgba(167,139,250,0.65)" fontFamily="inherit">HR</text>
        </svg>
      </div>

      <div className="hr-login-card">

        {/* Logo */}
        <div className="hr-login-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hr-logo.png" alt="HumanSource HR" className="hr-login-logo" />
        </div>

        {/* Brand heading */}
        <div className="hr-login-brand">
          <h1 className="hr-login-brand-title">{viewTitles[view]}</h1>
          {view === 'login' && (
            <p className="hr-login-brand-sub">
              เข้าสู่ระบบเพื่อจัดการทีมและพนักงานของคุณ
            </p>
          )}
        </div>

        <div className="hr-login-brand-sep" aria-hidden="true" />

        {/* ── Login form ──────────────────────────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="hr-login-field">
              <label className="hr-login-field__label" htmlFor="hr-email">
                อีเมล
              </label>
              <div className="hr-login-field__input-wrap">
                <span className="hr-login-field__icon">
                  <IconMail className="hr-login-icon-xs" />
                </span>
                <input
                  ref={emailRef}
                  id="hr-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ชื่อผู้ใช้@บริษัท.com"
                  value={email}
                  onChange={ev => {
                    setEmail(ev.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`hr-login-field__control hr-login-field__control--icon${emailError ? ' hr-login-field__control--error' : ''}`}
                  aria-describedby={emailError ? 'hr-email-err' : undefined}
                  aria-invalid={!!emailError}
                />
              </div>
              {emailError && (
                <span id="hr-email-err" className="hr-login-field__error" role="alert">
                  <IconAlertCircle className="hr-login-icon-xs" />
                  {emailError}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="hr-login-field">
              <label className="hr-login-field__label" htmlFor="hr-password">
                รหัสผ่าน
              </label>
              <div className="hr-login-field__input-wrap">
                <span className="hr-login-field__icon">
                  <IconLock className="hr-login-icon-xs" />
                </span>
                <input
                  ref={passwordRef}
                  id="hr-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={ev => {
                    setPassword(ev.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`hr-login-field__control hr-login-field__control--icon hr-login-field__control--icon-right${passwordError ? ' hr-login-field__control--error' : ''}`}
                  aria-describedby={passwordError ? 'hr-pass-err' : undefined}
                  aria-invalid={!!passwordError}
                />
                <button
                  type="button"
                  className="hr-login-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <IconEyeOff className="hr-login-icon-xs" />
                    : <IconEye className="hr-login-icon-xs" />}
                </button>
              </div>
              {passwordError && (
                <span id="hr-pass-err" className="hr-login-field__error" role="alert">
                  <IconAlertCircle className="hr-login-icon-xs" />
                  {passwordError}
                </span>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="hr-login-row hr-login-row--between">
              <label className="hr-login-checkbox-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={ev => setRemember(ev.target.checked)}
                />
                <span>จดจำฉันไว้</span>
              </label>
              <button type="button" className="hr-login-link">
                ลืมรหัสผ่าน?
              </button>
            </div>

            {/* Form-level error */}
            {formError && (
              <div className="hr-login-form-error" role="alert">
                <IconAlertCircle className="hr-login-icon-sm hr-login-form-error__icon" />
                <span>{formError}</span>
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              className="hr-login-btn-primary"
              disabled={loading}
            >
              {loading
                ? <span className="hr-login-spinner" aria-hidden="true" />
                : null}
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ HR'}
              {!loading && <IconArrowRight className="hr-login-icon-sm" />}
            </button>

            {/* Divider */}
            <div className="hr-login-divider" aria-hidden="true">หรือ</div>

            {/* Social login group */}
            <div className="hr-login-social-group">
              <button
                type="button"
                className="hr-login-btn-secondary"
                disabled={loading || googleLoading}
                onClick={handleGoogleLogin}
              >
                {googleLoading
                  ? <span className="hr-login-spinner" aria-hidden="true" />
                  : <IconGoogle className="hr-login-icon-sm" />}
                {googleLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}
              </button>

              <div className="hr-login-social-sep" aria-hidden="true" />

              <button
                type="button"
                className="hr-login-btn-secondary"
                disabled={loading || googleLoading}
                onClick={() => {/* G-HUB OAuth — Phase 2 */}}
              >
                <IconGhub className="hr-login-icon-sm" />
                เข้าสู่ระบบด้วย G-HUB
              </button>
            </div>

            {/* Ghost links */}
            <div className="hr-login-links">
              <button type="button" className="hr-login-link" onClick={() => router.push('/humansource/signup')}>
                สมัครใช้งาน HR
              </button>
              <span className="hr-login-link-sep" aria-hidden="true">·</span>
              <button type="button" className="hr-login-link" onClick={() => router.push('/humansource/invite')}>
                มีคำเชิญแล้ว
              </button>
            </div>
          </form>
        )}

        {/* ── Pending view ──────────────────────────────────────────────── */}
        {view === 'pending' && (
          <div className="hr-login-empty">
            <div className="hr-login-empty__icon-box hr-login-empty__icon-box--amber">
              <IconClock className="hr-login-icon-lg" />
            </div>
            <h2 className="hr-login-empty__title">บัญชีรอการอนุมัติ</h2>
            <p className="hr-login-empty__desc">
              บัญชี HR ของคุณยังอยู่ในระหว่างการตรวจสอบ<br />
              HR จะแจ้งผลให้ทราบทาง Email เมื่ออนุมัติแล้ว
            </p>
            <div className="hr-login-empty__actions">
              <button type="button" className="hr-login-btn-primary" onClick={() => {}}>
                <IconMail className="hr-login-icon-sm" />
                ส่งอีเมลติดตามสถานะ
              </button>
              <button type="button" className="hr-login-btn-secondary" onClick={() => setView('login')}>
                <IconArrowLeft className="hr-login-icon-sm" />
                กลับหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}

        {/* ── Disabled view ─────────────────────────────────────────────── */}
        {view === 'disabled' && (
          <div className="hr-login-empty">
            <div className="hr-login-empty__icon-box hr-login-empty__icon-box--slate">
              <IconBan className="hr-login-icon-lg" />
            </div>
            <h2 className="hr-login-empty__title">บัญชีถูกระงับการใช้งาน</h2>
            <p className="hr-login-empty__desc">
              บัญชีนี้ถูกระงับโดยผู้ดูแล HR<br />
              กรุณาติดต่อ HR เพื่อขอเปิดใช้งานอีกครั้ง
            </p>
            <div className="hr-login-empty__actions">
              <button type="button" className="hr-login-btn-primary" onClick={() => {}}>
                ติดต่อฝ่าย HR
              </button>
              <button type="button" className="hr-login-btn-secondary" onClick={() => setView('login')}>
                <IconArrowLeft className="hr-login-icon-sm" />
                กลับหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}

        {/* ── No-company view ───────────────────────────────────────────── */}
        {view === 'no-company' && (
          <div className="hr-login-empty">
            <div className="hr-login-empty__icon-box">
              <IconLink className="hr-login-icon-lg" />
            </div>
            <h2 className="hr-login-empty__title">
              บัญชียังไม่ได้เชื่อมกับข้อมูลพนักงาน
            </h2>
            <p className="hr-login-empty__desc">
              กรุณากรอกรหัสเชื่อมต่อ 6 หลักที่ได้รับจาก HR<br />
              เพื่อเชื่อม HR Account กับข้อมูลพนักงานของคุณ
            </p>
            <div className="hr-login-empty__actions">
              <button type="button" className="hr-login-btn-primary" onClick={goToLinkCode}>
                <IconHash className="hr-login-icon-sm" />
                กรอกรหัสเชื่อมต่อ
              </button>
              <button type="button" className="hr-login-btn-secondary" onClick={() => {}}>
                ขอรหัสจาก HR
              </button>
              <button type="button" className="hr-login-btn-secondary" onClick={() => setView('login')}>
                <IconLogOut className="hr-login-icon-sm" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}

        {/* ── Link-code entry ───────────────────────────────────────────── */}
        {view === 'link-code' && (
          <form onSubmit={handleLinkCode}>
            <div className="hr-login-empty">
              <div
                className={`hr-login-empty__icon-box${linkCodeState === 'success' ? ' hr-login-empty__icon-box--success' : ''}`}
              >
                {linkCodeState === 'success'
                  ? <IconCheckCircle className="hr-login-icon-lg" />
                  : <IconHash className="hr-login-icon-lg" />}
              </div>

              <h2 className="hr-login-empty__title">
                {linkCodeState === 'success' ? 'เชื่อมต่อสำเร็จ' : 'กรอกรหัสเชื่อมต่อ'}
              </h2>
              <p className="hr-login-empty__desc">
                {linkCodeState === 'success'
                  ? 'กำลังเข้าสู่ระบบ HR...'
                  : 'กรอกรหัส 6 หลักที่ HR สร้างให้คุณ'}
              </p>

              {linkCodeState !== 'success' && (
                <>
                  <div
                    className={`hr-login-code-timer${
                      isCodeExpired
                        ? ' hr-login-code-timer--expired'
                        : codeSeconds < 60
                          ? ' hr-login-code-timer--urgent'
                          : ''
                    }`}
                  >
                    <IconClock className="hr-login-icon-xs" />
                    {isCodeExpired ? 'หมดอายุแล้ว' : `หมดอายุใน ${fmt(codeSeconds)}`}
                  </div>

                  <div className="hr-login-field">
                    <input
                      ref={codeInputRef}
                      type="text"
                      maxLength={6}
                      placeholder="A7K3P9"
                      value={linkCode}
                      onChange={ev => {
                        setLinkCode(
                          ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                        );
                        if (linkCodeState !== 'idle') setLinkCodeState('idle');
                      }}
                      className={`hr-login-code-input${codeErrorMsg ? ' hr-login-code-input--error' : ''}`}
                      disabled={isCodeExpired || linkCodeState === 'loading'}
                      aria-label="รหัสเชื่อมต่อ 6 หลัก"
                      aria-describedby={codeErrorMsg ? 'hr-code-err' : undefined}
                      aria-invalid={!!codeErrorMsg}
                    />
                    {codeErrorMsg && (
                      <span
                        id="hr-code-err"
                        className="hr-login-field__error"
                        role="alert"
                        style={{ justifyContent: 'center' }}
                      >
                        <IconAlertCircle className="hr-login-icon-xs" />
                        {codeErrorMsg}
                      </span>
                    )}
                  </div>

                  <div className="hr-login-empty__actions">
                    <button
                      type="submit"
                      className="hr-login-btn-primary"
                      disabled={
                        linkCode.length !== 6 ||
                        linkCodeState === 'loading' ||
                        isCodeExpired
                      }
                    >
                      {linkCodeState === 'loading'
                        ? <span className="hr-login-spinner" aria-hidden="true" />
                        : <IconLink className="hr-login-icon-sm" />}
                      {linkCodeState === 'loading' ? 'กำลังตรวจสอบ...' : 'เชื่อมต่อบัญชี'}
                    </button>
                    <button
                      type="button"
                      className="hr-login-btn-secondary"
                      onClick={() => setView('no-company')}
                    >
                      <IconArrowLeft className="hr-login-icon-sm" />
                      กลับ
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        )}

      </div>

      <div className="hr-login-footer">
        HumanSource HR System &middot; G-HUB Platform &copy; 2026
      </div>
    </div>
  );
}
