/** Limits shared with the server (config/clinic.php, API conventions). */

export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;
export const MAX_FILTER_DEPTH = 3;
export const MAX_FILTER_CONDITIONS = 20;

export const MAX_BULK_IDS = 500;
export const BULK_SYNC_LIMIT = 100;
/** Above this many targets the user types the number to confirm (UI/UX guide §4). */
export const TYPE_TO_CONFIRM_THRESHOLD = 50;

export const REASON_MAX_LENGTH = 500;

/** Emergency / additional contacts of a patient (server: EmergencyContactData::MAX). */
export const MAX_EMERGENCY_CONTACTS = 3;

/** Password policy (security doc §2) and TOTP code length. */
export const PASSWORD_MIN_LENGTH = 10;
export const TOTP_LENGTH = 6;
/** Seconds before "Send a new code" can be used again (forgot password). */
export const RESEND_CODE_SECONDS = 60;
/** How long "Don't ask again on this device" skips the 2FA code (server: clinic.auth.trusted_device_days). */
export const TRUSTED_DEVICE_DAYS = 30;

export const MONEY_DECIMALS = 3;
export const MONEY_PATTERN = /^-?\d{1,11}(\.\d{1,3})?$/;

export const UPLOAD_LIMITS = {
  maxFiles: 20,
  maxDirectBytes: 20 * 1024 * 1024,
  maxRequestBytes: 100 * 1024 * 1024,
  maxResumableBytes: 500 * 1024 * 1024,
  chunkBytes: 5 * 1024 * 1024,
  parallel: 3,
} as const;

/** Minimum spinner time so fast requests do not flicker; success tick duration. */
export const MIN_BUSY_MS = 300;
export const SUCCESS_MS = 1200;

/** Stock corrections above this many units (or of controlled drugs) need another pharmacist (config pharmacy.adjustment_approval_threshold). */
export const STOCK_ADJUSTMENT_APPROVAL_LIMIT = 10;
