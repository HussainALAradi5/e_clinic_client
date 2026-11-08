import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NUMBER_FIELD_DEFAULTS, NUMBER_FIELD_TEXT } from '@constants/common/number-field.constants';
import { NumberFieldOptions } from '@interfaces/ui/number-field-options.interface';
import { normaliseNumber, sanitizeNumber, stepNumber } from '@utilities/number-field';
import { errorMessage } from '@validations/validators';

/**
 * `<ui-number label="Quantity" [control]="form.controls.quantity" />` — minus and plus buttons around a box that takes
 * numbers only and never goes below `min` (0 by default). The value is a string, never a float. Without a control,
 * use `[value]` and `(valueChange)` (table filters and cells); it reports when a step or blur settles the value.
 */
@Component({
  selector: 'ui-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  host: { class: 'block w-full max-w-52' },
  templateUrl: './number-field.component.html',
})
export class NumberField {
  protected readonly text = NUMBER_FIELD_TEXT;

  readonly label = input.required<string>();
  readonly control = input<FormControl<string | null> | null>(null);
  readonly value = input<string | number | null>(null);
  readonly min = input(NUMBER_FIELD_DEFAULTS.min);
  readonly max = input<number | null>(null);
  readonly step = input(NUMBER_FIELD_DEFAULTS.step);
  readonly decimals = input(NUMBER_FIELD_DEFAULTS.decimals);
  /** Text before the number, e.g. `BHD`. */
  readonly prefix = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly subscript = input<'fixed' | 'dynamic'>('fixed');

  readonly valueChange = output<string | null>();

  private readonly own = new FormControl<string | null>(null);
  /** The last value reported, so tabbing through an unchanged field reports nothing. */
  private settled: string | null = null;
  protected readonly field = computed(() => this.control() ?? this.own);
  private readonly options = computed<NumberFieldOptions>(() => ({
    min: this.min(),
    max: this.max(),
    step: this.step(),
    decimals: this.decimals(),
  }));

  constructor() {
    effect(() => {
      const raw = this.value();
      const value = raw === null || raw === undefined || raw === '' ? null : String(raw);
      untracked(() => {
        this.own.setValue(value, { emitEvent: false });
        this.settled = normaliseNumber(value, this.options());
      });
    });
  }

  protected error(): string | null {
    return errorMessage(this.field().errors, this.label());
  }

  protected canDecrease(): boolean {
    const field = this.field();
    return field.enabled && !!field.value && Number(field.value) > this.min();
  }

  protected canIncrease(): boolean {
    const field = this.field();
    const max = this.max();
    return field.enabled && (max === null || Number(field.value ?? this.min()) < max);
  }

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const clean = sanitizeNumber(element.value, this.decimals());
    if (clean !== element.value) {
      element.value = clean;
      this.field().setValue(clean || null);
    }
  }

  protected change(direction: 1 | -1): void {
    this.apply(stepNumber(this.field().value, direction, this.options()));
  }

  protected onArrow(event: Event, direction: 1 | -1): void {
    event.preventDefault();
    if (direction === 1 ? this.canIncrease() : this.canDecrease()) {
      this.change(direction);
    }
  }

  protected settle(): void {
    this.apply(normaliseNumber(this.field().value, this.options()));
  }

  private apply(value: string | null): void {
    const field = this.field();
    if (value !== field.value) {
      field.setValue(value);
      field.markAsDirty();
    }
    if (value !== this.settled) {
      this.settled = value;
      this.valueChange.emit(value);
    }
  }
}
