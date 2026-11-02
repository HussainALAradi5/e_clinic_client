import { PASSWORD_MIN_LENGTH } from '@constants/limits.constants';
import { PasswordCheck } from '@interfaces/ui/password-check.interface';

/** The server's Password::defaults() rules (the breached-password check runs on the server only). */
export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { label: `${PASSWORD_MIN_LENGTH}+ characters`, ok: value.length >= PASSWORD_MIN_LENGTH },
    { label: 'Upper and lower case', ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: 'A number', ok: /\d/.test(value) },
    { label: 'A symbol', ok: /[^A-Za-z0-9]/.test(value) },
  ];
}

/** 0 – 4: how many policy rules the value meets (strength meter). */
export function passwordScore(value: string): number {
  return value ? passwordChecks(value).filter((check) => check.ok).length : 0;
}
