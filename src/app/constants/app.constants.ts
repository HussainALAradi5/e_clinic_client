/** App-wide constants (request headers, routes, storage, clinic locale). API location: `config/api.config.ts`. */

export const REQUEST_ID_HEADER = 'X-Request-Id';
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** Staff workspace start page (the public website lives at `/`). */
export const HOME_PATH = '/dashboard';
/** Patient portal start page; patients never enter the staff workspace. */
export const PORTAL_PATH = '/portal';
/** Portal sessions end after this many minutes without activity (shared devices, PHI). */
export const PORTAL_IDLE_MINUTES = 10;
export const LOGIN_PATH = '/login';
export const TWO_FACTOR_PATH = '/login/2fa';
export const FORBIDDEN_PATH = '/forbidden';
export const ACCOUNT_SECURITY_PATH = '/account/security';

/** `device_name` sent on sign-in (shown in the token list / audit). */
export const DEVICE_NAME = 'angular-web';

/** Permission expression atom that is true for any signed-in user. */
export const AUTHENTICATED = 'authenticated';

/** Browser storage keys (no PHI is ever stored). */
export const STORAGE_KEYS = {
  token: 'ec.token',
  uiSettings: 'ec.ui',
  /** Sign-in email → token of a device trusted for two-factor sign-in ("Don't ask again"). */
  trustedDevices: 'ec.trusted-devices',
} as const;

/** Clinic time zone and display formats (ClinicClock mirror). Weeks start on Sunday. */
export const CLINIC_TIME_ZONE = 'Asia/Bahrain';
export const CLINIC_LOCALE = 'en-GB';
export const DATE_FORMAT = 'dd MMM yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = `${DATE_FORMAT}, ${TIME_FORMAT}`;
