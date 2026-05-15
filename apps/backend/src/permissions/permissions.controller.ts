import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SetUserAppAccessDto } from './dto/set-user-app-access.dto';
import { PermissionsService } from './permissions.service';

@Controller('api/permissions')
@UseGuards(JwtAuthGuard, RolesGuard, AppAccessGuard)
@Roles('admin')
@RequireAppAccess('admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('users/:userId/roles/:roleCode')
  assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleCode') roleCode: string,
  ) {
    return this.permissionsService.assignRoleToUser(userId, roleCode);
  }

  @Patch('users/:userId/apps/:appCode')
  setUserAppAccess(
    @Param('userId') userId: string,
    @Param('appCode') appCode: string,
    @Body() body: SetUserAppAccessDto,
  ) {
    return this.permissionsService.setUserAppAccess(
      userId,
      appCode,
      body.canAccess,
    );
  }
}
