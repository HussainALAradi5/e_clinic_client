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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ExpiryChip } from '@components/pharmacy/expiry-chip/expiry-chip.component';
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
import { ButtonVariant } from '@enums/ui/button.enum';
import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';
import { StockMovement } from '@interfaces/pharmacy/stock-movement.interface';
import { Medication } from '@interfaces/pharmacy/medication.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { InventoryApi } from '@services/pharmacy/inventory-api.service';
import { MedicationApi } from '@services/pharmacy/medication-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { defaultQuery } from '@utilities/list-query';
import { formatMoney } from '@utilities/money';
import { compareQty } from '@utilities/quantity';
import { MEDICATION_DETAIL_TEXT } from '@constants/pharmacy/medication-detail.constants';

/**
 * `/pharmacy/medications/:id` — the medication card, its stock lot by lot (correct a count, quarantine a lot,
 * receive a delivery), the latest stock movements and the change history.
 */
@Component({
  selector: 'app-medication-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    ExpiryChip,
    AuditHistory,
    HasAccessDirective,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    DatePipe,
    EnumLabelPipe,
    MoneyPipe,
    QtyPipe,
  ],
  templateUrl: './medication-detail.page.html',
})
export class MedicationDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(MedicationApi);
  private readonly inventory = inject(InventoryApi);
  private readonly actions = inject(PharmacyActions);
  private readonly enums = inject(EnumService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  protected readonly detail = new EntityDetail(this.api);

  protected readonly lots = signal<MedicationBatch[] | null>(null);
  protected readonly movements = signal<StockMovement[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  /** Lots still holding stock first (soonest expiry first); emptied ones below, dimmed. */
  protected readonly orderedLots = computed(() => {
    const lots = this.lots() ?? [];
    return [...lots.filter((l) => !this.isEmpty(l)), ...lots.filter((l) => this.isEmpty(l))];
  });

  protected readonly facts = computed<Fact[]>(() => {
    const m = this.detail.record();
    if (!m) return [];
    return [
      { label: MEDICATION_DETAIL_TEXT.genericName, value: m.genericName },
      { label: MEDICATION_DETAIL_TEXT.brand, value: m.brandName },
      { label: MEDICATION_DETAIL_TEXT.arabicName, value: m.nameAr },
      { label: MEDICATION_DETAIL_TEXT.form, value: this.enums.label('MedicationForm', m.form) },
      { label: MEDICATION_DETAIL_TEXT.strength, value: m.strength },
      { label: MEDICATION_DETAIL_TEXT.countedIn, value: this.enums.label('DispenseUnit', m.unit) },
      { label: MEDICATION_DETAIL_TEXT.barcodeGtin, value: m.gtin, mono: true },
      { label: MEDICATION_DETAIL_TEXT.manufacturer, value: m.manufacturer?.name },
      { label: MEDICATION_DETAIL_TEXT.madeIn, value: m.originCountry?.name },
      {
        label: MEDICATION_DETAIL_TEXT.price,
        value: m.price ? `${formatMoney(m.price)} per unit` : null,
      },
      { label: 'VAT', value: m.taxRate !== undefined ? `${m.taxRate} %` : null },
      { label: MEDICATION_DETAIL_TEXT.reorderLevel, value: m.reorderLevel },
      { label: MEDICATION_DETAIL_TEXT.storage, value: m.storageNotes },
      { label: MEDICATION_DETAIL_TEXT.indications, value: m.description },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  async ngOnInit(): Promise<void> {
    await this.detail.load(this.id());
    await this.loadStock();
  }

  protected async loadStock(): Promise<void> {
    const filter = { and: [{ medicationId: { eq: this.id() } }] };
    const [lots, movements] = await Promise.all([
      firstValueFrom(
        this.inventory.stock(defaultQuery({ perPage: 100, sort: ['expiryDate'], filter })),
      ).catch(() => null),
      firstValueFrom(
        this.inventory.movements(defaultQuery({ perPage: 15, sort: ['-createdAt'], filter })),
      ).catch(() => null),
    ]);
    this.lots.set(lots?.data ?? []);
    this.movements.set(movements?.data ?? []);
  }

  protected readonly edit = (): Promise<void> =>
    this.refresh(this.actions.editMedication(this.record()));
  protected readonly archive = (): Promise<void> =>
    this.refresh(this.actions.archiveMedication(this.record()));
  protected readonly unarchive = (): Promise<void> =>
    this.refresh(this.actions.unarchiveMedication(this.record()));
  protected readonly receive = (): Promise<void> =>
    this.refresh(this.actions.receive(this.record()));
  protected readonly adjust = (lot: MedicationBatch): Promise<void> =>
    this.refresh(this.actions.adjust(lot));
  protected readonly transfer = (lot: MedicationBatch): Promise<void> =>
    this.refresh(this.actions.transfer(lot));
  /** What can be dispensed from the pharmacy (all usable stock minus the treatment room's). */
  protected readonly pharmacyStock = computed(() => {
    const m = this.record();
    return String(Number(m.stockOnHand ?? 0) - Number(m.stockTreatmentRoom ?? 0));
  });
  protected readonly quarantine = (lot: MedicationBatch): Promise<void> =>
    this.refresh(this.actions.quarantine(lot));

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(MEDICATION_DETAIL_TEXT.medicationDeleted);
    await this.router.navigateByUrl('/pharmacy/medications');
  };

  protected isEmpty(lot: MedicationBatch): boolean {
    return compareQty(lot.qtyOnHand, '0') === 0;
  }

  private record(): Medication {
    return this.detail.record() as Medication;
  }

  private async refresh(action: Promise<unknown>): Promise<void> {
    if (await action) {
      await this.detail.load(this.id());
      await this.loadStock();
    }
  }
}
