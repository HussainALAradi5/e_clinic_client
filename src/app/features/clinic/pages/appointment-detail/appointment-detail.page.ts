import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentActionsBar } from '../../components/appointment-actions/appointment-actions.component';
import { BillingActions } from '../../../billing/services/billing-actions.service';
import { SessionMedicines } from '../../../pharmacy/components/session-medicines/session-medicines.component';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { AuditLog } from '@shared/interfaces/identity/audit-log.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AppointmentApi } from '@shared/services/clinic/appointment-api.service';
import { EnumService } from '@shared/services/data/enum.service';
import { formatMoney } from '@shared/utils/money';

/** One step of the status trail. */
interface StatusStep {
  status: string;
  at: string;
  by: string | null;
}

/** `/clinic/appointments/:id` — who, when, where; the next status actions; the status trail. */
@Component({
  selector: 'app-appointment-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HasAccessDirective,
    PageHeader,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AppointmentActionsBar,
    SessionMedicines,
    AppButton,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    DatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './appointment-detail.page.html',
})
export class AppointmentDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(AppointmentApi);
  private readonly enums = inject(EnumService);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly trail = signal<StatusStep[]>([]);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;

  /** A visit gets its note from check-in on. */
  protected readonly documentable = computed(() =>
    [
      AppointmentStatus.CheckedIn,
      AppointmentStatus.InProgress,
      AppointmentStatus.Completed,
    ].includes(this.appointment()?.status as AppointmentStatus),
  );
  /** Medicines are prescribed and given from check-in on. */
  protected readonly medicable = this.documentable;
  /** Checked in or in progress: medicines can be given now. */
  protected readonly running = computed(() =>
    [AppointmentStatus.CheckedIn, AppointmentStatus.InProgress].includes(
      this.appointment()?.status as AppointmentStatus,
    ),
  );
  /** Pay-before-consultation: a visit with a price can be billed from check-in on (once). */
  protected readonly billable = computed(
    () =>
      this.documentable() && !!this.appointment()?.billableService && !this.appointment()?.invoice,
  );
  protected readonly variants = ButtonVariant;
  private readonly billing = inject(BillingActions);

  protected readonly bill = async (): Promise<void> => {
    await this.billing.charge({ sourceType: 'appointment', sourceId: this.id() });
  };

  protected readonly facts = computed<Fact[]>(() => {
    const a = this.appointment();
    if (!a) return [];
    return [
      { label: 'Type', value: this.enums.label('AppointmentType', a.type) },
      { label: 'Room', value: a.room ? `${a.room.code} · ${a.room.name}` : null },
      { label: 'Booked via', value: this.enums.label('AppointmentSource', a.source) },
      {
        label: 'Service',
        value: a.billableService
          ? `${a.billableService.name} · ${formatMoney(a.billableService.price)}`
          : null,
      },
      { label: 'Reason', value: a.reason },
      { label: 'Notes', value: a.notes },
      {
        label: 'Cancelled by',
        value: a.cancelledBy ? this.enums.label('CancelledBy', a.cancelledBy) : null,
      },
      { label: 'Cancellation reason', value: a.cancellationReason },
    ].filter((fact) => fact.label === 'Room' || (fact.value !== null && fact.value !== undefined));
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.appointment.set(await firstValueFrom(this.api.get(this.id())));
      await this.loadTrail();
    } catch (error) {
      this.error.set(error);
    }
  }

  protected async changed(updated: Appointment): Promise<void> {
    this.appointment.set(updated);
    await this.loadTrail();
  }

  private async loadTrail(): Promise<void> {
    const logs = await firstValueFrom(this.api.history(this.id())).catch((): AuditLog[] => []);
    this.trail.set(
      logs
        .map((log) => ({
          status: String(log.newValues?.['status'] ?? ''),
          at: log.createdAt,
          by: log.user?.fullName ?? null,
        }))
        .reverse(),
    );
  }
}
