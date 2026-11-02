import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ReceiveStockDialogData } from '@interfaces/pharmacy/receive-stock-dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CompanyType } from '@enums/reference/company-type.enum';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';
import { Medication } from '@interfaces/pharmacy/medication.interface';
import { Company } from '@interfaces/reference/company.interface';
import { EnumService } from '@services/data/enum.service';
import { InventoryApi } from '@services/pharmacy/inventory-api.service';
import { addDays, clinicIsoDate } from '@utilities/clinic-time';
import { divideHalfUp, formatAmount, toScaled } from '@utilities/money';
import { AppValidators } from '@validations/validators';

/**
 * Goods receipt of one lot: medicine, the maker's lot number and expiry, how many and at what cost, from which
 * supplier. Booking the purchase sends an expense for approval and payment by finance.
 */
@Component({
  selector: 'app-receive-stock-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    MoneyInput,
    TextField,
  ],
  templateUrl: './receive-stock-dialog.component.html',
})
export class ReceiveStockDialog {
  protected readonly data = inject<ReceiveStockDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ReceiveStockDialog, MedicationBatch>);
  private readonly api = inject(InventoryApi);
  private readonly key = newIdempotencyKey();

  protected readonly suppliers: FilterGroup = { and: [{ type: { eq: CompanyType.Supplier } }] };
  protected readonly companyName = (c: Company): string => c.name;
  protected readonly medicationName = (m: Medication): string => m.name;
  protected readonly medicationDetail = (m: Medication): string | null => m.code;
  protected readonly picked = signal<Medication | null>(this.data.medication);
  protected readonly tomorrow = addDays(clinicIsoDate(), 1);
  private readonly enums = inject(EnumService);
  protected readonly unitHint = computed(() => {
    const unit = this.picked()?.unit;
    return unit ? `Counted in ${this.enums.label('DispenseUnit', unit).toLowerCase()}` : null;
  });

  protected readonly form = new FormGroup({
    medicationId: new FormControl<string | null>(this.data.medication?.id ?? null, [
      Validators.required,
    ]),
    batchNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    expiryDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    quantity: new FormControl<string | null>(null, [
      Validators.required,
      AppValidators.quantity,
      AppValidators.positive,
    ]),
    unitCost: new FormControl<string | null>(null, [Validators.required, AppValidators.money]),
    supplierId: new FormControl<string | null>(null),
    createExpense: new FormControl(true, { nonNullable: true }),
    vendorInvoiceNumber: new FormControl<string | null>(null, [Validators.maxLength(100)]),
  });

  private readonly values = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  /** Quantity × unit cost, exact (hundredths × fils). */
  protected readonly total = computed(() => {
    const quantity = toScaled(this.values().quantity ?? null, 2);
    const cost = toScaled(this.values().unitCost ?? null, 3);
    return quantity === null || cost === null
      ? null
      : formatAmount(divideHalfUp(quantity * cost, 100n));
  });

  constructor() {
    this.form.controls.expiryDate.addValidators((c) =>
      c.value && c.value < this.tomorrow ? { afterToday: true } : null,
    );
  }

  protected readonly submit = async (): Promise<MedicationBatch> => {
    const v = this.form.getRawValue();
    const received = await firstValueFrom(
      this.api.receive(
        {
          medicationId: v.medicationId as string,
          batchNumber: v.batchNumber.trim(),
          expiryDate: v.expiryDate,
          quantity: String(v.quantity),
          unitCost: v.unitCost as string,
          supplierId: v.supplierId,
          createExpense: v.createExpense,
          vendorInvoiceNumber: v.createExpense ? v.vendorInvoiceNumber?.trim() || null : null,
        },
        this.key,
      ),
    );
    this.ref.close(received);
    return received;
  };
}
