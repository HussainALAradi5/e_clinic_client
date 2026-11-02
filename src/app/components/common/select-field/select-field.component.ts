import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { EnumService } from '@services/data/enum.service';
import { errorMessage } from '@validations/validators';

/**
 * `<ui-select label="Gender" enum="Gender" [control]="…" />` or `[options]="[{ value, label }]"`. Enums with colours
 * (statuses, priorities) show their badges in the list and in the field.
 */
@Component({
  selector: 'ui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, StatusChip],
  host: { class: 'block' },
  templateUrl: './select-field.component.html',
})
export class SelectField {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly enum = input<string | null>(null);
  readonly options = input<EnumOption[] | null>(null);
  readonly multiple = input(false);
  readonly required = input(false);
  readonly hint = input<string | null>(null);

  private readonly enums = inject(EnumService);
  protected readonly items = computed(
    () => this.options() ?? (this.enum() ? this.enums.options(this.enum()!) : []),
  );

  /** Enum values show as their coloured badges, the same as in lists. */
  protected readonly badges = computed(() => !!this.enum());
  /** Selected values, for the badge trigger. */
  protected selected(): string[] {
    const value = this.control().value as string | string[] | null;
    return value === null || value === undefined ? [] : Array.isArray(value) ? value : [value];
  }

  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  constructor() {
    this.enums.load().subscribe({ error: () => undefined });
  }
}
