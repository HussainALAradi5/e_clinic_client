import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { AuthStore } from './auth.store';
import { TrustedDeviceService } from './trusted-device.service';
import { DEVICE_NAME, LOGIN_PATH, TWO_FACTOR_PATH } from '@shared/constants/app.constants';
import { ErrorCode } from '@shared/enums/api/error-code.enum';
import { ToastType } from '@shared/enums/ui/toast-type.enum';
import { LoginPayload } from '@shared/interfaces/auth/auth-payloads.interface';
import { Session } from '@shared/interfaces/auth/session.interface';
import { TwoFactorChallenge } from '@shared/interfaces/auth/two-factor-challenge.interface';
import { NotifyService } from '@shared/services/ui/notify.service';
import { ResourceSchemaService } from '@shared/services/data/resource-schema.service';
import { AuthApi } from '@shared/services/identity/auth-api.service';
import { isApiError } from '@shared/utils/guards';

/**
 * Sign-in flow on top of AuthApi + AuthStore: login (with the 2FA challenge hand-off), session restore on start-up,
 * logout and the post-login redirect.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(AuthApi);
  private readonly store = inject(AuthStore);
  private readonly schemas = inject(ResourceSchemaService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly trustedDevices = inject(TrustedDeviceService);

  readonly challenge = signal<TwoFactorChallenge | null>(null);

  /** Signs in; navigates to the 2FA page when the account needs a code (a trusted device skips it). */
  async login(
    credentials: Pick<LoginPayload, 'email' | 'password'>,
    returnUrl?: string,
  ): Promise<void> {
    const trustedDeviceToken = this.trustedDevices.get(credentials.email);
    try {
      const session = await firstValueFrom(
        this.api.login({ ...credentials, deviceName: DEVICE_NAME, trustedDeviceToken }),
      );
      await this.start(session, returnUrl);
    } catch (error) {
      const token =
        isApiError(error) && error.code === ErrorCode.TwoFactorRequired
          ? error.meta?.['challenge_token']
          : null;
      if (typeof token !== 'string') {
        throw error;
      }
      if (trustedDeviceToken) {
        this.trustedDevices.forget(credentials.email); // expired or revoked
      }
      this.challenge.set({ token, email: credentials.email, returnUrl });
      this.notify.dismiss();
      await this.router.navigateByUrl(TWO_FACTOR_PATH);
    }
  }

  /** Completes a 2FA login with a 6-digit TOTP code or a recovery code; optionally trusts this browser. */
  async verifyTwoFactor(
    code: string,
    isRecoveryCode: boolean,
    rememberDevice: boolean,
  ): Promise<void> {
    const challenge = this.challenge();
    if (!challenge) {
      await this.router.navigateByUrl(LOGIN_PATH);
      return;
    }
    const session = await firstValueFrom(
      this.api.twoFactorChallenge({
        challengeToken: challenge.token,
        deviceName: DEVICE_NAME,
        rememberDevice,
        ...(isRecoveryCode ? { recoveryCode: code.trim() } : { code }),
      }),
    );
    this.challenge.set(null);
    if (session.trustedDeviceToken) {
      this.trustedDevices.remember(challenge.email, session.trustedDeviceToken);
    }
    await this.start(session, challenge.returnUrl);
  }

  /** App start-up: a stored token is validated with GET /auth/me (expired → signed out). */
  restore(): Observable<boolean> {
    if (!this.store.isAuthenticated()) {
      return of(false);
    }
    return this.api.me().pipe(
      tap((session) => this.store.setSession(session)),
      map(() => true),
      catchError(() => {
        this.store.clear();
        return of(false);
      }),
    );
  }

  /** Re-reads the user and effective access (after 2FA changes or role changes). */
  refresh(): Observable<Session> {
    return this.api.me().pipe(tap((session) => this.store.setSession(session)));
  }

  /** Signs out; `farewell` replaces the usual goodbye (e.g. why the session ended). */
  logout(farewell = 'See you next time.'): Observable<void> {
    return this.api.logout().pipe(
      catchError(() => of(undefined)),
      finalize(() => this.end(farewell)),
    );
  }

  /** Revokes every token (all devices), including this one. */
  logoutAll(): Observable<number> {
    return this.api.logoutAll().pipe(
      map((result) => result.revoked),
      finalize(() => this.end()),
    );
  }

  /** A requested page (returnUrl), else the user's start page — the staff guard sends patients to their portal. */
  private async start(session: Session, returnUrl?: string): Promise<void> {
    this.schemas.clear();
    this.store.setSession(session);
    await this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : this.store.homePath());
    this.notify.show(ToastType.Success, `Welcome back, ${session.user.firstName}.`, {
      title: 'Signed in',
      duration: 2500,
    });
  }

  private end(farewell = 'See you next time.'): void {
    const signedIn = this.store.isAuthenticated();
    this.store.clear();
    this.schemas.clear();
    void this.router.navigateByUrl(LOGIN_PATH);
    if (signedIn) {
      this.notify.show(ToastType.Info, farewell, {
        title: 'Signed out',
        duration: 2500,
      });
    }
  }
}
