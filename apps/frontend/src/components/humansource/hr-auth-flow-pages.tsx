'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, LinkIcon, XIcon } from '@/components/ui/icons';
import {
  clearHrSessionSnapshot,
  getHrSessionSnapshot,
  linkHrAccountWithCode,
  registerHrAccount,
  type HrSession,
} from '@/lib/hr-auth';

type LinkCodeState = 'idle' | 'loading' | 'expired' | 'invalid' | 'used' | 'success';


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

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function fmt(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function HrAuthSurface({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="hr-login-root">
      <div className="hr-login-decor" aria-hidden="true">
        <svg viewBox="0 0 120 138" fill="none" xmlns="http://www.w3.org/2000/svg" className="hr-login-decor__hex">
          <path d="M60 4L114 34V88L60 118L6 88V34L60 4Z" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" fill="rgba(20,13,56,0.30)" />
          <path d="M60 18L100 42V82L60 106L20 82V42L60 18Z" stroke="rgba(167,139,250,0.20)" strokeWidth="1" fill="none" />
          <text x="60" y="63" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="800" fill="rgba(167,139,250,0.65)" fontFamily="inherit">HR</text>
        </svg>
      </div>
      <div className="hr-login-card">
        <div className="hr-login-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hr-logo.png" alt="HumanSource HR" className="hr-login-logo" />
        </div>
        <div className="hr-login-brand">
          <h1 className="hr-login-brand-title">{title}</h1>
          {subtitle ? <p className="hr-login-brand-sub">{subtitle}</p> : null}
        </div>
        <div className="hr-login-brand-sep" aria-hidden="true" />
        {children}
      </div>
      <div className="hr-login-footer">
        HumanSource HR System &middot; G-HUB Platform &copy; 2026
      </div>
    </div>
  );
}

export function HrSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('รูปแบบ Email ไม่ถูกต้อง');
      return;
    }
    if (cleanPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (cleanPassword !== cleanConfirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setError('');
    setLoading(true);
    await registerHrAccount({
      displayName: cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPassword,
    });
    router.push('/humansource/no-company');
  };

  return (
    <HrAuthSurface title="สมัครใช้งาน HumanSource HR" subtitle="สร้างบัญชีด้วย Email แล้วผูกกับข้อมูลพนักงานในขั้นตอนถัดไป">
      <form onSubmit={onSubmit} noValidate>
        <div className="hr-login-field">
          <label className="hr-login-field__label" htmlFor="hr-signup-email">อีเมล</label>
          <input
            id="hr-signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="hr-login-field__control"
            placeholder="name@company.com"
            autoComplete="email"
          />
        </div>
        <div className="hr-login-field">
          <label className="hr-login-field__label" htmlFor="hr-signup-password">รหัสผ่าน</label>
          <input
            id="hr-signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="hr-login-field__control"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            autoComplete="new-password"
          />
        </div>
        <div className="hr-login-field">
          <label className="hr-login-field__label" htmlFor="hr-signup-confirm">ยืนยันรหัสผ่าน</label>
          <input
            id="hr-signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="hr-login-field__control"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            autoComplete="new-password"
          />
        </div>
        {error ? (
          <div className="hr-login-form-error" role="alert">
            <IconAlert className="hr-login-icon-sm hr-login-form-error__icon" />
            <span>{error}</span>
          </div>
        ) : null}
        <button type="submit" className="hr-login-btn-primary" disabled={loading}>
          {loading ? <span className="hr-login-spinner" aria-hidden="true" /> : <CheckIcon className="hr-login-icon-sm" />}
          {loading ? 'กำลังสมัคร...' : 'สมัครใช้งาน HR'}
        </button>
        <div className="hr-login-links">
          <button type="button" className="hr-login-link" onClick={() => router.push('/humansource/login')}>
            กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
      </form>
    </HrAuthSurface>
  );
}

