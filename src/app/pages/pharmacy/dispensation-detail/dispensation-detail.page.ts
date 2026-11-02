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
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { EnumService } from '@services/data/enum.service';
import { DispensationApi } from '@services/pharmacy/dispensation-api.service';
import { clinicDateTime, clinicIsoDate } from '@utilities/clinic-time';
import { fromMinor, toMinor } from '@utilities/money';
import { DISPENSATION_DETAIL_TEXT } from '@constants/pharmacy/dispensation-detail.constants';

/**
 * `/pharmacy/dispensations/:id` — what left stock for the patient, from which lots and at what price, the invoice it
 * is billed on, the label to print and (same day, still on a draft invoice) the return to stock.
 */
@Component({
  selector: 'app-dispensation-detail-page',
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
    MoneyPipe,
    QtyPipe,
  ],
  templateUrl: './dispensation-detail.page.html',
})
export class DispensationDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(DispensationApi);
  private readonly actions = inject(PharmacyActions);
  private readonly enums = inject(EnumService);
  protected readonly dispensation = signal<Dispensation | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;

  /** Same clinic day, still completed, and not on an issued invoice. */
  protected readonly returnable = computed(() => {
    const d = this.dispensation();
    return (
      !!d &&
      d.status === GenericStatus.Completed &&
      clinicIsoDate(new Date(d.dispensedAt)) === clinicIsoDate() &&
      (!d.invoice || d.invoice.status === InvoiceStatus.Draft)
    );
  });
  protected readonly total = computed(() =>
    fromMinor(
      (this.dispensation()?.items ?? []).reduce(
        (sum, i) => sum + (toMinor(i.lineTotal.amount) ?? 0n),
        0n,
      ),
    ),
  );

  protected readonly facts = computed<Fact[]>(() => {
    const d = this.dispensation();
    if (!d) return [];
    return [
      {
        label: DISPENSATION_DETAIL_TEXT.patient,
        value: d.patient ? `${d.patient.fullName} · ${d.patient.code}` : null,
      },
      { label: DISPENSATION_DETAIL_TEXT.kind, value: this.enums.label('DispensationKind', d.kind) },
      { label: DISPENSATION_DETAIL_TEXT.when, value: clinicDateTime(d.dispensedAt) },
      { label: DISPENSATION_DETAIL_TEXT.by, value: d.dispensedBy?.fullName },
      { label: DISPENSATION_DETAIL_TEXT.witness, value: d.witness?.fullName },
      { label: DISPENSATION_DETAIL_TEXT.notes, value: d.notes },
      { label: DISPENSATION_DETAIL_TEXT.returnedBecause, value: d.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.dispensation.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }

  protected readonly giveBack = async (): Promise<void> => {
    if (await this.actions.returnToStock(this.dispensation() as Dispensation)) await this.load();
  };
}
