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
import { AppointmentActionsBar } from '@components/clinic/appointment-actions/appointment-actions.component';
import { BillingActions } from '@services/billing/billing-actions.service';
import { SessionMedicines } from '@components/pharmacy/session-medicines/session-medicines.component';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AuditLog } from '@interfaces/identity/audit-log.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { EnumService } from '@services/data/enum.service';
import { formatMoney } from '@utilities/money';
import { StatusStep } from '@interfaces/clinic/appointment-detail.interface';
import { APPOINTMENT_DETAIL_TEXT } from '@constants/clinic/appointment-detail.constants';

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
  protected readonly text = APPOINTMENT_DETAIL_TEXT;

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
      { label: APPOINTMENT_DETAIL_TEXT.type, value: this.enums.label('AppointmentType', a.type) },
      {
        label: APPOINTMENT_DETAIL_TEXT.room,
        value: a.room ? `${a.room.code} · ${a.room.name}` : null,
      },
      {
        label: APPOINTMENT_DETAIL_TEXT.bookedVia,
        value: this.enums.label('AppointmentSource', a.source),
      },
      {
        label: APPOINTMENT_DETAIL_TEXT.service,
        value: a.billableService
          ? `${a.billableService.name} · ${formatMoney(a.billableService.price)}`
          : null,
      },
      { label: APPOINTMENT_DETAIL_TEXT.reason, value: a.reason },
      { label: APPOINTMENT_DETAIL_TEXT.notes, value: a.notes },
      {
        label: APPOINTMENT_DETAIL_TEXT.cancelledBy,
        value: a.cancelledBy ? this.enums.label('CancelledBy', a.cancelledBy) : null,
      },
      { label: APPOINTMENT_DETAIL_TEXT.cancellationReason, value: a.cancellationReason },
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
