import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { patientGuard, staffGuard } from './auth.guards';
import { UserType } from '@shared/enums/identity/user-type.enum';
import { User } from '@shared/interfaces/identity/user.interface';
import { AuthStore } from '@shared/services/auth/auth.store';

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
