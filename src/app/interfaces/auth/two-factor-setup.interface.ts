/** POST /auth/two-factor/enable. */
export interface TwoFactorSetup {
  qrCodeSvg: string;
  otpauthUrl: string;
}
