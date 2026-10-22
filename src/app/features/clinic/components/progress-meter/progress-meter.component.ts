import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TreatmentProgress } from '@shared/interfaces/clinic/treatment.interface';

/**
 * One bar per planned session: attended (filled), missed (red), booked (outlined), still to book (empty) — the
 * plan's progress at a glance, with the counts beside it.
 */
@Component({
  selector: 'app-progress-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './progress-meter.component.html',
})
export class ProgressMeter {
  readonly progress = input.required<TreatmentProgress>();
  readonly compact = input(false);

  protected readonly cells = computed(() => {
    const p = this.progress();
    const total = Math.max(p.plannedSessions, p.attendedSessions + p.absentSessions);
    return Array.from({ length: total }, (_, i) => {
      if (i < p.attendedSessions) return 'attended';
      if (i < p.attendedSessions + p.upcomingSessions) return 'booked';
      return 'open';
    });
  });
}
