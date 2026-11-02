/** POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
  deviceName: string;
  /** Token from an earlier "Don't ask again on this device" (skips the 2FA code). */
  trustedDeviceToken?: string | null;
}
