/** Text of the Online payments card on the clinic profile page. */
export const ONLINE_PAYMENT_SETTINGS_TEXT = {
  title: 'Online payments',
  intro:
    'Patients pay their invoices online through Tap. Off until you switch it on: until then the portal and the app show no Pay online button.',
  enabled: 'Let patients pay online',
  baseUrl: 'Tap API address',
  baseUrlHint: 'https://api.tap.company/v2 unless Tap gives you another one.',
  source: 'Payment sources',
  sourceHint: 'src_all for every method Tap offers you (cards, BenefitPay, Apple Pay).',
  secretKey: 'Secret key',
  secretKeyHint:
    'sk_test_… for test mode, sk_live_… for real payments. Saved encrypted; never shown again.',
  keySaved: (hint: string) => `A key is saved (${hint}). Leave this empty to keep it.`,
  noKey: 'No key yet: payments use the local test checkout.',
  clearKey: 'Remove the saved key',
  addresses: 'Give these to Tap',
  webhookUrl: 'Webhook (post) URL',
  returnUrl: 'Return (redirect) URL',
  copy: 'Copy',
  copied: 'Copied.',
  save: 'Save online payments',
  saved: 'Online payment settings saved.',
  testMode: 'Test checkout (no real money)',
  tap: 'Tap',
};
