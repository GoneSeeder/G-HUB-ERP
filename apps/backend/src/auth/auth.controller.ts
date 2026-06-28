import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { HrGoogleAuthGuard } from './guards/hr-google-auth.guard';
import { AuthUser } from './interfaces/auth-user.interface';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.sub);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport redirects to Google — no body needed
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser;
    const token = await this.authService.signTokenForUser(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google-callback?token=${token}`);
  }

  @Get('google-hr')
  @UseGuards(HrGoogleAuthGuard)
  googleHrLogin() {
    // Passport redirects to Google
  }

  @Get('google-hr/callback')
  @UseGuards(HrGoogleAuthGuard)
  async googleHrCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser;
    const token = await this.authService.signTokenForUser(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/humansource/auth/google-callback?token=${token}`);
  }
}
