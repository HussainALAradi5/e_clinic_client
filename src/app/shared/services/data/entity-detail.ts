import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/**
 * Detail-page state of one GenericEntity on top of its EntityApi: load, update, archive, unarchive, soft delete
 * and restore. Mutations keep the detail-only `usage` counts already shown. One instance per page:
 * `protected readonly detail = new EntityDetail(inject(RoomApi));`
 */
export class EntityDetail<T extends GenericEntity & { usage?: Record<string, number> }, P> {
  readonly record = signal<T | null>(null);
  readonly loading = signal(false);
  readonly error = signal<ApiError | null>(null);

  constructor(private readonly api: EntityApi<T, P>) {}

  async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.record.set(await firstValueFrom(this.api.get(id)));
    } catch (error) {
      this.error.set(error as ApiError);
    } finally {
      this.loading.set(false);
    }
  }

  update(payload: P): Promise<T> {
    return this.keep(this.api.update(this.id(), payload));
  }

  archive(): Promise<T> {
    return this.keep(this.api.archive(this.id()));
  }

  unarchive(): Promise<T> {
    return this.keep(this.api.unarchive(this.id()));
  }

  restore(): Promise<T> {
    return this.keep(this.api.restore(this.id()));
  }

  remove(): Promise<void> {
    return firstValueFrom(this.api.remove(this.id()));
  }

  /** Replace the record after another endpoint changed it (e.g. a service switch). */
  set(record: T): void {
    this.record.set({ ...record, usage: record.usage ?? this.record()?.usage });
  }

  private id(): string {
    return this.record()?.id ?? '';
  }

  private async keep(request: ReturnType<EntityApi<T, P>['get']>): Promise<T> {
    const record = await firstValueFrom(request);
    this.set(record);
    return record;
  }
}
