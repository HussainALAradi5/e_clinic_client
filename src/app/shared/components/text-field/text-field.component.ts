import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { errorMessage } from '@shared/utils/validators';

/** `<ui-text label="First name" [control]="form.controls.firstName" />` — label, hint, error and counter wired once. */
@Component({
  selector: 'ui-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  host: { class: 'block' },
  templateUrl: './text-field.component.html',
})
export class TextField {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly type = input<'text' | 'email' | 'number' | 'password' | 'tel' | 'date' | 'time'>('text');
  readonly hint = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly multiline = input(false);
  readonly rows = input(3);
  readonly autocomplete = input<string | null>(null);

  /** Evaluated during change detection; MatFormField marks the view for check on every state change. */
  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  protected length(): number {
    return String(this.control().value ?? '').length;
  }
}
