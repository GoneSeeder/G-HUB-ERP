import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppsService } from './apps.service';

@Controller('api/apps')
@UseGuards(JwtAuthGuard, AppAccessGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  @RequireAppAccess('hub')
  findAll() {
    return this.appsService.findAll();
  }

  @Get('my')
  @RequireAppAccess('hub')
  findMyApps(@CurrentUser() user: AuthUser) {
    return user.apps;
  }
}
