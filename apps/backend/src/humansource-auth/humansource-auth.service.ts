import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

type HrSession = {
  authSource: string;
  email: string;
  displayName: string;
  accountStatus: string;
  membershipStatus: string;
  hasGhubLink: boolean;
  createdAt: string;
};

function toSession(account: {
  email: string; displayName: string; authSource: string;
  accountStatus: string; membershipStatus: string;
  hasGhubLink: boolean;
}): HrSession {
  return {
    authSource: account.authSource,
    email: account.email,
    displayName: account.displayName,
    accountStatus: account.accountStatus,
    membershipStatus: account.membershipStatus,
    hasGhubLink: account.hasGhubLink,
    createdAt: new Date().toISOString(),
  };
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

@Injectable()
export class HumansourceAuthService {
  constructor(private prisma: PrismaService) {}

  // ── Register ─────────────────────────────────────────────────────────────────
  async register(displayName: string, email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await this.prisma.hrAccount.findUnique({ where: { email: cleanEmail } });
    if (existing) throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');

    const passwordHash = await hash(password, 10);
    const account = await this.prisma.hrAccount.create({
      data: {
        email: cleanEmail,
        displayName: displayName.trim(),
        passwordHash,
        authSource: 'hr',
        accountStatus: 'pending',
        membershipStatus: 'none',
      },
    });

    return { session: toSession(account) };
  }

  // ── Login ─────────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const account = await this.prisma.hrAccount.findUnique({ where: { email: cleanEmail } });
    if (!account) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    const valid = await compare(password, account.passwordHash);
    if (!valid) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    if (account.accountStatus === 'disabled') {
      throw new UnauthorizedException('บัญชีนี้ถูกระงับการใช้งาน');
    }

    return { session: toSession(account) };
  }

  // ── Generate link code ────────────────────────────────────────────────────────
  async generateLinkCode(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const account = await this.prisma.hrAccount.findUnique({ where: { email: cleanEmail } });
    if (!account) throw new BadRequestException('ไม่พบบัญชี');

    await this.prisma.hrLinkCode.updateMany({
      where: { accountId: account.id, used: false },
      data: { used: true },
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.hrLinkCode.create({ data: { code, accountId: account.id, expiresAt } });
    return { code, expiresAt };
  }

  // ── Login with G-HUB account ─────────────────────────────────────────────────
  async loginWithGhub(userId: string, name: string, email: string) {
    let account = await this.prisma.hrAccount.findFirst({
      where: { OR: [{ userId }, { email }] },
    });

    if (!account) {
      account = await this.prisma.hrAccount.create({
        data: {
          email,
          displayName: name,
          passwordHash: await hash(userId + process.env.JWT_SECRET, 10),
          authSource: 'ghub',
          accountStatus: 'active',
          membershipStatus: 'none',
          hasGhubLink: true,
          userId,
        },
      });
    } else if (!account.userId) {
      account = await this.prisma.hrAccount.update({
        where: { id: account.id },
        data: { userId, hasGhubLink: true, authSource: 'ghub' },
      });
    }

    if (account.accountStatus === 'disabled') {
      throw new UnauthorizedException('บัญชีนี้ถูกระงับการใช้งาน');
    }

    return { session: toSession(account) };
  }

  // ── Redeem link code ──────────────────────────────────────────────────────────
  async linkCode(email: string, code: string) {
    const cleanEmail = email.trim().toLowerCase();
    const normalCode = code.trim().toUpperCase();

    const linkCode = await this.prisma.hrLinkCode.findUnique({
      where: { code: normalCode },
      include: { account: true },
    });

    if (!linkCode) return { result: 'invalid' };
    if (linkCode.used) return { result: 'used' };
    if (linkCode.expiresAt < new Date()) return { result: 'expired' };
    if (linkCode.account.email !== cleanEmail) return { result: 'invalid' };

    await this.prisma.hrLinkCode.update({ where: { code: normalCode }, data: { used: true } });
    const updated = await this.prisma.hrAccount.update({
      where: { id: linkCode.accountId },
      data: { accountStatus: 'active', membershipStatus: 'active' },
    });

    return { result: 'success', session: toSession(updated) };
  }
}