export function HrNoCompanyPage() {
  const router = useRouter();
  const [session, setSession] = useState<HrSession | null>(null);
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<LinkCodeState>('idle');
  const [seconds, setSeconds] = useState(599);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = getHrSessionSnapshot();
    if (!current) {
      router.replace('/humansource/login');
      return;
    }
    if (current.membershipStatus === 'active') {
      router.replace('/humansource');
      return;
    }
    setSession(current);
    window.setTimeout(() => codeInputRef.current?.focus(), 80);
  }, [router]);

  useEffect(() => {
    if (seconds <= 0 || codeState === 'success') return;
    const timerId = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [codeState, seconds]);

  const codeError =
    codeState === 'expired'
      ? 'รหัสนี้หมดอายุแล้ว กรุณาขอรหัสใหม่จาก HR'
      : codeState === 'used'
        ? 'รหัสนี้ถูกใช้ไปแล้ว กรุณาขอรหัสใหม่จาก HR'
        : codeState === 'invalid'
          ? 'รหัสเชื่อมต่อไม่ถูกต้อง'
          : '';

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (code.length !== 6 || codeState === 'loading') return;

    setCodeState('loading');
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const result = seconds === 0
      ? 'expired'
      : (await linkHrAccountWithCode(session?.email ?? '', code)).result;

    if (result === 'success') {
      setCodeState('success');
      window.setTimeout(() => router.push('/humansource'), 900);
      return;
    }

    setCodeState(result);
  };

  const logout = () => {
    clearHrSessionSnapshot();
    router.push('/humansource/login');
  };

  return (
    <HrAuthSurface title="ไม่มีข้อมูลบริษัท" subtitle={session ? session.email : 'กำลังตรวจสอบบัญชี HR'}>
      <form onSubmit={onSubmit} noValidate>
        <div className="hr-login-empty">
          <div className={`hr-login-empty__icon-box${codeState === 'success' ? ' hr-login-empty__icon-box--success' : ''}`}>
            {codeState === 'success' ? <CheckIcon className="hr-login-icon-lg" /> : <IconHash className="hr-login-icon-lg" />}
          </div>
          <h2 className="hr-login-empty__title">
            {codeState === 'success' ? 'เชื่อมต่อสำเร็จ' : 'บัญชีนี้ยังไม่ได้เชื่อมกับข้อมูลพนักงาน'}
          </h2>
          <p className="hr-login-empty__desc">
            {codeState === 'success'
              ? 'กำลังเข้าสู่ HumanSource HR'
              : 'กรอกรหัส 6 หลักที่ HR สร้างจากข้อมูลพนักงานของคุณ'}
          </p>

          {codeState !== 'success' ? (
            <>
              <div className={`hr-login-code-timer${seconds === 0 ? ' hr-login-code-timer--expired' : seconds < 60 ? ' hr-login-code-timer--urgent' : ''}`}>
                <IconClock className="hr-login-icon-xs" />
                {seconds === 0 ? 'หมดอายุแล้ว' : `หมดอายุใน ${fmt(seconds)}`}
              </div>
              <div className="hr-login-field">
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                    if (codeState !== 'idle') setCodeState('idle');
                  }}
                  className={`hr-login-code-input${codeError ? ' hr-login-code-input--error' : ''}`}
                  placeholder="A7K3P9"
                  maxLength={6}
                  aria-label="รหัสเชื่อมต่อ 6 หลัก"
                  disabled={seconds === 0 || codeState === 'loading'}
                />
                {codeError ? (
                  <span className="hr-login-field__error" role="alert" style={{ justifyContent: 'center' }}>
                    <IconAlert className="hr-login-icon-xs" />
                    {codeError}
                  </span>
                ) : null}
              </div>
              <div className="hr-login-empty__actions">
                <button type="submit" className="hr-login-btn-primary" disabled={code.length !== 6 || seconds === 0 || codeState === 'loading'}>
                  {codeState === 'loading' ? <span className="hr-login-spinner" aria-hidden="true" /> : <LinkIcon className="hr-login-icon-sm" />}
                  {codeState === 'loading' ? 'กำลังตรวจสอบ...' : 'เชื่อมต่อบัญชี'}
                </button>
                <button type="button" className="hr-login-btn-secondary" onClick={logout}>
                  <XIcon className="hr-login-icon-sm" />
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : null}
        </div>
      </form>
    </HrAuthSurface>
  );
}

export function HrPendingPage() {
  const router = useRouter();
  const [session, setSession] = useState<HrSession | null>(null);

  useEffect(() => {
    setSession(getHrSessionSnapshot());
  }, []);

  const logout = () => {
    clearHrSessionSnapshot();
    router.push('/humansource/login');
  };

  return (
    <HrAuthSurface title="รอการอนุมัติ" subtitle={session?.email}>
      <div className="hr-login-empty">
        <div className="hr-login-empty__icon-box hr-login-empty__icon-box--amber">
          <IconClock className="hr-login-icon-lg" />
        </div>
        <h2 className="hr-login-empty__title">บัญชี HR ยังไม่พร้อมใช้งาน</h2>
        <p className="hr-login-empty__desc">
          HR ต้องอนุมัติสิทธิ์หรือผูกข้อมูลพนักงานก่อน จึงจะเข้า HumanSource ได้
        </p>
        <div className="hr-login-empty__actions">
          <button type="button" className="hr-login-btn-secondary" onClick={() => router.push('/humansource/login')}>
            <ArrowLeftIcon className="hr-login-icon-sm" />
            กลับหน้าเข้าสู่ระบบ
          </button>
          <button type="button" className="hr-login-btn-secondary" onClick={logout}>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </HrAuthSurface>
  );
}

