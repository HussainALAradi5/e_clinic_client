import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Idempotency-Key for money / booking POSTs (EnsureIdempotency). Reuse the same key when retrying one user action. */
export const IDEMPOTENCY_KEY = new HttpContextToken<string | null>(() => null);
/** Skip the global progress bar (polling). */
export const SILENT = new HttpContextToken<boolean>(() => false);
/** Keep keys as sent by the server (maps keyed by data, e.g. /meta/enums). */
export const SKIP_CASE = new HttpContextToken<boolean>(() => false);
/** Do not prefix the API base URL (absolute or asset URLs). */
export const RAW_URL = new HttpContextToken<boolean>(() => false);

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function withIdempotencyKey(
  key: string = newIdempotencyKey(),
  context = new HttpContext(),
): HttpContext {
  return context.set(IDEMPOTENCY_KEY, key);
}

export function silent(context = new HttpContext()): HttpContext {
  return context.set(SILENT, true);
}
