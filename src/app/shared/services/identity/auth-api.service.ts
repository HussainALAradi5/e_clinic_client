import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  TwoFactorChallengePayload,
  TwoFactorSetup,
} from '@shared/interfaces/auth/auth-payloads.interface';
import { Session } from '@shared/interfaces/auth/session.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Identity › Authentication endpoints (one method per endpoint, no state). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);

  login(body: LoginPayload): Observable<Session> {
    return this.api.post<Session>('auth/login', body);
  }

  twoFactorChallenge(body: TwoFactorChallengePayload): Observable<Session> {
    return this.api.post<Session>('auth/two-factor/challenge', body);
  }

  logout(): Observable<void> {
    return this.api.post<void>('auth/logout');
  }

  logoutAll(): Observable<{ revoked: number }> {
    return this.api.post<{ revoked: number }>('auth/logout-all');
  }

  me(): Observable<Session> {
    return this.api.get<Session>('auth/me');
  }

  changePassword(body: ChangePasswordPayload): Observable<void> {
    return this.api.put<void>('auth/password', body);
  }

  forgotPassword(body: ForgotPasswordPayload): Observable<void> {
    return this.api.post<void>('auth/forgot-password', body);
  }

  resetPassword(body: ResetPasswordPayload): Observable<void> {
    return this.api.post<void>('auth/reset-password', body);
  }

  enableTwoFactor(): Observable<TwoFactorSetup> {
    return this.api.post<TwoFactorSetup>('auth/two-factor/enable');
  }

  confirmTwoFactor(code: string): Observable<{ recoveryCodes: string[] }> {
    return this.api.post<{ recoveryCodes: string[] }>('auth/two-factor/confirm', { code });
  }

  disableTwoFactor(password: string): Observable<void> {
    return this.api.delete('auth/two-factor', { body: { password } });
  }
}
