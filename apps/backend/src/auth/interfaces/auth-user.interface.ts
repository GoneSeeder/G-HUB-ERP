export interface AuthUser {
  sub: string;
  username: string;
  name: string;
  email: string | null;
  roles: string[];
  apps: string[];
}
