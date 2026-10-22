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
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PharmacyActions } from '../../services/pharmacy-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Prescription } from '@shared/interfaces/pharmacy/prescription.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { PrescriptionApi } from '@shared/services/pharmacy/prescription-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';
import { percentOf } from '@shared/utils/quantity';

/**
 * `/pharmacy/prescriptions/:id` — the medicines with how much has been handed over, the hand-overs themselves, and
 * the next step: dispense, print, edit (nothing dispensed yet) or cancel what is left.
 */
@Component({
  selector: 'app-prescription-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    HasAccessDirective,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
    DatePipe,
    EnumLabelPipe,
    QtyPipe,
  ],
  templateUrl: './prescription-detail.page.html',
})
export class PrescriptionDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(PrescriptionApi);
  private readonly actions = inject(PharmacyActions);
  protected readonly prescription = signal<Prescription | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly cancelled = GenericStatus.Cancelled;

  private readonly open = computed(() =>
    [GenericStatus.Pending, GenericStatus.InProgress].includes(
      this.prescription()?.status as GenericStatus,
    ),
  );
  protected readonly expired = computed(
    () => (this.prescription()?.validUntil ?? '9999') < clinicIsoDate(),
  );
  protected readonly dispensable = computed(() => this.open() && !this.expired());
  protected readonly cancellable = computed(() => this.open());
  protected readonly editable = computed(
    () => this.prescription()?.status === GenericStatus.Pending,
  );

  protected readonly facts = computed<Fact[]>(() => {
    const p = this.prescription();
    if (!p) return [];
    return [
      { label: 'Patient', value: p.patient ? `${p.patient.fullName} · ${p.patient.code}` : null },
      { label: 'Doctor', value: p.doctor?.fullName },
      {
        label: 'Visit',
        value: p.appointment ? `${p.appointment.code} · ${p.appointment.scheduledDate}` : null,
      },
      { label: 'Treatment', value: p.treatment?.code },
      { label: 'Written', value: p.createdAt.slice(0, 10) },
      { label: 'Valid until', value: p.validUntil + (this.expired() ? ' (expired)' : '') },
      { label: 'Note to the pharmacist', value: p.notes },
      { label: 'Cancelled because', value: p.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.prescription.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }

  protected share(handed: string | null, prescribed: string): number {
    return percentOf(handed, prescribed);
  }

  protected readonly edit = async (): Promise<void> => {
    const p = this.prescription() as Prescription;
    if (await this.actions.prescribe({ prescription: p, patient: p.patient ?? null }))
      await this.load();
  };

  protected readonly cancel = async (): Promise<void> => {
    if (await this.actions.cancelPrescription(this.prescription() as Prescription))
      await this.load();
  };
}
