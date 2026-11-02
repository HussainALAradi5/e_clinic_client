import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { Appointment } from '@interfaces/clinic/appointment.interface';

/** Compact booking rows (date, time, who, status) linking to the booking — patient, doctor and room pages. */
@Component({
  selector: 'app-appointment-rows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusChip, DatePipe],
  host: { class: 'block' },
  templateUrl: './appointment-rows.component.html',
})
export class AppointmentRows {
  readonly appointments = input.required<Appointment[]>();
  /** Which party to name: the patient (doctor / room pages) or the provider (patient page). */
  readonly show = input<'patient' | 'provider'>('patient');
  readonly empty = input('No appointments.');
  protected readonly dateFormat = DATE_FORMAT;
}