export function HrInvitePage() {
  const router = useRouter();

  return (
    <HrAuthSurface title="คำเชิญ HumanSource HR" subtitle="ใช้ลิงก์หรือรหัสที่ได้รับจาก HR">
      <div className="hr-login-empty">
        <div className="hr-login-empty__icon-box">
          <LinkIcon className="hr-login-icon-lg" />
        </div>
        <h2 className="hr-login-empty__title">ยังไม่มี invite token ใน URL</h2>
        <p className="hr-login-empty__desc">
          หาก HR ให้รหัส 6 หลัก ให้สมัครหรือเข้าสู่ระบบก่อน แล้วกรอกรหัสเชื่อมต่อ
        </p>
        <div className="hr-login-empty__actions">
          <button type="button" className="hr-login-btn-primary" onClick={() => router.push('/humansource/signup')}>
            สมัครใช้งาน HR
          </button>
          <button type="button" className="hr-login-btn-secondary" onClick={() => router.push('/humansource/login')}>
            กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </HrAuthSurface>
  );
}

export function HrLinkGhubPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<LinkCodeState>('idle');
  const [seconds, setSeconds] = useState(599);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Mock: in production this comes from the active G-HUB session
  const ghubEmail = 'admin@ghub.com';

  useEffect(() => {
    window.setTimeout(() => codeInputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (seconds <= 0 || codeState === 'success') return;
    const timerId = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [codeState, seconds]);

  const codeError =
    codeState === 'expired'
      ? 'รหัสนี้หมดอายุแล้ว กรุณาขอรหัสใหม่จาก HR'
      : codeState === 'used'
        ? 'รหัสนี้ถูกใช้ไปแล้ว กรุณาขอรหัสใหม่จาก HR'
        : codeState === 'invalid'
          ? 'รหัสเชื่อมต่อไม่ถูกต้อง'
          : '';

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (code.length !== 6 || codeState === 'loading') return;
    setCodeState('loading');
    await new Promise((r) => window.setTimeout(r, 600));
    const result = seconds === 0
      ? 'expired'
      : (await linkHrAccountWithCode(ghubEmail, code)).result;
    if (result === 'success') {
      setCodeState('success');
      window.setTimeout(() => router.push('/humansource'), 900);
      return;
    }
    setCodeState(result);
  };

  return (
    <HrAuthSurface title="เชื่อมต่อ G-HUB กับ HR" subtitle={ghubEmail}>
      <form onSubmit={onSubmit} noValidate>
        <div className="hr-login-empty">
          <div className={`hr-login-empty__icon-box${codeState === 'success' ? ' hr-login-empty__icon-box--success' : ''}`}>
            {codeState === 'success'
              ? <CheckIcon className="hr-login-icon-lg" />
              : <LinkIcon className="hr-login-icon-lg" />}
          </div>
          <h2 className="hr-login-empty__title">
            {codeState === 'success' ? 'เชื่อมต่อสำเร็จ' : 'บัญชี G-HUB ยังไม่ได้เชื่อมกับข้อมูลพนักงาน'}
          </h2>
          <p className="hr-login-empty__desc">
            {codeState === 'success'
              ? 'กำลังเข้าสู่ HumanSource HR'
              : 'กรอกรหัส 6 หลักที่ HR สร้างจากข้อมูลพนักงานของคุณ เพื่อเชื่อมบัญชี G-HUB กับ HR'}
          </p>

          {codeState !== 'success' && (
            <>
              <div className={`hr-login-code-timer${seconds === 0 ? ' hr-login-code-timer--expired' : seconds < 60 ? ' hr-login-code-timer--urgent' : ''}`}>
                <IconClock className="hr-login-icon-xs" />
                {seconds === 0 ? 'หมดอายุแล้ว' : `หมดอายุใน ${fmt(seconds)}`}
              </div>
              <div className="hr-login-field">
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                    if (codeState !== 'idle') setCodeState('idle');
                  }}
                  className={`hr-login-code-input${codeError ? ' hr-login-code-input--error' : ''}`}
                  placeholder="A7K3P9"
                  maxLength={6}
                  aria-label="รหัสเชื่อมต่อ 6 หลัก"
                  disabled={seconds === 0 || codeState === 'loading'}
                />
                {codeError && (
                  <span className="hr-login-field__error" role="alert" style={{ justifyContent: 'center' }}>
                    <IconAlert className="hr-login-icon-xs" />
                    {codeError}
                  </span>
                )}
              </div>
              <div className="hr-login-empty__actions">
                <button
                  type="submit"
                  className="hr-login-btn-primary"
                  disabled={code.length !== 6 || seconds === 0 || codeState === 'loading'}
                >
                  {codeState === 'loading'
                    ? <span className="hr-login-spinner" aria-hidden="true" />
                    : <LinkIcon className="hr-login-icon-sm" />}
                  {codeState === 'loading' ? 'กำลังตรวจสอบ...' : 'เชื่อมต่อบัญชี'}
                </button>
                <button type="button" className="hr-login-btn-secondary" onClick={() => router.push('/hub')}>
                  <ArrowLeftIcon className="hr-login-icon-sm" />
                  กลับ G-HUB
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </HrAuthSurface>
  );
}

