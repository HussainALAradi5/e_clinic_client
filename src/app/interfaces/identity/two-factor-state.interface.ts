export interface TwoFactorState {
  enabled: boolean;
  /** One of the user's roles makes 2FA mandatory. */
  required: boolean;
}
