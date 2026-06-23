import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

type HrAccountStatus = 'active' | 'pending' | 'disabled';
type HrMembershipStatus = 'active' | 'none' | 'pending';

type HrSession = {
  authSource: 'hr' | 'ghub';
  email: string;
  displayName: string;
  accountStatus: HrAccountStatus;
  membershipStatus: HrMembershipStatus;
  hasGhubLink: boolean;
  createdAt: string;
};

type HrAccountRecord = HrSession & {
  password: string;
};

const SUCCESS_LINK_CODE = 'A7K3P9';

@Injectable()
export class HumansourceAuthService {
  private readonly accounts = new Map<string, HrAccountRecord>();

  register(displayName: string, email: string, password: string) {
    const cleanEmail = this.cleanEmail(email);
    const session = this.createSession(cleanEmail, {
      displayName,
      membershipStatus: 'none',
    });

    this.accounts.set(cleanEmail, {
      ...session,
      password,
    });

    return { session };
  }

  login(email: string, password: string) {
    const cleanEmail = this.cleanEmail(email);
    const prefix = cleanEmail.split('@')[0];
    const stored = this.accounts.get(cleanEmail);

    if (prefix === 'test.invalid') {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    if (stored && stored.password !== password) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    if (stored) {
      return { session: this.toSession(stored) };
    }

    if (prefix === 'test.pending') {
      return {
        session: this.createSession(cleanEmail, {
          accountStatus: 'pending',
          membershipStatus: 'pending',
        }),
      };
    }

    if (prefix === 'test.disabled') {
      return {
        session: this.createSession(cleanEmail, {
          accountStatus: 'disabled',
          membershipStatus: 'none',
        }),
      };
    }

    if (prefix === 'test.nocompany') {
      return {
        session: this.createSession(cleanEmail, {
          membershipStatus: 'none',
        }),
      };
    }

    return {
      session: this.createSession(cleanEmail),
    };
  }

  linkCode(email: string, code: string) {
    const cleanEmail = this.cleanEmail(email);
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode === 'EXPIRE') {
      throw new BadRequestException({ code: 'expired', message: 'รหัสนี้หมดอายุแล้ว' });
    }

    if (normalizedCode === 'USEDXX') {
      throw new BadRequestException({ code: 'used', message: 'รหัสนี้ถูกใช้ไปแล้ว' });
    }

    if (normalizedCode !== SUCCESS_LINK_CODE) {
      throw new BadRequestException({ code: 'invalid', message: 'รหัสเชื่อมต่อไม่ถูกต้อง' });
    }

    const current = this.accounts.get(cleanEmail);
    const session = {
      ...(current ? this.toSession(current) : this.createSession(cleanEmail)),
      accountStatus: 'active' as const,
      membershipStatus: 'active' as const,
    };

    this.accounts.set(cleanEmail, {
      ...session,
      password: current?.password ?? '',
    });

    return { session };
  }

  private cleanEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private createSession(
    email: string,
    overrides: Partial<Omit<HrSession, 'authSource' | 'email' | 'createdAt'>> = {},
  ): HrSession {
    const nameFromEmail = email.split('@')[0] || 'HR User';

    return {
      authSource: 'hr',
      email,
      displayName: overrides.displayName?.trim() || nameFromEmail,
      accountStatus: overrides.accountStatus ?? 'active',
      membershipStatus: overrides.membershipStatus ?? 'active',
      hasGhubLink: overrides.hasGhubLink ?? false,
      createdAt: new Date().toISOString(),
    };
  }

  private toSession(account: HrAccountRecord): HrSession {
    return {
      authSource: account.authSource,
      email: account.email,
      displayName: account.displayName,
      accountStatus: account.accountStatus,
      membershipStatus: account.membershipStatus,
      hasGhubLink: account.hasGhubLink,
      createdAt: account.createdAt,
    };
  }
}
