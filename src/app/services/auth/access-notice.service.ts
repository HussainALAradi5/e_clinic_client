import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ACCESS_NOTICE_TEXT } from '@constants/common/access-notice.constants';
import { HOME_PATH, LOGIN_PATH, PORTAL_PATH, PUBLIC_HOME_PATH } from '@constants/app.constants';
import { AuthStore } from '@services/auth/auth.store';
import { NotifyService } from '@services/ui/notify.service';

/**
 * Where a refused user goes, with a toast saying why:
 * signed out (page guard or a 401) → the public home page, the toast's "Sign in" brings them back to `returnUrl`;
 * signed in without the right → their own home (dashboard, or the portal for patients).
 */
/** Long enough to reach the toast's "Sign in" button. */
const SIGN_IN_TOAST_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class AccessNotice {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  private readonly notify = inject(NotifyService);

  /** A page that needs signing in, opened while signed out. */
  signInNeeded(returnUrl: string): UrlTree {
    this.offerSignIn(ACCESS_NOTICE_TEXT.signInNeeded, returnUrl);
    return this.router.createUrlTree([PUBLIC_HOME_PATH]);
  }

  /** The server answered 401 to a signed-in user (token expired or revoked). */
  sessionEnded(returnUrl: string): void {
    this.auth.clear();
    this.offerSignIn(ACCESS_NOTICE_TEXT.sessionEnded, returnUrl);
    void this.router.navigateByUrl(PUBLIC_HOME_PATH);
  }

  /** Signed in, but the user's rights do not include the page. */
  noAccess(): UrlTree {
    this.notify.warning(ACCESS_NOTICE_TEXT.noAccess, { title: ACCESS_NOTICE_TEXT.title });
    return this.router.createUrlTree([this.auth.isPatient() ? PORTAL_PATH : HOME_PATH]);
  }

  private offerSignIn(message: string, returnUrl: string): void {
    const back = returnUrl && returnUrl !== PUBLIC_HOME_PATH ? { returnUrl } : {};
    this.notify
      .warning(message, {
        title: ACCESS_NOTICE_TEXT.title,
        action: ACCESS_NOTICE_TEXT.signIn,
        duration: SIGN_IN_TOAST_MS,
      })
      .subscribe(() => void this.router.navigate([LOGIN_PATH], { queryParams: back }));
  }
}