export function HrEmployeeLinkOverlay({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [state, setState] = useState<LinkCodeState>('idle');
  const [seconds, setSeconds] = useState(599);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    window.setTimeout(() => refs.current[0]?.focus(), 80);
  }, []);

  useEffect(() => {
    if (state === 'success') return;
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [state]); // functional updater — no need for `seconds` in deps

  const code = digits.join('');

  const handleChange = (i: number, raw: string) => {
    const ch = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (state !== 'idle') setState('idle');
    if (ch && i < 5) window.setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const next: string[] = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    window.setTimeout(() => refs.current[Math.min(text.length, 5)]?.focus(), 0);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || state === 'loading') return;
    setState('loading');
    await new Promise((r) => window.setTimeout(r, 600));
    const result = seconds === 0 ? 'expired' : (await linkHrAccountWithCode('', code)).result;
    if (result === 'success') {
      setState('success');
      window.setTimeout(onSuccess, 800);
      return;
    }
    setState(result);
  };

  const errorMsg =
    state === 'expired' ? 'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่จาก HR'
    : state === 'used' ? 'รหัสนี้ถูกใช้ไปแล้ว กรุณาขอรหัสใหม่จาก HR'
    : state === 'invalid' ? 'รหัสเชื่อมต่อไม่ถูกต้อง'
    : '';

  const isExpired = seconds === 0;
  const isDisabled = isExpired || state === 'loading' || state === 'success';

  return (
    <div className="hr-emp-link-overlay" role="dialog" aria-modal="true" aria-label="ผูกบัญชีพนักงาน">
      <div className="hr-emp-link-modal">
        <div className="hr-emp-link-modal__icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="hr-emp-link-shield"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <rect x="10.5" y="10" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="9" r="1.25" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {state === 'success' ? (
          <>
            <h1 className="hr-emp-link-modal__title">เชื่อมต่อสำเร็จ!</h1>
            <p className="hr-emp-link-modal__desc">กำลังเข้าสู่ระบบ HumanSource HR</p>
          </>
        ) : (
          <>
            <h1 className="hr-emp-link-modal__title">ยืนยันรหัสเพื่อผูกบัญชีพนักงาน</h1>
            <p className="hr-emp-link-modal__desc">
              กรุณากรอกรหัสผูกบัญชีพนักงาน 6 หลัก<br />
              เพื่อเชื่อมโยงบัญชีของคุณกับข้อมูลพนักงาน
            </p>

            <form onSubmit={onSubmit} noValidate className="hr-emp-link-modal__form">
              <label className="hr-emp-link-modal__label">รหัสผูกบัญชีพนักงาน 6 หลัก</label>
              <div className="hr-emp-link-otp-row" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={2}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKey(i, e)}
                    className={`hr-emp-link-otp-box${errorMsg ? ' hr-emp-link-otp-box--error' : ''}`}
                    disabled={isDisabled}
                    aria-label={`หลักที่ ${i + 1}`}
                    placeholder="–"
                  />
                ))}
              </div>

              {errorMsg ? (
                <div className="hr-emp-link-modal__error" role="alert">
                  <IconAlert className="hr-emp-link-icon-xs" />
                  {errorMsg}
                </div>
              ) : null}

              <div className="hr-emp-link-modal__hint">
                <IconClock className="hr-emp-link-icon-xs" />
                {isExpired
                  ? 'รหัสหมดอายุแล้ว'
                  : `ใช้ได้ครั้งเดียว • หมดอายุใน ${fmt(seconds)}`}
              </div>

              <button
                type="submit"
                className="hr-emp-link-modal__submit"
                disabled={code.length !== 6 || isExpired || state === 'loading'}
              >
                {state === 'loading' ? <span className="hr-login-spinner" aria-hidden="true" /> : null}
                {state === 'loading' ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
              </button>
            </form>

            <p className="hr-emp-link-modal__footer">
              ยังไม่มีรหัสผูกบัญชีพนักงาน?{' '}
              <span className="hr-emp-link-modal__footer-link">ติดต่อฝ่าย HR</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
