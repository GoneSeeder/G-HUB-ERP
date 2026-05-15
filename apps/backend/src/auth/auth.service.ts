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
    if (!authRecord || !authRecord.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await compare(password, authRecord.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser = await this.usersService.findAuthContextById(authRecord.id);
    if (!authUser) {
      throw new UnauthorizedException('Invalid credentials');
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
      throw new UnauthorizedException('User not found');
    }
    return authUser;
  }
}
