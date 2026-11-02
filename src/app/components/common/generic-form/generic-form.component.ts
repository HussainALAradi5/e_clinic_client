import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ActionResult } from '@interfaces/ui/action.interface';
import { HasUnsavedChanges } from '@interfaces/ui/unsaved-changes.interface';
import { NotifyService } from '@services/ui/notify.service';
import { toPromise } from '@utilities/action-lock';
import { applyServerErrors } from '@utilities/server-errors';

/** Thrown to stop the submit button without a toast (client-side invalid form). */
const INVALID = Symbol('invalid');

/**
 * Form shell: projected sections (Tailwind grid), sticky footer with a locking submit AppButton, server 422 mapping,
 * Ctrl+S, focus on the first error, dirty tracking for unsavedChangesGuard.
 *
 * <ui-form [form]="form" [submit]="save" submitLabel="Save patient"> … fields … </ui-form>
 */
@Component({
  selector: 'ui-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppButton, MatButtonModule],
  host: {
    class: 'block',
    '(keydown.control.s)': 'shortcutSave($event)',
    '(keydown.meta.s)': 'shortcutSave($event)',
  },
  templateUrl: './generic-form.component.html',
})
export class GenericForm<T = unknown> implements HasUnsavedChanges {
  readonly form = input.required<FormGroup>();
  readonly submit = input.required<(value: T) => ActionResult>();
  readonly submitLabel = input('Save');
  readonly cancelLabel = input<string | null>('Cancel');
  readonly lock = input<'until-done' | 'once'>('until-done');
  /** Allow submitting an untouched form (e.g. confirmation forms). */
  readonly allowPristine = input(false);
  /** Dialogs and auth cards: a plain footer instead of the sticky page footer. */
  readonly compact = input(false);
  /** Full-width submit button without the footer bar (sign-in style forms). */
  readonly block = input(false);
  readonly submitIcon = input<string | null>(null);
  /** Access expression for the submit button (hidden without it — read-only view). */
  readonly access = input<string | null>(null);

  readonly saved = output<unknown>();
  readonly cancelled = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly notify = inject(NotifyService);
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
  }

  protected readonly run = async (): Promise<unknown> => {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      this.focusFirstError();
      throw INVALID;
    }
    const result = await toPromise(this.submit()(form.getRawValue() as T));
    form.markAsPristine();
    if (!this.destroyed) {
      this.saved.emit(result);
    }
    return result;
  };

  hasUnsavedChanges(): boolean {
    return this.form().dirty;
  }

  /** Enter / Ctrl+S (and auto-submitting fields) go through the same locking button, so a form can never be sent twice. */
  requestSubmit(): void {
    this.host.nativeElement.querySelector<HTMLButtonElement>('footer ui-button button')?.click();
  }

  protected shortcutSave(event: Event): void {
    event.preventDefault();
    this.requestSubmit();
  }

  protected onFailed(error: unknown): void {
    if (error === INVALID) {
      return;
    }
    const unmatched = applyServerErrors(this.form(), error);
    if (unmatched.length || !(error as { errors?: unknown })?.errors) {
      this.notify.error(error);
    }
    this.focusFirstError();
  }

  private focusFirstError(): void {
    setTimeout(() => {
      const invalid = this.host.nativeElement.querySelector<HTMLElement>(
        '.ng-invalid:not(form) input, .ng-invalid:not(form) textarea, mat-select.ng-invalid, input.ng-invalid, textarea.ng-invalid',
      );
      invalid?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      invalid?.focus();
    });
  }
}
