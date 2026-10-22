/** Expiry of a lot as MedicationBatchResource computes it (`expiring` = within the near-expiry window). */
export enum ExpiryStatus {
  Expired = 'expired',
  Expiring = 'expiring',
  Ok = 'ok',
}
