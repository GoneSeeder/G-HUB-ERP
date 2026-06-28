import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { HrLinkCodeDto, HrLoginDto, HrRegisterDto } from './dto/hr-auth.dto';
import { HumansourceAuthService } from './humansource-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Controller('api/humansource/auth')
export class HumansourceAuthController {
  constructor(private readonly humansourceAuthService: HumansourceAuthService) {}

  @Post('register')
  register(@Body() body: HrRegisterDto) {
    return this.humansourceAuthService.register(body.displayName, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: HrLoginDto) {
    return this.humansourceAuthService.login(body.email, body.password);
  }

  @Post('link-code')
  linkCode(@Body() body: HrLinkCodeDto) {
    return this.humansourceAuthService.linkCode(body.email, body.code);
  }

  @Get('generate-link-code')
  generateCode(@Query('email') email: string) {
    return this.humansourceAuthService.generateLinkCode(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('login-with-ghub')
  loginWithGhub(@CurrentUser() user: AuthUser) {
    const email = user.email ?? `${user.username}@ghub.internal`;
    return this.humansourceAuthService.loginWithGhub(user.sub, user.name, email);
  }
}
