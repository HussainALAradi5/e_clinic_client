import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { EMPTY, firstValueFrom, isObservable, of } from 'rxjs';
import { accessGuard, authGuard, patientGuard, staffGuard } from './auth.guards';
import { ACCESS_NOTICE_TEXT } from '@constants/common/access-notice.constants';
import { AccessService } from '@services/auth/access.service';
import { NotifyService } from '@services/ui/notify.service';
import { UserType } from '@enums/identity/user-type.enum';
import { User } from '@interfaces/identity/user.interface';
import { AuthStore } from '@services/auth/auth.store';

describe('portal and staff guards', () => {
  const run = (guard: typeof staffGuard): ReturnType<typeof staffGuard> =>
    TestBed.runInInjectionContext(() => guard({}, []));
  const signIn = (userType: UserType): void =>
    TestBed.inject(AuthStore).setSession({
      token: 't',
      user: { firstName: 'A', lastName: 'B', userType } as User,
      roles: [],
      permissions: [],
    });

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => TestBed.inject(AuthStore).clear());

  it('sends patients from the staff workspace to their portal', () => {
    signIn(UserType.Patient);
    expect(run(patientGuard)).toBe(true);
    const result = run(staffGuard);
    expect(result instanceof UrlTree && TestBed.inject(Router).serializeUrl(result)).toBe(
      '/portal',
    );
  });

  it('keeps staff out of the portal', () => {
    signIn(UserType.Receptionist);
    expect(run(staffGuard)).toBe(true);
    expect(run(patientGuard)).toBe(false);
  });
});

describe('refused pages', () => {
  const url = (result: unknown): string | false =>
    result instanceof UrlTree && TestBed.inject(Router).serializeUrl(result);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => TestBed.inject(AuthStore).clear());

  it('sends signed-out users to the home page with a "Sign in" toast', () => {
    const warning = vi.spyOn(TestBed.inject(NotifyService), 'warning').mockReturnValue(EMPTY);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({}, [{ path: 'billing' } as never, { path: 'invoices' } as never]),
    );
    expect(url(result)).toBe('/');
    expect(warning).toHaveBeenCalledWith(ACCESS_NOTICE_TEXT.signInNeeded, {
      title: ACCESS_NOTICE_TEXT.title,
      action: ACCESS_NOTICE_TEXT.signIn,
      duration: 10_000,
    });
  });

  it('sends signed-in users without the right to their home page with a "no access" toast', async () => {
    const warning = vi.spyOn(TestBed.inject(NotifyService), 'warning').mockReturnValue(EMPTY);
    const access = TestBed.inject(AccessService);
    vi.spyOn(access, 'ensureLoaded').mockReturnValue(of(true));
    vi.spyOn(access, 'can').mockReturnValue(false);
    TestBed.inject(AuthStore).setSession({
      token: 't',
      user: { firstName: 'A', lastName: 'B', userType: UserType.Receptionist } as User,
      roles: [],
      permissions: [],
    });
    const result = TestBed.runInInjectionContext(() => accessGuard('payroll.read_all')({}, []));
    const resolved = isObservable(result) ? await firstValueFrom(result) : result;
    expect(url(resolved)).toBe('/dashboard');
    expect(warning).toHaveBeenCalledWith(ACCESS_NOTICE_TEXT.noAccess, {
      title: ACCESS_NOTICE_TEXT.title,
    });
  });
});
