import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, of, shareReplay, tap } from 'rxjs';
import { SKIP_CASE } from '@middlewares/interceptors/http-context';
import { ApiEnvelope } from '@interfaces/api/api-envelope.interface';
import { EnumCatalog } from '@interfaces/common/enum-catalog.type';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { CATEGORY_TONES, STATUS_TONES } from '@constants/status-tones.constants';
import { StatusTone } from '@enums/ui/status-tone.enum';
import { humanise } from '@utilities/text';
import { ENDPOINTS } from '@config/endpoints';

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
      .get<ApiEnvelope<EnumCatalog>>(ENDPOINTS.meta.enums, {
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

  /** Badge colour of a value: the hand-picked one, else a stable colour from the value's place in the enum. */
  tone(enumName: string, value: string | number | null | undefined): StatusTone {
    if (value === null || value === undefined || value === '') {
      return StatusTone.Grey;
    }
    const fixed = STATUS_TONES[enumName];
    if (fixed) {
      return fixed[String(value)] ?? StatusTone.Grey;
    }
    const index = this.options(enumName).findIndex((o) => String(o.value) === String(value));
    return index < 0 ? StatusTone.Grey : CATEGORY_TONES[index % CATEGORY_TONES.length];
  }

  canTransition(enumName: string, from: string, to: string): boolean {
    return this.catalog()[enumName]?.transitions?.[from]?.includes(to) ?? false;
  }
}
