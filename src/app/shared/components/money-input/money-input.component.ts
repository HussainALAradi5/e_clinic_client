import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Currency } from '@shared/enums/shared/currency.enum';
import { normaliseAmount } from '@shared/utils/money';
import { errorMessage } from '@shared/utils/validators';

/** `<ui-money label="Price" [control]="form.controls.price" />` — 3-decimal BHD string, never a float. */
@Component({
  selector: 'ui-money',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  host: { class: 'block' },
  templateUrl: './money-input.component.html',
})
export class MoneyInput {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();
  readonly currency = input<Currency | `${Currency}`>(Currency.BHD);
  readonly hint = input<string | null>(null);

  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  protected normalise(): void {
    const value = this.control().value;
    const normalised = value ? normaliseAmount(value) : null;
    if (normalised && normalised !== value) {
      this.control().setValue(normalised);
    }
  }
}
