/** Online payments as the admin screen sees them (OnlinePaymentSettingsResource): never the secret key itself. */
export interface OnlinePaymentSettings {
  enabled: boolean;
  /** `tap` once a secret key is saved, otherwise the server's local test checkout (`fake`). */
  driver: string;
  baseUrl: string;
  source: string;
  hasSecretKey: boolean;
  /** e.g. `sk_test_…wxyz`. */
  secretKeyHint: string | null;
  /** Register this in the Tap dashboard: Tap posts each payment's result here. */
  webhookUrl: string;
  /** Where the payer comes back after paying. */
  returnUrl: string;
}
