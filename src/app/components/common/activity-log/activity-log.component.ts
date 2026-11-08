import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivityEntries } from '@components/common/activity-log/activity-entries/activity-entries.component';
import { Collapse } from '@components/common/collapse/collapse.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import {
  ACTIVITY_LOG_TEXT,
  ACTIVITY_LOG_VISIBLE_ENTRIES,
} from '@constants/common/activity-log.constants';
import { ActivityLogStore } from '@services/identity/activity-log.store';

/**
 * Read-only event log of any record: `<app-activity-log entity="invoice" [recordId]="invoice.id" />`.
 * Shown only to users who may read it — wrap it in `*hasAccess="'activity.read_all'"`.
 */
@Component({
  selector: 'app-activity-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActivityEntries, Collapse, EmptyState, ErrorState, Skeleton, MatButtonModule],
  providers: [ActivityLogStore],
  host: { class: 'block min-w-0' },
  templateUrl: './activity-log.component.html',
})
export class ActivityLog {
  protected readonly text = ACTIVITY_LOG_TEXT;

  readonly entity = input.required<string>();
  readonly recordId = input.required<string>();

  protected readonly store = inject(ActivityLogStore);
  protected readonly expanded = signal(false);
  protected readonly latest = computed(() =>
    this.store.entries().slice(0, ACTIVITY_LOG_VISIBLE_ENTRIES),
  );
  protected readonly earlier = computed(() =>
    this.store.entries().slice(ACTIVITY_LOG_VISIBLE_ENTRIES),
  );
  protected readonly earlierLabel = computed(() => {
    const count = this.earlier().length;
    return `${count} ${count === 1 ? ACTIVITY_LOG_TEXT.moreEntry : ACTIVITY_LOG_TEXT.moreEntries}`;
  });

  constructor() {
    effect(() => {
      const entity = this.entity();
      const recordId = this.recordId();
      untracked(() => {
        this.expanded.set(false);
        this.store.open(entity, recordId);
      });
    });
  }

  /** New entries land in the collapse, so it opens to show them. */
  protected loadMore(): void {
    this.expanded.set(true);
    this.store.loadMore();
  }
}
