import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentCard } from '@components/clinic/appointment-card/appointment-card.component';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { Lane } from '@interfaces/clinic/front-desk.interface';

/** Board refresh interval — other desks and doctors move bookings too. */
const REFRESH_MS = 30_000;

const { Pending, Confirmed, CheckedIn, InProgress, Completed, NoShow } = AppointmentStatus;
const LANES: Lane[] = [
  { title: 'Expected', hint: 'Check patients in as they arrive', statuses: [Pending, Confirmed] },
  { title: 'Waiting', hint: 'Checked in, waiting for the doctor', statuses: [CheckedIn] },
  { title: 'With doctor', hint: 'Visit in progress', statuses: [InProgress] },
  { title: 'Done', hint: 'Completed or did not come', statuses: [Completed, NoShow] },
];

/** `/clinic/front-desk` — today's bookings as a board: expected → waiting → with doctor → done. Refreshes itself. */
@Component({
  selector: 'app-front-desk-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    AppointmentCard,
    TextField,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './front-desk.page.html',
})
export class FrontDeskPage {
  private readonly api = inject(AppointmentApi);
  private readonly actions = inject(AppointmentActions);

  protected readonly today = signal(clinicIsoDate());
  protected readonly now = signal(Date.now());
  protected readonly appointments = signal<Appointment[] | null>(null);
  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly term = toSignal(this.search.valueChanges, { initialValue: '' });
  protected readonly doctor = signal<string | null>(null);
  protected readonly variants = ButtonVariant;

  protected readonly doctors = computed(() => {
    const names = new Map<string, string>();
    for (const a of this.appointments() ?? []) names.set(a.providerId, a.provider?.fullName ?? '');
    return [...names]
      .map(([id, name]) => ({ id, name }))
      .sort((x, y) => x.name.localeCompare(y.name));
  });
  protected readonly lanes = computed(() => {
    // A scanned check-in code (`appointment:APT-….signature`) searches for its booking code.
    const term = this.term()
      .trim()
      .replace(/^appointment:([^.]+)\..*$/i, '$1')
      .toLowerCase();
    const doctor = this.doctor();
    const shown = (this.appointments() ?? []).filter(
      (a) =>
        (!doctor || a.providerId === doctor) &&
        (!term ||
          [a.patient?.fullName, a.patient?.code, a.patient?.phone, a.code].some((v) =>
            v?.toLowerCase().includes(term),
          )),
    );
    return LANES.map((lane) => ({
      ...lane,
      items: shown.filter((a) => lane.statuses.includes(a.status)),
    }));
  });

  constructor() {
    void this.load();
    const timer = setInterval(() => {
      this.now.set(Date.now());
      if (document.visibilityState === 'visible') void this.load();
    }, REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected async load(): Promise<void> {
    this.today.set(clinicIsoDate());
    const list = await firstValueFrom(this.api.calendar(this.today(), this.today())).catch(
      () => null,
    );
    if (list) this.appointments.set(list);
  }

  protected changed(updated: Appointment): void {
    this.appointments.update((list) =>
      (list ?? []).map((a) => (a.id === updated.id ? updated : a)),
    );
    // A reschedule replaces the booking: reload so the new one shows (or leaves today).
    if (
      updated.status === AppointmentStatus.Rescheduled ||
      updated.status === AppointmentStatus.Cancelled
    )
      void this.load();
  }

  protected toggleDoctor(id: string): void {
    this.doctor.update((current) => (current === id ? null : id));
  }

  protected readonly walkIn = async (): Promise<void> => {
    if (await this.actions.book({ date: this.today() })) await this.load();
  };
}
