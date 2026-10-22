import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env';
import { catchError, finalize, from, map, retry, switchMap, throwError, timer } from 'rxjs';
import { IDEMPOTENCY_KEY, RAW_URL, SILENT, SKIP_CASE } from './http-context';
import { blobText } from '@shared/utils/download';
import {
  ACCOUNT_SECURITY_PATH,
  API_PREFIX,
  IDEMPOTENCY_HEADER,
  LOGIN_PATH,
  REQUEST_ID_HEADER,
} from '@shared/constants/app.constants';
import { ErrorCode } from '@shared/enums/api/error-code.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { AuthStore } from '@shared/services/auth/auth.store';
import { LoadingService } from '@shared/services/ui/loading.service';
import { convertKeys, toCamel, toSnake, toSnakeParam } from '@shared/utils/case';

/** 1 — Relative URLs go to `${environment.apiUrl}/api/v1/…`. */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.context.get(RAW_URL) ||
    /^(https?:)?\/\//.test(req.url) ||
    req.url.startsWith('assets/')
  ) {
    return next(req);
  }
  return next(req.clone({ url: environment.apiUrl + API_PREFIX + req.url.replace(/^\/+/, '') }));
};

/** 2 — Bearer token from AuthStore. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

/** 3 — Correlation id (AssignRequestId), shown in error toasts for support. */
export const requestIdInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.headers.has(REQUEST_ID_HEADER)
      ? req
      : req.clone({ setHeaders: { [REQUEST_ID_HEADER]: crypto.randomUUID() } }),
  );

/** 4 — Idempotency-Key from the request context (EnsureIdempotency). */
export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  const key = req.context.get(IDEMPOTENCY_KEY);
  return next(key ? req.clone({ setHeaders: { [IDEMPOTENCY_HEADER]: key } }) : req);
};

/** 5 — camelCase in the app, snake_case on the wire (body keys and query parameter names). */
export const caseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_CASE)) {
    return next(req);
  }

  let params = new HttpParams();
  for (const key of req.params.keys()) {
    for (const value of req.params.getAll(key) ?? []) {
      params = params.append(toSnakeParam(key), value);
    }
  }
  const body =
    req.body instanceof FormData || req.body instanceof Blob
      ? req.body
      : convertKeys(req.body, toSnake);

  return next(req.clone({ params, body })).pipe(
    map((event) =>
      event instanceof HttpResponse &&
      event.body &&
      typeof event.body === 'object' &&
      !(event.body instanceof Blob)
        ? event.clone({ body: convertKeys(event.body, toCamel) })
        : event,
    ),
  );
};

/** 6 — Global progress bar (skipped for SILENT polling). */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SILENT)) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};

/**
 * 7 — Error envelope → ApiError; 401 → sign out; 403 AUTH_2FA_REQUIRED (privileged role without 2FA) → security page;
 * 429 on GET → one retry after Retry-After (≤ 10 s).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    retry({
      count: req.method === 'GET' ? 1 : 0,
      delay: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 429) {
          const seconds = Math.min(Number(error.headers.get('Retry-After') ?? 1), 10);
          return timer(seconds * 1000);
        }
        return throwError(() => error);
      },
    }),
    // File requests (responseType blob) get their JSON error envelope as a Blob — read it first.
    catchError((error: unknown) =>
      error instanceof HttpErrorResponse && error.error instanceof Blob
        ? from(withJsonBody(error)).pipe(switchMap((parsed) => throwError(() => parsed)))
        : throwError(() => error),
    ),
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const apiError = toApiError(error, req.headers.get(REQUEST_ID_HEADER));
      if (apiError.status === 401 && auth.isAuthenticated()) {
        auth.clear();
        void router.navigate([LOGIN_PATH], { queryParams: { returnUrl: router.url } });
      } else if (apiError.status === 403 && apiError.code === ErrorCode.TwoFactorRequired) {
        void router.navigate([ACCOUNT_SECURITY_PATH], { queryParams: { setup: '2fa' } });
      }
      return throwError(() => apiError);
    }),
  );
};

/** Same error with its Blob body parsed as JSON (left as is when it is not JSON). */
async function withJsonBody(error: HttpErrorResponse): Promise<HttpErrorResponse> {
  try {
    const body: unknown = JSON.parse(await blobText(error.error as Blob));
    return new HttpErrorResponse({
      error: body,
      headers: error.headers,
      status: error.status,
      statusText: error.statusText,
      url: error.url ?? undefined,
    });
  } catch {
    return error;
  }
}

export function toApiError(
  error: HttpErrorResponse,
  fallbackRequestId: string | null = null,
): ApiError {
  const body = (error.error ?? {}) as Record<string, unknown>;
  const offline = error.status === 0;
  return {
    status: error.status,
    code:
      typeof body['error_code'] === 'string'
        ? body['error_code']
        : offline
          ? 'NETWORK_ERROR'
          : `HTTP_${error.status}`,
    message:
      typeof body['message'] === 'string'
        ? body['message']
        : offline
          ? 'You appear to be offline. Check your connection and try again.'
          : 'Something went wrong. Please try again.',
    errors: (body['errors'] as Record<string, string[]> | null | undefined) ?? null,
    meta: (body['meta'] as Record<string, unknown> | null | undefined) ?? null,
    requestId:
      (body['request_id'] as string | undefined) ??
      error.headers?.get(REQUEST_ID_HEADER) ??
      fallbackRequestId,
  };
}

/** Registration order matters (requests run top → bottom). */
export const API_INTERCEPTORS: HttpInterceptorFn[] = [
  apiUrlInterceptor,
  authInterceptor,
  requestIdInterceptor,
  idempotencyInterceptor,
  caseInterceptor,
  loadingInterceptor,
  errorInterceptor,
];
