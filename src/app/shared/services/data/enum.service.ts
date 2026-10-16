import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, of, shareReplay, tap } from 'rxjs';
import { SKIP_CASE } from '@core/interceptors/http-context';
import { ApiEnvelope } from '@shared/interfaces/api/api-envelope.interface';
import { EnumCatalog, EnumOption } from '@shared/interfaces/common/enum-meta.interface';
import { humanise } from '@shared/utils/text';

/** Labels, options and transitions of every enum from GET /meta/enums (loaded once; keys kept as sent). */
@Injectable({ providedIn: 'root' })
export class EnumService {
  private readonly http = inject(HttpClient);
  private readonly catalog = signal<EnumCatalog>({});
  private request$?: Observable<EnumCatalog>;

  readonly loaded = computed(() => Object.keys(this.catalog()).length > 0);

  load(): Observable<EnumCatalog> {
    if (this.loaded()) {
      return of(this.catalog());
    }
    this.request$ ??= this.http
      .get<ApiEnvelope<EnumCatalog>>('meta/enums', {
        context: new HttpContext().set(SKIP_CASE, true),
      })
      .pipe(
        map((res) => res.data),
        tap((catalog) => this.catalog.set(catalog)),
        shareReplay(1),
      );
    return this.request$;
  }

  options(enumName: string): EnumOption[] {
    return this.catalog()[enumName]?.options ?? [];
  }

  /** Label for a value; falls back to a humanised value ('in_progress' → 'In progress'). */
  label(enumName: string, value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return this.options(enumName).find((o) => o.value === value)?.label ?? humanise(String(value));
  }

  canTransition(enumName: string, from: string, to: string): boolean {
    return this.catalog()[enumName]?.transitions?.[from]?.includes(to) ?? false;
  }
}
