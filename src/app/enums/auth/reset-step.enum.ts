/** Steps of "forgot password": email → 6-digit code → new password (invitation links start at Password). */
export enum ResetStep {
  Email = 'email',
  Code = 'code',
  Password = 'password',
}
