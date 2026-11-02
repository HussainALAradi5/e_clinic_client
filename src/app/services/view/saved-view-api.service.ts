import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { SavedView, SavedViewPayload } from '@interfaces/view/saved-view.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Identity › List views — own + shared saved layouts per resource. */
@Injectable({ providedIn: 'root' })
export class SavedViewApi {
  private readonly api = inject(ApiClient);

  list(query: ListQuery, resource?: string): Observable<Page<SavedView>> {
    return this.api.list<SavedView>('views', query, { resource });
  }

  create(payload: SavedViewPayload): Observable<SavedView> {
    return this.api.post<SavedView>('views', payload);
  }

  update(id: string, payload: SavedViewPayload): Observable<SavedView> {
    return this.api.put<SavedView>(`views/${id}`, payload);
  }

  setDefault(id: string): Observable<SavedView> {
    return this.api.patch<SavedView>(`views/${id}/default`);
  }

  remove(id: string): Observable<void> {
    return this.api.delete(`views/${id}`);
  }
}
