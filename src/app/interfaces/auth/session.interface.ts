import { User } from '@interfaces/identity/user.interface';

/** GET /roles/me/access (RoleService::effectiveAccess). */
export interface EffectiveAccess {
  roles: string[];
  permissions: string[];
}

/** POST /auth/login, POST /auth/two-factor/challenge (with token) and GET /auth/me (without). */
export interface Session extends EffectiveAccess {
  user: User;
  token?: string;
  tokenType?: 'Bearer';
  expiresAt?: string;
  /** Only after a 2FA code with rememberDevice. */
  trustedDeviceToken?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  roles: string[];
  permissions: string[];
  accessLoaded: boolean;
}
