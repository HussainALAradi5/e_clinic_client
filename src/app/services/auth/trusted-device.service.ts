import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '@constants/app.constants';

/**
 * Tokens of this browser's trusted devices ("Don't ask again on this device" after a 2FA code), per sign-in email.
 * The server keeps only their hash and checks them against the account, so a token alone never signs anyone in.
 */
@Injectable({ providedIn: 'root' })
export class TrustedDeviceService {
  get(email: string): string | null {
    return this.read()[this.key(email)] ?? null;
  }

  remember(email: string, token: string): void {
    this.write({ ...this.read(), [this.key(email)]: token });
  }

  forget(email: string): void {
    const { [this.key(email)]: _removed, ...rest } = this.read();
    this.write(rest);
  }

  private key(email: string): string {
    return email.trim().toLowerCase();
  }

  private read(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.trustedDevices) ?? '{}') as Record<
        string,
        string
      >;
    } catch {
      return {};
    }
  }

  private write(value: Record<string, string>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.trustedDevices, JSON.stringify(value));
    } catch {
      /* storage unavailable: the code is asked every time */
    }
  }
}
