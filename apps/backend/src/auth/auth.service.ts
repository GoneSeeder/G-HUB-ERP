import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthUser } from './interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const authRecord = await this.usersService.findByUsernameForAuth(username);

    if (!authRecord) {
      throw new UnauthorizedException('ไม่พบบัญชีผู้ใช้นี้');
    }

    if (!authRecord.isActive) {
      throw new UnauthorizedException('บัญชีนี้ถูกปิดการใช้งาน');
    }

    const passwordMatches = await compare(password, authRecord.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
    }

    const authUser = await this.usersService.findAuthContextById(authRecord.id);

    if (!authUser) {
      throw new UnauthorizedException('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: authUser.sub,
      }),
      user: authUser,
    };
  }

  async me(userId: string): Promise<AuthUser> {
    const authUser = await this.usersService.findAuthContextById(userId);

    if (!authUser) {
      throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้งาน');
    }

    return authUser;
  }

  async signTokenForUser(user: AuthUser): Promise<string> {
    return this.jwtService.signAsync({ sub: user.sub });
  }
}
