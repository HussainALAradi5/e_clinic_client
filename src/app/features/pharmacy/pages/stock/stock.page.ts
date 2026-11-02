import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyActions } from '../../services/pharmacy-actions.service';
import { ExpiryChip } from '../../components/expiry-chip/expiry-chip.component';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { MedicationBatch } from '@shared/interfaces/pharmacy/inventory.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { defaultQuery } from '@shared/utils/list-query';

/** `/pharmacy/stock` — lots on the shelf, first expiry first, with value; receive a delivery from here. */
@Component({
  selector: 'app-stock-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    ExpiryChip,
    StatusChip,
    MoneyPipe,
    QtyPipe,
    DatePipe,
  ],
  templateUrl: './stock.page.html',
})
export class StockPage {
  private readonly actions = inject(PharmacyActions);
  protected readonly dateFormat = DATE_FORMAT;
  /** Lots still holding stock, the soonest expiry first. */
  protected readonly defaults = defaultQuery({
    sort: ['expiryDate'],
    filter: { and: [{ qtyOnHand: { gt: 0 } }] },
  });

  private readonly router = inject(Router);

  protected readonly receive = async (): Promise<void> => {
    await this.actions.receive();
  };

  /** A lot opens its medication (lots, corrections and quarantine live there). */
  protected open(lot: MedicationBatch): void {
    void this.router.navigate(['/pharmacy/medications', lot.medicationId]);
  }
}
