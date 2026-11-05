import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TransferStockDialogData } from '@interfaces/pharmacy/transfer-stock-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { StockLocation } from '@enums/pharmacy/stock-location.enum';
import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';
import { QtyPipe } from '@pipes/qty.pipe';
import { InventoryApi } from '@services/pharmacy/inventory-api.service';
import { compareQty } from '@utilities/quantity';
import { AppValidators } from '@validations/validators';
import { TRANSFER_STOCK_DIALOG_TEXT } from '@constants/pharmacy/transfer-stock-dialog.constants';

/**
 * Moves units of one lot to the other place: from the pharmacy to the treatment room (ward stock the nurses give in
 * sessions), or back. The same batch and expiry there; both lots get a `transfer` line in the ledger.
 */
@Component({
  selector: 'app-transfer-stock-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, StatusChip, TextField, QtyPipe],
  templateUrl: './transfer-stock-dialog.component.html',
})
export class TransferStockDialog {
  protected readonly text = TRANSFER_STOCK_DIALOG_TEXT;

  protected readonly data = inject<TransferStockDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<TransferStockDialog, MedicationBatch>);
  private readonly api = inject(InventoryApi);

  protected readonly batch = this.data.batch;
  protected readonly to =
    this.batch.location === StockLocation.Pharmacy
      ? StockLocation.TreatmentRoom
      : StockLocation.Pharmacy;

  protected readonly form = new FormGroup({
    quantity: new FormControl<string | null>(null, [
      Validators.required,
      AppValidators.quantity,
      AppValidators.positive,
      (c) =>
        compareQty(c.value, this.batch.qtyOnHand) > 0
          ? { max: { max: this.batch.qtyOnHand } }
          : null,
    ]),
    reason: new FormControl<string | null>(null, [Validators.maxLength(255)]),
  });

  protected readonly submit = async (): Promise<MedicationBatch> => {
    const v = this.form.getRawValue();
    const moved = await firstValueFrom(
      this.api.transfer(this.batch.id, {
        quantity: String(v.quantity),
        to: this.to,
        reason: v.reason?.trim() || null,
      }),
    );
    this.ref.close(moved);
    return moved;
  };
}
