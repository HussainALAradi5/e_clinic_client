import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { Page } from '@shared/interfaces/api/page.interface';
import { BulkActionRequest, BulkResult } from '@shared/interfaces/bulk/bulk.interface';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';

/**
 * Client mirror of BaseEntityService: list / get / create / update / archive / unarchive / delete (soft) / restore / bulk.
 * Feature APIs extend it and add their business endpoints:
 *
 *   @Injectable({ providedIn: 'root' })
 *   export class RoomApi extends EntityApi<Room, RoomPayload> { constructor() { super('clinic/rooms'); } }
 */
export abstract class EntityApi<T extends GenericEntity, TCreate = Partial<T>, TUpdate = TCreate> {
  protected readonly api = inject(ApiClient);

  protected constructor(protected readonly path: string) {}

  list(query: ListQuery): Observable<Page<T>> {
    return this.api.list<T>(this.path, query);
  }

  get(id: string): Observable<T> {
    return this.api.get<T>(`${this.path}/${id}`);
  }

  create(payload: TCreate): Observable<T> {
    return this.api.post<T>(this.path, payload);
  }

  update(id: string, payload: TUpdate): Observable<T> {
    return this.api.put<T>(`${this.path}/${id}`, payload);
  }

  archive(id: string): Observable<T> {
    return this.api.patch<T>(`${this.path}/${id}/archive`);
  }

  unarchive(id: string): Observable<T> {
    return this.api.patch<T>(`${this.path}/${id}/unarchive`);
  }

  /** Soft delete. */
  remove(id: string): Observable<void> {
    return this.api.delete(`${this.path}/${id}`);
  }

  restore(id: string): Observable<T> {
    return this.api.patch<T>(`${this.path}/${id}/restore`);
  }

  bulk(request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>(`${this.path}/bulk`, request);
  }
}
