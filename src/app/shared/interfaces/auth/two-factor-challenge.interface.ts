/** Pending 2FA login (memory only — never stored). */
export interface TwoFactorChallenge {
  token: string;
  email: string;
  returnUrl?: string;
}
