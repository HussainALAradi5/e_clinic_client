import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppointmentActionsBar } from '../appointment-actions/appointment-actions.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';

/** Minutes past the start after which a not-yet-arrived patient is shown as late. */
const LATE_AFTER_MINUTES = 10;

/** Front-desk card: time, patient, doctor, room, the next step(s) as buttons. */
@Component({
  selector: 'app-appointment-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusChip, AppointmentActionsBar],
  host: { class: 'block' },
  templateUrl: './appointment-card.component.html',
})
export class AppointmentCard {
  readonly appointment = input.required<Appointment>();
  /** Clock tick (ms) from the board so "late" refreshes without reloading. */
  readonly now = input(Date.now());
  /** Action keys offered on the card; the rest live on the detail page. */
  readonly actions = input<string[]>(['confirm', 'check-in', 'start', 'complete', 'no-show']);
  readonly changed = output<Appointment>();

  protected readonly late = computed(() => {
    const a = this.appointment();
    const waiting =
      a.status === AppointmentStatus.Pending || a.status === AppointmentStatus.Confirmed;
    return waiting && this.now() > new Date(a.startsAt).getTime() + LATE_AFTER_MINUTES * 60_000;
  });
}
