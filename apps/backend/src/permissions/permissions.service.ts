import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRoleToUser(userId: string, roleCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) {
      throw new NotFoundException(`Role "${roleCode}" not found`);
    }

    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });

    return { message: 'Role assigned successfully' };
  }

  async setUserAppAccess(userId: string, appCode: string, canAccess: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    const app = await this.prisma.app.findUnique({ where: { code: appCode } });
    if (!app) {
      throw new NotFoundException(`App "${appCode}" not found`);
    }

    await this.prisma.userAppPermission.upsert({
      where: { userId_appId: { userId, appId: app.id } },
      update: { canAccess },
      create: { userId, appId: app.id, canAccess },
    });

    return { message: 'App access updated successfully' };
  }
}
