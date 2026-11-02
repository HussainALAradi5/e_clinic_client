import { EffectiveAccess } from '@interfaces/auth/effective-access.interface';
import { User } from '@interfaces/identity/user.interface';

/** POST /auth/login, POST /auth/two-factor/challenge (with token) and GET /auth/me (without). */
export interface Session extends EffectiveAccess {
  user: User;
  token?: string;
  tokenType?: 'Bearer';
  expiresAt?: string;
  /** Only after a 2FA code with rememberDevice. */
  trustedDeviceToken?: string;
}
