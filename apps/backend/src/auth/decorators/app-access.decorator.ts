import { SetMetadata } from '@nestjs/common';

export const APP_ACCESS_KEY = 'app_access';
export const RequireAppAccess = (...apps: string[]) =>
  SetMetadata(APP_ACCESS_KEY, apps);
