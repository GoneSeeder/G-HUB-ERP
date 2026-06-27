import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HrLinkCodeDto, HrLoginDto, HrRegisterDto } from './dto/hr-auth.dto';
import { HumansourceAuthService } from './humansource-auth.service';

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
}
