import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VisitCard } from '@components/portal/visit-card/visit-card.component';
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { PORTAL_PATH } from '@constants/app.constants';
import { VisitTiming } from '@enums/clinic/visit-timing.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { APPOINTMENTS_TEXT } from '@constants/portal/appointments.constants';
import { DateRangeFilter } from '@components/common/date-range-filter/date-range-filter.component';
import { DateRangeValue } from '@interfaces/list/date-range-filter.interface';
import { dateRangeQuery } from '@utilities/date-range-query';

const PAGE_SIZE = 20;

/**
 * `/portal/appointments` — my visits, coloured by timing, with a filter: All · Coming · Today · Past · Missed.
 * Coming and today run soonest first; all, past and missed newest first.
 */
@Component({
  selector: 'app-my-appointments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    VisitCard,
    EnumFilter,
    EmptyState,
    Skeleton,
    DateRangeFilter,
  ],
  templateUrl: './appointments.page.html',
})
export class MyAppointmentsPage {
  /** From / to on the visit date (on the server). */
  protected readonly dateFields = [{ value: 'scheduled_date', label: 'Visit date' }];
  protected readonly dates = signal<DateRangeValue>({});

  private readonly api = inject(AppointmentApi);

  protected readonly bookPath = `${PORTAL_PATH}/appointments/new`;
  protected readonly timing = signal<VisitTiming | null>(null);
  protected readonly visits = signal<Appointment[] | null>(null);
  protected readonly more = signal(false);
  private page = 1;

  protected readonly empty = computed(() => {
    switch (this.timing()) {
      case VisitTiming.Coming:
        return {
          title: APPOINTMENTS_TEXT.noUpcomingVisits,
          message: APPOINTMENTS_TEXT.bookAVisitAndIt,
        };
      case VisitTiming.Today:
        return { title: APPOINTMENTS_TEXT.noVisitsToday, message: null };
      case VisitTiming.Past:
        return { title: APPOINTMENTS_TEXT.noPastVisitsYet, message: null };
      case VisitTiming.Missed:
        return { title: APPOINTMENTS_TEXT.noMissedVisits, message: null };
      default:
        return { title: APPOINTMENTS_TEXT.noVisitsYet, message: APPOINTMENTS_TEXT.bookAVisitAndIt };
    }
  });

  constructor() {
    effect(() => {
      this.timing();
      this.dates();
      untracked(() => {
        this.visits.set(null);
        void this.load();
      });
    });
  }

  protected async load(next = false): Promise<void> {
    this.page = next ? this.page + 1 : 1;
    const timing = this.timing();
    const soonestFirst = timing === VisitTiming.Coming || timing === VisitTiming.Today;
    const page = await firstValueFrom(
      this.api.list(
        {
          page: this.page,
          perPage: PAGE_SIZE,
          sort: soonestFirst ? ['scheduledDate', 'startTime'] : ['-scheduledDate', '-startTime'],
          ...dateRangeQuery('scheduled_date', this.dates()),
        },
        timing,
      ),
    ).catch(() => null);
    const rows = page?.data ?? [];
    this.visits.update((list) => (next ? [...(list ?? []), ...rows] : rows));
    this.more.set(rows.length === PAGE_SIZE);
  }

  protected changed(updated: Appointment): void {
    this.visits.update((list) => (list ?? []).map((v) => (v.id === updated.id ? updated : v)));
  }
}
