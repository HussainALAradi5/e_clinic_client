import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_INTERCEPTORS } from './api.interceptors';
import { withIdempotencyKey } from './http-context';
import { ApiError } from '@interfaces/api/api-error.interface';
import { User } from '@interfaces/identity/user.interface';
import { AuthStore } from '@services/auth/auth.store';
import { NotifyService } from '@services/ui/notify.service';
import { ACCESS_NOTICE_TEXT } from '@constants/common/access-notice.constants';
import { EMPTY } from 'rxjs';

describe('API interceptors', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors(API_INTERCEPTORS)),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthStore).setSession({
      token: 'token-1',
      user: {} as User,
      roles: [],
      permissions: [],
    });
  });

  afterEach(() => {
    TestBed.inject(AuthStore).clear();
    backend.verify();
  });

  it('prefixes /api/v1, adds auth + request id, and converts case both ways', () => {
    let body: unknown;
    http
      .post('billing/invoices', { patientId: 'p1' }, { context: withIdempotencyKey('key-1') })
      .subscribe((res) => (body = res));

    const req = backend.expectOne((r) => r.url.endsWith('/api/v1/billing/invoices'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    expect(req.request.headers.get('X-Request-Id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(req.request.headers.get('Idempotency-Key')).toBe('key-1');
    expect(req.request.body).toEqual({ patient_id: 'p1' });

    req.flush({ success: true, data: { balance_due: { amount: '1.000', currency: 'BHD' } } });
    expect(body).toEqual({
      success: true,
      data: { balanceDue: { amount: '1.000', currency: 'BHD' } },
    });
  });

  it('maps the error envelope to ApiError', () => {
    let error: ApiError | undefined;
    http.post('rooms', {}).subscribe({ error: (e: ApiError) => (error = e) });

    backend
      .expectOne((r) => r.url.endsWith('/api/v1/rooms'))
      .flush(
        {
          success: false,
          message: 'Room is in use.',
          error_code: 'ROOM_IN_USE',
          errors: null,
          meta: { count: 2 },
          request_id: 'req-1',
        },
        { status: 409, statusText: 'Conflict' },
      );

    expect(error).toEqual({
      status: 409,
      code: 'ROOM_IN_USE',
      message: 'Room is in use.',
      errors: null,
      meta: { count: 2 },
      requestId: 'req-1',
    });
  });

  it('signs the user out on 401 and sends them home with a "session ended" toast', () => {
    const warning = vi.spyOn(TestBed.inject(NotifyService), 'warning').mockReturnValue(EMPTY);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    http.get('meta/enums').subscribe({ error: () => undefined });
    backend
      .expectOne((r) => r.url.endsWith('/api/v1/meta/enums'))
      .flush({ error_code: 'UNAUTHENTICATED' }, { status: 401, statusText: 'Unauthorized' });

    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
    expect(warning).toHaveBeenCalledWith(ACCESS_NOTICE_TEXT.sessionEnded, {
      title: ACCESS_NOTICE_TEXT.title,
      action: ACCESS_NOTICE_TEXT.signIn,
      duration: 10_000,
    });
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
