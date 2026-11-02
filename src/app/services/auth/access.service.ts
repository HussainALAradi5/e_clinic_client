import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { AuthStore } from './auth.store';
import { ApiEnvelope } from '@interfaces/api/api-envelope.interface';
import { EffectiveAccess } from '@interfaces/auth/session.interface';
import { evaluatePermissionExpression } from '@utilities/permission-expression';

/**
 * Client mirror of PermissionExpression + CheckAccess: `can('invoices.write & invoices.issue')`.
 * UI hiding is a convenience — the server re-checks every request.
 */
@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);

  can(expression: string): boolean {
    return evaluatePermissionExpression(
      expression,
      this.auth.isAuthenticated() ? this.auth.grantedPermissions() : null,
    );
  }

  /** Reactive variant for templates and computed state. */
  canSignal(expression: () => string | null): Signal<boolean> {
    return computed(() => {
      const value = expression();
      return value === null || this.can(value);
    });
  }

  /** Loads GET /roles/me/access once per session (guards call it before evaluating). */
  ensureLoaded(): Observable<boolean> {
    if (!this.auth.isAuthenticated()) {
      return of(false);
    }
    if (this.auth.accessLoaded()) {
      return of(true);
    }
    return this.http.get<ApiEnvelope<EffectiveAccess>>('roles/me/access').pipe(
      tap((res) => this.auth.setAccess(res.data)),
      map(() => true),
    );
  }
}
