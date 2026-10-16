import { HttpContext, HttpParams } from '@angular/common/http';

export interface RequestOptions {
  params?: HttpParams | Record<string, string | number | boolean>;
  context?: HttpContext;
  /** Request body for DELETE endpoints that re-confirm a password. */
  body?: unknown;
}
