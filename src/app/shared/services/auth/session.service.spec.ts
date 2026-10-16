import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { SessionService } from './session.service';
import { API_INTERCEPTORS } from '@core/interceptors/api.interceptors';

const SESSION = {
  token: '1|abc',
  token_type: 'Bearer',
  user: { id: 'u1', full_name: 'Sara Ali', two_factor: { enabled: true, required: true } },
  roles: ['admin'],
  permissions: ['users.read_all'],
};

describe('SessionService', () => {
  let session: SessionService;
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors(API_INTERCEPTORS)),
        provideHttpClientTesting(),
      ],
    });
    session = TestBed.inject(SessionService);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    TestBed.inject(AuthStore).clear();
    backend.verify();
  });

  it('hands a 2FA challenge to the verification page, then starts the session', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl');

    const login = session.login({ email: 'sara@example.com', password: 'secret' }, '/system/users');
    backend
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush(
        {
          success: false,
          error_code: 'AUTH_2FA_REQUIRED',
          message: '2FA',
          meta: { challenge_token: 'ch-1' },
        },
        { status: 401, statusText: 'Unauthorized' },
      );
    await login;

    expect(session.challenge()).toEqual({
      token: 'ch-1',
      email: 'sara@example.com',
      returnUrl: '/system/users',
    });
    expect(navigate).toHaveBeenCalledWith('/login/2fa');

    const verify = session.verifyTwoFactor('123456', false);
    const req = backend.expectOne((r) => r.url.endsWith('/auth/two-factor/challenge'));
    expect(req.request.body).toEqual({
      challenge_token: 'ch-1',
      device_name: 'angular-web',
      code: '123456',
    });
    req.flush({ success: true, data: SESSION });
    await verify;

    const store = TestBed.inject(AuthStore);
    expect(store.token()).toBe('1|abc');
    expect(store.user()?.fullName).toBe('Sara Ali');
    expect(store.permissions()).toEqual(['users.read_all']);
    expect(session.challenge()).toBeNull();
    expect(navigate).toHaveBeenLastCalledWith('/system/users');
  });

  it('rethrows other sign-in errors', async () => {
    const login = session.login({ email: 'x@example.com', password: 'bad' });
    backend
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush(
        { success: false, error_code: 'AUTH_INVALID_CREDENTIALS', message: 'Wrong' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await expect(login).rejects.toMatchObject({ code: 'AUTH_INVALID_CREDENTIALS' });
    expect(session.challenge()).toBeNull();
  });
});
