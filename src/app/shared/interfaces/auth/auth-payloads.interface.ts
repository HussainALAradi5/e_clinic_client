/** POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
  deviceName: string;
}

/** POST /auth/two-factor/challenge — a TOTP code or a recovery code. */
export interface TwoFactorChallengePayload {
  challengeToken: string;
  code?: string;
  recoveryCode?: string;
  deviceName: string;
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
