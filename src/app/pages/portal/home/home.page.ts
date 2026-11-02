import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VisitCard } from '@components/portal/visit-card/visit-card.component';
import { Glance } from '@interfaces/portal/glance.interface';
import { visitDay } from '@services/portal/portal-actions.service';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { PORTAL_PATH } from '@constants/app.constants';
import { PORTAL_MORE, PORTAL_TABS } from '@constants/portal.constants';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { GenericStatus, OPEN_GENERIC_STATUSES } from '@enums/shared/generic-status.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { Treatment } from '@interfaces/clinic/treatment.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { NavItem } from '@interfaces/ui/nav.interface';
import { AuthStore } from '@services/auth/auth.store';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { TreatmentApi } from '@services/clinic/treatment-api.service';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { clinicIsoDate, clinicTime } from '@utilities/clinic-time';
import { formatMoney, fromMinor, money, toMinor } from '@utilities/money';

const UPCOMING = [
  AppointmentStatus.Pending,
  AppointmentStatus.Confirmed,
  AppointmentStatus.CheckedIn,
];

const [TREATMENTS, PRESCRIPTIONS] = PORTAL_MORE;
const [, , RESULTS, INVOICES] = PORTAL_TABS;
const area = ({ label, icon, route }: NavItem): Pick<Glance, 'label' | 'icon' | 'route'> => ({
  label,
  icon,
  route,
});

/**
 * `/portal` — the next visit as a ticket with its check-in code, then one line per area with what is waiting:
 * open treatment, medicines to collect, the latest result, the balance to pay.
 */
@Component({
  selector: 'app-portal-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, VisitCard, Skeleton],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class PortalHomePage {
  private readonly auth = inject(AuthStore);
  private readonly appointments = inject(AppointmentApi);
  private readonly treatments = inject(TreatmentApi);
  private readonly orders = inject(ClinicalOrderApi);
  private readonly prescriptions = inject(PrescriptionApi);
  private readonly invoices = inject(InvoiceApi);

  protected readonly bookPath = `${PORTAL_PATH}/appointments/new`;
  protected readonly visitsPath = `${PORTAL_PATH}/appointments`;
  protected readonly greeting = computed(() => {
    const hour = Number(clinicTime().slice(0, 2));
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${part}, ${this.auth.user()?.firstName ?? ''}`;
  });

  protected readonly visits = signal<Appointment[] | null>(null);
  protected readonly next = computed(() => this.visits()?.[0] ?? null);
  protected readonly later = computed(() => (this.visits() ?? []).slice(1));
  protected readonly glances = signal<Glance[] | null>(null);

  constructor() {
    void this.load();
  }

  protected changed(): void {
    void this.loadVisits();
  }

  private async load(): Promise<void> {
    await Promise.all([this.loadVisits(), this.loadGlances()]);
  }

  private async loadVisits(): Promise<void> {
    const page = await firstValueFrom(
      this.appointments.list({
        perPage: 3,
        sort: ['scheduledDate', 'startTime'],
        filter: {
          and: [{ status: { in: UPCOMING } }, { scheduledDate: { gte: clinicIsoDate() } }],
        },
      }),
    ).catch(() => null);
    this.visits.set(page?.data ?? []);
  }

  private async loadGlances(): Promise<void> {
    const [treatments, prescriptions, results, invoices] = await Promise.all([
      firstValueFrom(
        this.treatments.list({
          perPage: 1,
          filter: { and: [{ status: { in: [...OPEN_GENERIC_STATUSES] } }] },
        }),
      ).catch(() => null),
      firstValueFrom(
        this.prescriptions.list({
          perPage: 20,
          filter: { and: [{ status: { in: [...OPEN_GENERIC_STATUSES] } }] },
        }),
      ).catch(() => null),
      firstValueFrom(
        this.orders.list({
          perPage: 1,
          sort: ['-completedAt'],
          filter: { and: [{ status: { eq: GenericStatus.Completed } }] },
        }),
      ).catch(() => null),
      firstValueFrom(
        this.invoices.list({
          perPage: 50,
          filter: {
            and: [{ status: { in: [InvoiceStatus.Issued, InvoiceStatus.PartiallyPaid] } }],
          },
        }),
      ).catch(() => null),
    ]);
    const due = (invoices?.data ?? []).reduce(
      (sum, i) => sum + (toMinor(i.balanceDue.amount) ?? 0n),
      0n,
    );
    this.glances.set([
      { ...area(TREATMENTS), ...this.treatmentLine(treatments?.data[0]) },
      { ...area(PRESCRIPTIONS), ...this.prescriptionLine(prescriptions?.data ?? []) },
      { ...area(RESULTS), ...this.resultLine(results?.data[0]) },
      {
        ...area(INVOICES),
        detail: due > 0n ? `${formatMoney(money(fromMinor(due)))} to pay` : 'Nothing to pay',
        flag: due > 0n,
      },
    ]);
  }

  private treatmentLine(t: Treatment | undefined): Pick<Glance, 'detail' | 'flag'> {
    if (!t) return { detail: 'No treatment plan running', flag: false };
    const next = t.progress?.nextSession;
    const done = `${t.progress?.attendedSessions ?? 0} of ${t.plannedSessions} sessions`;
    return {
      detail: next
        ? `${t.title}: next ${visitDay(next.scheduledDate)}, ${next.startTime}`
        : `${t.title}: ${done}`,
      flag: false,
    };
  }

  private prescriptionLine(list: Prescription[]): Pick<Glance, 'detail' | 'flag'> {
    return list.length
      ? { detail: `${list.length} to collect at the pharmacy`, flag: true }
      : { detail: 'Nothing to collect', flag: false };
  }

  private resultLine(o: ClinicalOrder | undefined): Pick<Glance, 'detail' | 'flag'> {
    return o
      ? {
          detail: `${o.description}${o.completedAt ? ', ' + visitDay(o.completedAt.slice(0, 10)) : ''}`,
          flag: false,
        }
      : { detail: 'No results yet', flag: false };
  }
}
