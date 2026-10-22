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
import { ExpiryChip } from '../../components/expiry-chip/expiry-chip.component';
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
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { MedicationBatch, StockMovement } from '@shared/interfaces/pharmacy/inventory.interface';
import { Medication } from '@shared/interfaces/pharmacy/medication.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { InventoryApi } from '@shared/services/pharmacy/inventory-api.service';
import { MedicationApi } from '@shared/services/pharmacy/medication-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { defaultQuery } from '@shared/utils/list-query';
import { formatMoney } from '@shared/utils/money';
import { compareQty } from '@shared/utils/quantity';

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
      { label: 'Generic name', value: m.genericName },
      { label: 'Brand', value: m.brandName },
      { label: 'Arabic name', value: m.nameAr },
      { label: 'Form', value: this.enums.label('MedicationForm', m.form) },
      { label: 'Strength', value: m.strength },
      { label: 'Counted in', value: this.enums.label('DispenseUnit', m.unit) },
      { label: 'Barcode (GTIN)', value: m.gtin, mono: true },
      { label: 'Manufacturer', value: m.manufacturer?.name },
      { label: 'Made in', value: m.originCountry?.name },
      { label: 'Price', value: m.price ? `${formatMoney(m.price)} per unit` : null },
      { label: 'VAT', value: m.taxRate !== undefined ? `${m.taxRate} %` : null },
      { label: 'Reorder level', value: m.reorderLevel },
      { label: 'Storage', value: m.storageNotes },
      { label: 'Indications', value: m.description },
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
  protected readonly quarantine = (lot: MedicationBatch): Promise<void> =>
    this.refresh(this.actions.quarantine(lot));

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Medication deleted.');
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
