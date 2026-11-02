import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { OTP_INPUT_TEXT } from '@constants/common/otp-input.constants';

/**
 * One-time code shown as separate digit boxes. One real input lies over the boxes, so typing, paste, browser
 * one-time-code autofill and screen readers behave as with a normal field.
 */
@Component({
  selector: 'ui-otp-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { class: 'block' },
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
})
export class OtpInput {
  readonly control = input.required<FormControl<string>>();
  readonly length = input(6);
  readonly label = input(OTP_INPUT_TEXT.verificationCode);
  readonly autofocus = input(true);

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly value = signal('');
  protected readonly focused = signal(false);
  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  constructor() {
    afterNextRender(() => {
      const control = this.control();
      control.valueChanges
        .pipe(startWith(control.value), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => this.value.set(value ?? ''));
      if (this.autofocus()) {
        this.field().nativeElement.focus();
      }
    });
  }

  /** Keeps digits only (typing letters or pasting "123 456" still works). */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = target.value.replace(/\D/g, '').slice(0, this.length());
    if (digits !== target.value) {
      this.control().setValue(digits);
    }
  }
}
