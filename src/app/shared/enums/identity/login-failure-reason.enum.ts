/** Mirror of App\Enums\Identity\LoginFailureReason — Reason stored on a failed login attempt. */
export enum LoginFailureReason {
  InvalidCredentials = 'invalid_credentials',
  AccountLocked = 'account_locked',
  AccountInactive = 'account_inactive',
  TooManyAttempts = 'too_many_attempts',
  Invalid2FaCode = 'invalid_2fa_code',
}
