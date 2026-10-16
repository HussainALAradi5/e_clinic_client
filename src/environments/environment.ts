import { DemoLogins } from '@shared/interfaces/auth/demo-account.interface';

/** Production: the API is served from the same origin (reverse proxy) — override at deploy time if not. */
export const environment = {
  production: true,
  /** Demo accounts are never offered in production builds. */
  demoLogins: null as DemoLogins | null,
  apiUrl: '',
};
