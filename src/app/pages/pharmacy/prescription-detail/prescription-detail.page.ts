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
import { PharmacyActions } from '@services/pharmacy/pharmacy-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { GenericStatus, isOpenGenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { percentOf } from '@utilities/quantity';

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

  private readonly open = computed(() => isOpenGenericStatus(this.prescription()?.status));
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
