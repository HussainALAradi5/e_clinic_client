import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VisitCard } from '@components/portal/visit-card/visit-card.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { PORTAL_PATH } from '@constants/app.constants';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { APPOINTMENTS_TEXT } from '@constants/portal/appointments.constants';

const PAGE_SIZE = 20;
const UPCOMING = [
  AppointmentStatus.Pending,
  AppointmentStatus.Confirmed,
  AppointmentStatus.CheckedIn,
];

/** `/portal/appointments` — upcoming visits (soonest first) with check-in code and cancel; past ones newest first. */
@Component({
  selector: 'app-my-appointments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    VisitCard,
    EmptyState,
    Skeleton,
  ],
  templateUrl: './appointments.page.html',
})
export class MyAppointmentsPage {
  private readonly api = inject(AppointmentApi);

  protected readonly bookPath = `${PORTAL_PATH}/appointments/new`;
  protected readonly view = signal<'upcoming' | 'past'>('upcoming');
  protected readonly visits = signal<Appointment[] | null>(null);
  protected readonly more = signal(false);
  private page = 1;

  protected readonly empty = computed(() =>
    this.view() === 'upcoming'
      ? { title: APPOINTMENTS_TEXT.noUpcomingVisits, message: APPOINTMENTS_TEXT.bookAVisitAndIt }
      : { title: APPOINTMENTS_TEXT.noPastVisitsYet, message: null },
  );

  constructor() {
    void this.load();
  }

  protected show(view: 'upcoming' | 'past'): void {
    this.view.set(view);
    this.visits.set(null);
    void this.load();
  }

  protected async load(next = false): Promise<void> {
    this.page = next ? this.page + 1 : 1;
    const today = clinicIsoDate();
    const upcoming = this.view() === 'upcoming';
    const filter: FilterGroup = upcoming
      ? { and: [{ status: { in: UPCOMING } }, { scheduledDate: { gte: today } }] }
      : { or: [{ status: { nin: UPCOMING } }, { scheduledDate: { lt: today } }] };
    const page = await firstValueFrom(
      this.api.list({
        page: this.page,
        perPage: PAGE_SIZE,
        sort: upcoming ? ['scheduledDate', 'startTime'] : ['-scheduledDate', '-startTime'],
        filter,
      }),
    ).catch(() => null);
    const rows = page?.data ?? [];
    this.visits.update((list) => (next ? [...(list ?? []), ...rows] : rows));
    this.more.set(rows.length === PAGE_SIZE);
  }

  protected changed(updated: Appointment): void {
    this.visits.update((list) => (list ?? []).map((v) => (v.id === updated.id ? updated : v)));
  }
}
