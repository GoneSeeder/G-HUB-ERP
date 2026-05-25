import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const MANAGED_APP_CODES = [
  'admin',
  'information',
  'information-member',
  'information-bonus-card',
  'information-booking',
  'information-name-list',
  'information-lecture-room',
  'information-report',
  'inventory',
  'inventory-stock',
  'sales',
  'sales-sales',
  'sales-crm',
  'sales-pos',
];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException('Username already used');
    }

    const passwordHash = await hash(createUserDto.password, 10);
    const createdUser = await this.prisma.user
      .create({
        data: {
          username: createUserDto.username,
          name: createUserDto.name,
          passwordHash,
        },
      })
      .catch((error) => this.handlePrismaError(error));

    await this.replaceUserRole(createdUser.id, createUserDto.roleCode);
    await this.replaceUserAppAccess(createdUser.id, createUserDto.appCodes ?? []);
    return this.findOne(createdUser.id);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.userAccessInclude(),
    });
    return users.map((user) => this.toUserListItem(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.userAccessInclude(),
    });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toUserListItem(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const passwordHash = updateUserDto.password
      ? await hash(updateUserDto.password, 10)
      : undefined;

    await this.prisma.user
      .update({
        where: { id },
        data: {
          username: updateUserDto.username,
          name: updateUserDto.name,
          ...(passwordHash ? { passwordHash } : {}),
        },
      })
      .catch((error) => this.handlePrismaError(error));

    if (updateUserDto.roleCode) {
      await this.replaceUserRole(id, updateUserDto.roleCode);
    }
    if (updateUserDto.appCodes) {
      await this.replaceUserAppAccess(id, updateUserDto.appCodes);
    }

    return this.findOne(id);
  }

  async remove(id: string, currentUserId?: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own user');
    }

    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  findByUsernameForAuth(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        isActive: true,
      },
    });
  }

  async findAuthContextById(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: this.userAccessInclude(),
    });

    if (!user) {
      return null;
    }

    const { roleCodes, appCodes } = this.getEffectiveAccess(user);

    return {
      sub: user.id,
      username: user.username,
      name: user.name,
      roles: roleCodes,
      apps: appCodes,
    };
  }

  private userAccessInclude() {
    return {
      roles: {
        include: {
          role: {
            select: {
              code: true,
              name: true,
              permissions: {
                where: { canAccess: true },
                include: {
                  app: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      apps: {
        where: { canAccess: true },
        include: {
          app: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
    } satisfies Prisma.UserInclude;
  }

  private getEffectiveAccess(
    user: Prisma.UserGetPayload<{
      include: ReturnType<UsersService['userAccessInclude']>;
    }>,
  ) {
    const roleCodes = user.roles.map((item) => item.role.code);
    const roleApps = user.roles.flatMap((item) =>
      item.role.permissions.map((permission) => permission.app),
    );
    const directApps = user.apps.map((item) => item.app);
    const appMap = new Map(
      [...roleApps, ...directApps].map((app) => [app.code, app]),
    );

    return {
      roleCodes: Array.from(new Set(roleCodes)),
      appCodes: Array.from(appMap.keys()),
      appNames: Array.from(appMap.values()).map((app) => app.name),
    };
  }

  private toUserListItem(
    user: Prisma.UserGetPayload<{
      include: ReturnType<UsersService['userAccessInclude']>;
    }>,
  ) {
    const { roleCodes, appCodes, appNames } = this.getEffectiveAccess(user);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      password: '******',
      roleCode: roleCodes[0] ?? 'user',
      appCodes,
      appNames,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async replaceUserRole(userId: string, roleCode: string) {
    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) {
      throw new NotFoundException(`Role "${roleCode}" not found`);
    }

    await this.prisma.userRole.deleteMany({ where: { userId } });
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });
  }

  private async replaceUserAppAccess(userId: string, appCodes: string[]) {
    const selectedCodes = new Set(appCodes);
    const apps = await this.prisma.app.findMany({
      where: {
        code: {
          in: MANAGED_APP_CODES,
        },
      },
    });

    await Promise.all(
      apps.map((app) =>
        this.prisma.userAppPermission.upsert({
          where: {
            userId_appId: {
              userId,
              appId: app.id,
            },
          },
          update: { canAccess: selectedCodes.has(app.code) },
          create: {
            userId,
            appId: app.id,
            canAccess: selectedCodes.has(app.code),
          },
        }),
      ),
    );
  }

  // Map known Prisma errors to HTTP-level errors.
  handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Username already used');
    }
    throw error;
  }
}
