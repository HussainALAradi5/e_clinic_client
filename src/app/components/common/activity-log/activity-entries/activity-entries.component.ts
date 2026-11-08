import { dateTimeSecondsFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ACTIVITY_LOG_TEXT } from '@constants/common/activity-log.constants';
import { ActivityEntry } from '@interfaces/identity/activity-entry.interface';
import { describeChanges } from '@utilities/activity-log';

/** Activity entries as plain sentences: who, the action as a badge, what changed and when. */
@Component({
  selector: 'app-activity-entries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusChip, DatePipe],
  host: { class: 'block min-w-0' },
  templateUrl: './activity-entries.component.html',
})
export class ActivityEntries {
  protected readonly text = ACTIVITY_LOG_TEXT;
  protected readonly dateFormat = dateTimeSecondsFormat;

  readonly entries = input.required<ActivityEntry[]>();

  protected readonly rows = computed(() =>
    this.entries().map((entry) => ({ entry, changes: describeChanges(entry.changes) })),
  );
}
