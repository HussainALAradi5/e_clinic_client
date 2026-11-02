/** POST /auth/reset-password (also completes account invitations). */
export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}
