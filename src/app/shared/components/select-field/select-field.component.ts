import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EnumOption } from '@shared/interfaces/common/enum-meta.interface';
import { EnumService } from '@shared/services/data/enum.service';
import { errorMessage } from '@shared/utils/validators';

/** `<ui-select label="Gender" enum="Gender" [control]="…" />` or `[options]="[{ value, label }]"`. */
@Component({
  selector: 'ui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
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

  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  constructor() {
    this.enums.load().subscribe({ error: () => undefined });
  }
}
