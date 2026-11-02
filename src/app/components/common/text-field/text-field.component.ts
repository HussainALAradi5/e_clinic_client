import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { errorMessage } from '@validations/validators';

/**
 * `<ui-text label="First name" [control]="form.controls.firstName" />` — label, hint, error and counter wired once.
 * `type="date"` opens the clinic calendar (value stays an ISO date, typing 22/10/2026 works too).
 */
@Component({
  selector: 'ui-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
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
  /** Leading icon (e.g. `mail`, `lock`). */
  readonly icon = input<string | null>(null);

  /** Focus this field when the page opens (first field of a sign-in form). */
  readonly autofocus = input(false);

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) {
        this.field()?.nativeElement.focus();
      }
    });
  }

  /** Password fields get a show / hide toggle. */
  protected readonly revealed = signal(false);
  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type(),
  );

  /** Evaluated during change detection; MatFormField marks the view for check on every state change. */
  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  protected length(): number {
    return String(this.control().value ?? '').length;
  }
}
