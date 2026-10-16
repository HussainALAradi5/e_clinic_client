/** Stable `error_code` values the client switches on (lang/en/errors.php on the server). */
export enum ErrorCode {
  Unauthenticated = 'UNAUTHENTICATED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  ValidationFailed = 'VALIDATION_FAILED',
  TooManyRequests = 'TOO_MANY_REQUESTS',
  ConcurrentModification = 'CONCURRENT_MODIFICATION',
  InvalidCredentials = 'AUTH_INVALID_CREDENTIALS',
  AccountLocked = 'AUTH_ACCOUNT_LOCKED',
  AccountInactive = 'AUTH_ACCOUNT_INACTIVE',
  TwoFactorRequired = 'AUTH_2FA_REQUIRED',
  TwoFactorInvalid = 'AUTH_2FA_INVALID',
  ResetTokenInvalid = 'AUTH_RESET_TOKEN_INVALID',
  PersonDuplicate = 'PERSON_DUPLICATE',
}
