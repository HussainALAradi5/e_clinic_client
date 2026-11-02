/** POST /auth/verify-reset-code — the emailed 6-digit code. */
export interface VerifyResetCodePayload {
  email: string;
  code: string;
}
