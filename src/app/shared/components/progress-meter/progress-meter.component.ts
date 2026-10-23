import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PROGRESS_HEALTH } from '@shared/constants/progress-health.constants';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { TreatmentProgress } from '@shared/interfaces/clinic/treatment.interface';
import { progressHealth } from '@shared/utils/treatment-progress';

type Cell = 'attended' | 'missed' | 'booked' | 'open';

/**
 * One segment per session — attended (filled), missed (red), booked (outlined), still to book (empty) — coloured by
 * how the plan is going: on track, missing sessions (amber), at risk (red), completed (green) or stopped (grey).
 * The health is also written next to the bar, so colour is never the only signal.
 */
@Component({
  selector: 'ui-progress-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './progress-meter.component.html',
})
export class ProgressMeter {
  readonly progress = input.required<TreatmentProgress>();
  /** The plan's status (cancelled → stopped, completed → done). */
  readonly status = input<GenericStatus | null>(null);
  /** Bar and health only — no counts underneath (lists, cards). */
  readonly compact = input(false);

  protected readonly health = computed(
    () => PROGRESS_HEALTH[progressHealth(this.progress(), this.status())],
  );

  protected readonly cells = computed<Cell[]>(() => {
    const p = this.progress();
    const total = Math.max(
      p.plannedSessions,
      p.attendedSessions + p.absentSessions + p.upcomingSessions,
    );
    return Array.from({ length: total }, (_, i): Cell => {
      if (i < p.attendedSessions) return 'attended';
      if (i < p.attendedSessions + p.absentSessions) return 'missed';
      if (i < p.attendedSessions + p.absentSessions + p.upcomingSessions) return 'booked';
      return 'open';
    });
  });

  protected cellClass(cell: Cell): string {
    const health = this.health();
    switch (cell) {
      case 'attended':
        return health.fill;
      case 'missed':
        return 'bg-red-300 dark:bg-red-800';
      case 'booked':
        return `border-2 ${health.ring}`;
      case 'open':
        return 'bg-surface-container-highest';
    }
  }
}
