import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import { ActivityEntry } from '@interfaces/identity/activity-entry.interface';
import { ActivityRequest } from '@interfaces/identity/activity-request.interface';
import { ActivityApi } from '@services/identity/activity-api.service';
import { newestFirst } from '@utilities/activity-log';

/** State of one activity log: pages accumulate newest first; a newer request cancels the one in flight. */
@Injectable()
export class ActivityLogStore {
  private readonly api = inject(ActivityApi);
  private readonly requests$ = new Subject<ActivityRequest>();
  private lastRequest: ActivityRequest | null = null;

  readonly entries = signal<ActivityEntry[]>([]);
  readonly nextCursor = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<unknown>(null);

  constructor() {
    this.requests$
      .pipe(
        switchMap((request) =>
          this.api.forRecord(request).pipe(
            tap((page) => this.receive(request, page)),
            catchError((error: unknown) => {
              this.fail(error);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  open(entity: string, recordId: string): void {
    this.entries.set([]);
    this.nextCursor.set(null);
    this.send({ entity, recordId });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (cursor && this.lastRequest && !this.loading()) {
      this.send({ ...this.lastRequest, cursor });
    }
  }

  retry(): void {
    if (this.lastRequest) {
      this.send(this.lastRequest);
    }
  }

  private send(request: ActivityRequest): void {
    this.lastRequest = request;
    this.loading.set(true);
    this.error.set(null);
    this.requests$.next(request);
  }

  private receive(request: ActivityRequest, page: Page<ActivityEntry>): void {
    this.entries.update((current) =>
      newestFirst([...(request.cursor ? current : []), ...page.data]),
    );
    this.nextCursor.set(page.meta.nextCursor ?? null);
    this.loading.set(false);
  }

  private fail(error: unknown): void {
    this.error.set(error);
    this.loading.set(false);
  }
}
