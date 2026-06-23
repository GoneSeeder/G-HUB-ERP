import { ApiRequestError, publicApiFetch } from './api';

export type HrAuthSource = 'hr' | 'ghub';
export type HrAccountStatus = 'active' | 'pending' | 'disabled';
export type HrMembershipStatus = 'active' | 'none' | 'pending';

export type HrSession = {
  authSource: HrAuthSource;
  email: string;
  displayName: string;
  accountStatus: HrAccountStatus;
  membershipStatus: HrMembershipStatus;
  hasGhubLink: boolean;
  createdAt: string;
};

export type HrLinkCodeResult = 'success' | 'expired' | 'used' | 'invalid';

type HrAuthSessionResponse = {
  session: HrSession;
};

type HrAuthErrorResponse = {
  code?: HrLinkCodeResult;
  message?: string;
};

export const HR_SESSION_STORAGE_KEY = 'g-hub.hr.session';
export const HR_SESSION_EVENT = 'g-hub.hr.session-changed';
export const HR_LINK_CODE_MOCK_SUCCESS = 'A7K3P9';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getHrSessionSnapshot(): HrSession | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(HR_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<HrSession>;
    if (!parsed.email || !parsed.displayName || !parsed.accountStatus || !parsed.membershipStatus) {
      return null;
    }

    return {
      authSource: parsed.authSource === 'ghub' ? 'ghub' : 'hr',
      email: parsed.email,
      displayName: parsed.displayName,
      accountStatus: parsed.accountStatus,
      membershipStatus: parsed.membershipStatus,
      hasGhubLink: Boolean(parsed.hasGhubLink),
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setHrSessionSnapshot(session: HrSession) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(HR_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(HR_SESSION_EVENT));
}

export function clearHrSessionSnapshot() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(HR_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(HR_SESSION_EVENT));
}

export function createHrSessionFromEmail(
  email: string,
  overrides: Partial<Omit<HrSession, 'email' | 'createdAt'>> = {},
): HrSession {
  const cleanEmail = email.trim().toLowerCase();
  const nameFromEmail = cleanEmail.split('@')[0] || 'HR User';

  return {
    authSource: overrides.authSource ?? 'hr',
    email: cleanEmail,
    displayName: overrides.displayName?.trim() || nameFromEmail,
    accountStatus: overrides.accountStatus ?? 'active',
    membershipStatus: overrides.membershipStatus ?? 'active',
    hasGhubLink: overrides.hasGhubLink ?? false,
    createdAt: new Date().toISOString(),
  };
}

export function getHrSessionDestination(session: HrSession) {
  if (session.accountStatus === 'pending') return '/humansource/pending';
  if (session.accountStatus === 'disabled') return '/humansource/login?state=disabled';
  if (session.membershipStatus !== 'active') return '/humansource/no-company';
  return '/humansource';
}

export function validateHrLinkCode(code: string): HrLinkCodeResult {
  const normalizedCode = code.trim().toUpperCase();
  if (normalizedCode === 'EXPIRE') return 'expired';
  if (normalizedCode === 'USEDXX') return 'used';
  if (normalizedCode === HR_LINK_CODE_MOCK_SUCCESS) return 'success';
  return 'invalid';
}

export function completeHrEmployeeLink() {
  const current = getHrSessionSnapshot();
  if (!current) return null;

  const next: HrSession = {
    ...current,
    accountStatus: 'active',
    membershipStatus: 'active',
  };
  setHrSessionSnapshot(next);
  return next;
}

function getFallbackLoginSession(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const prefix = cleanEmail.split('@')[0];

  if (prefix === 'test.pending') {
    return createHrSessionFromEmail(cleanEmail, {
      accountStatus: 'pending',
      membershipStatus: 'pending',
    });
  }

  if (prefix === 'test.disabled') {
    return createHrSessionFromEmail(cleanEmail, {
      accountStatus: 'disabled',
      membershipStatus: 'none',
    });
  }

  if (prefix === 'test.nocompany') {
    return createHrSessionFromEmail(cleanEmail, {
      membershipStatus: 'none',
    });
  }

  return createHrSessionFromEmail(cleanEmail);
}

function isHrAuthErrorResponse(error: unknown): error is HrAuthErrorResponse {
  return Boolean(error && typeof error === 'object' && ('code' in error || 'message' in error));
}

function canUseLocalHrAuthFallback(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.status === 404;
  }

  return error instanceof TypeError;
}

export async function registerHrAccount(input: {
  displayName: string;
  email: string;
  password: string;
}) {
  try {
    const response = await publicApiFetch<HrAuthSessionResponse>('/api/humansource/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setHrSessionSnapshot(response.session);
    return response.session;
  } catch (error) {
    if (!canUseLocalHrAuthFallback(error)) {
      throw error;
    }

    const fallbackSession = createHrSessionFromEmail(input.email, {
      displayName: input.displayName,
      membershipStatus: 'none',
    });
    setHrSessionSnapshot(fallbackSession);
    return fallbackSession;
  }
}

export async function loginHrAccount(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await publicApiFetch<HrAuthSessionResponse>('/api/humansource/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    setHrSessionSnapshot(response.session);
    return response.session;
  } catch (error) {
    if (!canUseLocalHrAuthFallback(error)) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }

    if (cleanEmail.split('@')[0] === 'test.invalid') {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }

    const fallbackSession = getFallbackLoginSession(cleanEmail);
    setHrSessionSnapshot(fallbackSession);
    return fallbackSession;
  }
}

export async function linkHrAccountWithCode(email: string, code: string) {
  try {
    const response = await publicApiFetch<HrAuthSessionResponse>('/api/humansource/auth/link-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    setHrSessionSnapshot(response.session);
    return { result: 'success' as const, session: response.session };
  } catch (error) {
    const errorCode = isHrAuthErrorResponse(error) ? error.code : undefined;

    if (errorCode && errorCode !== 'success') {
      return { result: errorCode };
    }

    if (!canUseLocalHrAuthFallback(error)) {
      return { result: 'invalid' as const };
    }

    const fallbackResult = validateHrLinkCode(code);
    if (fallbackResult !== 'success') {
      return { result: fallbackResult };
    }

    const current = getHrSessionSnapshot() ?? createHrSessionFromEmail(email, { membershipStatus: 'none' });
    const linkedSession: HrSession = {
      ...current,
      accountStatus: 'active',
      membershipStatus: 'active',
    };
    setHrSessionSnapshot(linkedSession);
    return { result: 'success' as const, session: linkedSession };
  }
}
