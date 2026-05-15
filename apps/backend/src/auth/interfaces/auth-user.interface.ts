export interface AuthUser {
  sub: string;
  username: string;
  name: string;
  roles: string[];
  apps: string[];
}
