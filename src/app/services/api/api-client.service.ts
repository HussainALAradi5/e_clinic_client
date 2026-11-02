import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiEnvelope } from '@interfaces/api/api-envelope.interface';
import { Page, PageMeta } from '@interfaces/api/page.interface';
import { RequestOptions } from '@interfaces/api/request-options.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { toHttpParams } from '@utilities/list-query';

/** Thin HttpClient wrapper that unwraps the success envelope (`data`) — feature APIs never see the envelope. */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(url: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<ApiEnvelope<T>>(url, options).pipe(map((res) => res.data));
  }

  /** Generic list query plus endpoint-specific parameters (`extra`, camelCase keys). */
  list<T>(
    url: string,
    query: ListQuery,
    extra: Record<string, string | number | boolean | null | undefined> = {},
    context?: HttpContext,
  ): Observable<Page<T>> {
    let params = toHttpParams(query);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<ApiEnvelope<T[], PageMeta>>(url, { params, context }).pipe(
      map((res) => ({
        data: res.data,
        meta: res.meta ?? { perPage: query.perPage ?? res.data.length },
      })),
    );
  }

  post<T>(url: string, body: unknown = {}, options: RequestOptions = {}): Observable<T> {
    return this.http.post<ApiEnvelope<T>>(url, body, options).pipe(map((res) => res.data));
  }

  put<T>(url: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.put<ApiEnvelope<T>>(url, body, options).pipe(map((res) => res.data));
  }

  patch<T>(url: string, body: unknown = {}, options: RequestOptions = {}): Observable<T> {
    return this.http.patch<ApiEnvelope<T>>(url, body, options).pipe(map((res) => res.data));
  }

  delete(url: string, options: RequestOptions = {}): Observable<void> {
    return this.http.delete<void>(url, options);
  }
}
