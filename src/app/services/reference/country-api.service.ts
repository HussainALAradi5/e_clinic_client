import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { Country } from '@interfaces/reference/country.interface';
import { CountryPayload } from '@interfaces/reference/country-payload.type';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Reference › Countries — the picker list is fetched once per session and shared. */
@Injectable({ providedIn: 'root' })
export class CountryApi {
  private readonly api = inject(ApiClient);
  private options$: Observable<Country[]> | null = null;

  /** Active countries, GCC first (cached; public endpoint, so it also works before sign-in). */
  options(): Observable<Country[]> {
    return (this.options$ ??= this.api
      .get<Country[]>(`${ENDPOINTS.public}/countries`)
      .pipe(shareReplay(1)));
  }

  list(query: ListQuery, includeInactive = false): Observable<Page<Country>> {
    return this.api.list<Country>(ENDPOINTS.reference.countries, query, {
      includeInactive: includeInactive || undefined,
    });
  }

  update(code: string, payload: CountryPayload): Observable<Country> {
    return this.api
      .put<Country>(`${ENDPOINTS.reference.countries}/${code}`, payload)
      .pipe(tap(() => (this.options$ = null)));
  }
}
