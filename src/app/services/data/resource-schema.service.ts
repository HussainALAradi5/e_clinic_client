import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResourceSchema } from '@interfaces/list/resource-schema.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Loads and caches GET /meta/resources/{resource} per session (filters, columns, bulk actions, export formats). */
@Injectable({ providedIn: 'root' })
export class ResourceSchemaService {
  private readonly api = inject(ApiClient);
  private readonly cache = new Map<string, Observable<ResourceSchema>>();

  schema(resource: string): Observable<ResourceSchema> {
    let schema$ = this.cache.get(resource);
    if (!schema$) {
      schema$ = this.api.get<ResourceSchema>(`meta/resources/${resource}`).pipe(shareReplay(1));
      this.cache.set(resource, schema$);
    }
    return schema$;
  }

  /** Permissions changed (role switch, re-login). */
  clear(): void {
    this.cache.clear();
  }
}
