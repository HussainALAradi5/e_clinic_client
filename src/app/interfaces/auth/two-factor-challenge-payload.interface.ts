/** POST /auth/two-factor/challenge — a TOTP code or a recovery code. */
export interface TwoFactorChallengePayload {
  challengeToken: string;
  code?: string;
  recoveryCode?: string;
  deviceName: string;
  /** Trust this browser: later sign-ins skip the code (TRUSTED_DEVICE_DAYS). */
  rememberDevice?: boolean;
}
