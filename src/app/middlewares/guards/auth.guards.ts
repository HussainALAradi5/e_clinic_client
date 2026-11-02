import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { FORBIDDEN_PATH, LOGIN_PATH, PORTAL_PATH } from '@constants/app.constants';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';

/** Signed-in users only; keeps the requested URL as returnUrl. */
export const authGuard: CanMatchFn = (_route, segments) => {
  if (inject(AuthStore).isAuthenticated()) {
    return true;
  }
  const returnUrl = '/' + segments.map((s) => s.path).join('/');
  return inject(Router).createUrlTree([LOGIN_PATH], { queryParams: { returnUrl } });
};

/** Portal pages: patients only. */
export const patientGuard: CanMatchFn = () => inject(AuthStore).isPatient();

/** Staff workspace: everyone signed in except patients, who are sent to their portal. */
export const staffGuard: CanMatchFn = () =>
  !inject(AuthStore).isPatient() || inject(Router).createUrlTree([PORTAL_PATH]);

/**
 * Sign-in layout: matches only for signed-out users, so a signed-in user's URLs fall through to the shell
 * (returning a UrlTree here would loop on '/', which both layouts share).
 */
export const guestGuard: CanMatchFn = () => !inject(AuthStore).isAuthenticated();

/** `canMatch: [accessGuard('invoices.read_all | invoices.read_own')]` — the lazy feature is not even downloaded when false. */
export function accessGuard(expression: string): CanMatchFn {
  return () => {
    const access = inject(AccessService);
    const router = inject(Router);
    return access.ensureLoaded().pipe(
      map((loaded) => (loaded && access.can(expression)) || router.createUrlTree([FORBIDDEN_PATH])),
      catchError(() => of(router.createUrlTree([FORBIDDEN_PATH]))),
    );
  };
}
