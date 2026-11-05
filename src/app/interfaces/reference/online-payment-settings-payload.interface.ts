/** PUT reference/clinic-profile/online-payments — an empty secret key keeps the saved one. */
export interface OnlinePaymentSettingsPayload {
  enabled: boolean;
  baseUrl: string | null;
  source: string | null;
  secretKey: string | null;
  clearSecretKey: boolean;
}
