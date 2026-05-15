import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_ACCESS_KEY } from '../decorators/app-access.decorator';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class AppAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredApps = this.reflector.getAllAndOverride<string[]>(
      APP_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredApps || requiredApps.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const userApps = request.user?.apps ?? [];
    const canAccess = requiredApps.every((app) => userApps.includes(app));
    if (!canAccess) {
      throw new ForbiddenException('Missing required app access');
    }
    return true;
  }
}
