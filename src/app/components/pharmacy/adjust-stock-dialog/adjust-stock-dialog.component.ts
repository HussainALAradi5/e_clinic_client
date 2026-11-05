import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AdjustStockDialogData } from '@interfaces/pharmacy/adjust-stock-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { STOCK_ADJUSTMENT_APPROVAL_LIMIT } from '@constants/limits.constants';
import { ColleagueRight } from '@enums/pharmacy/colleague-right.enum';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { StockMovement } from '@interfaces/pharmacy/stock-movement.interface';
import { QtyPipe } from '@pipes/qty.pipe';
import { DispensationApi } from '@services/pharmacy/dispensation-api.service';
import { InventoryApi } from '@services/pharmacy/inventory-api.service';
import { compareQty } from '@utilities/quantity';
import { AppValidators } from '@validations/validators';
import { ADJUST_STOCK_DIALOG_TEXT } from '@constants/pharmacy/adjust-stock-dialog.constants';

/**
 * Stock-count correction of one lot: units missing / damaged or found, and why. Large corrections and controlled
 * drugs are approved by another pharmacist, named here.
 */
@Component({
  selector: 'app-adjust-stock-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    GenericForm,
    SelectField,
    TextField,
    QtyPipe,
  ],
  templateUrl: './adjust-stock-dialog.component.html',
})
export class AdjustStockDialog implements OnInit {
  protected readonly text = ADJUST_STOCK_DIALOG_TEXT;

  protected readonly data = inject<AdjustStockDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<AdjustStockDialog, StockMovement>);
  private readonly api = inject(InventoryApi);
  private readonly staff = inject(DispensationApi);

  protected readonly batch = this.data.batch;
  protected readonly direction = signal<'out' | 'in'>('out');
  protected readonly approvers = signal<EnumOption[]>([]);

  protected readonly form = new FormGroup({
    quantity: new FormControl<string | null>(null, [
      Validators.required,
      AppValidators.quantity,
      AppValidators.positive,
    ]),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    approvedBy: new FormControl<string | null>(null),
  });

  private readonly quantity = toSignal(this.form.controls.quantity.valueChanges, {
    initialValue: null,
  });
  /** Mirrors the server rule: controlled drugs, or more than the limit. */
  protected readonly needsApproval = computed(
    () =>
      !!this.batch.medication?.isControlled ||
      compareQty(this.quantity(), String(STOCK_ADJUSTMENT_APPROVAL_LIMIT)) > 0,
  );

  constructor() {
    this.form.controls.approvedBy.addValidators(
      AppValidators.requiredIf(() => this.needsApproval()),
    );
    this.form.controls.quantity.addValidators(
      AppValidators.maxQuantity(() => (this.direction() === 'out' ? this.batch.qtyOnHand : null)),
    );
  }

  async ngOnInit(): Promise<void> {
    const people = await firstValueFrom(this.staff.colleagues(ColleagueRight.Adjust)).catch(
      () => [],
    );
    this.approvers.set(people.map((p) => ({ value: p.id, label: p.fullName })));
  }

  protected setDirection(direction: 'out' | 'in'): void {
    this.direction.set(direction);
    this.form.controls.quantity.updateValueAndValidity();
  }

  protected readonly submit = async (): Promise<StockMovement> => {
    const v = this.form.getRawValue();
    const movement = await firstValueFrom(
      this.api.adjust(this.batch.id, {
        quantity: (this.direction() === 'out' ? '-' : '') + String(v.quantity),
        reason: v.reason.trim(),
        approvedBy: this.needsApproval() ? v.approvedBy : null,
      }),
    );
    this.ref.close(movement);
    return movement;
  };
}
