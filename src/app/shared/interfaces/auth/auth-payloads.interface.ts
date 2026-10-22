/** POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
  deviceName: string;
  /** Token from an earlier "Don't ask again on this device" (skips the 2FA code). */
  trustedDeviceToken?: string | null;
}

/** POST /auth/two-factor/challenge — a TOTP code or a recovery code. */
export interface TwoFactorChallengePayload {
  challengeToken: string;
  code?: string;
  recoveryCode?: string;
  deviceName: string;
  /** Trust this browser: later sign-ins skip the code (TRUSTED_DEVICE_DAYS). */
  rememberDevice?: boolean;
}

/** PUT /auth/password. */
export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

/** POST /auth/forgot-password. */
export interface ForgotPasswordPayload {
  email: string;
}

/** POST /auth/verify-reset-code — the emailed 6-digit code. */
export interface VerifyResetCodePayload {
  email: string;
  code: string;
}

/** One-time token returned for a valid code (sent with ResetPasswordPayload). */
export interface ResetToken {
  token: string;
}

/** POST /auth/reset-password (also completes account invitations). */
export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

/** POST /auth/two-factor/enable. */
export interface TwoFactorSetup {
  qrCodeSvg: string;
  otpauthUrl: string;
}
