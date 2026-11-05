import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionState } from '@enums/ui/action-state.enum';
import { AccessMode } from '@enums/ui/access-mode.enum';
import { ButtonSize } from '@enums/ui/button-size.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { LockMode } from '@enums/ui/lock-mode.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { ActionResult } from '@interfaces/ui/action.interface';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { AccessService } from '@services/auth/access.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { ActionLock, CANCELLED, minDuration, toPromise } from '@utilities/action-lock';
import { APP_BUTTON_TEXT } from '@constants/common/app-button.constants';

/**
 * The only button in the app. Disables itself on click until the action settles (no double submit), shows a spinner
 * (≥ 300 ms), a success tick, and maps errors to a toast. Optional confirm / reason dialog and permission expression.
 *
 * <ui-button [action]="issue" lock="once" access="invoices.write & invoices.issue"
 *            [confirm]="{ title: 'Issue invoice?' }">Issue</ui-button>
 */
@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  host: {
    class: 'inline-flex',
    '[class.hidden]': '!visible()',
    '[class.w-full]': 'block()',
    '[attr.aria-busy]': 'lock.busy()',
  },
  templateUrl: './app-button.component.html',
  styleUrl: './app-button.component.scss',
})
export class AppButton {
  protected readonly text = APP_BUTTON_TEXT;

  /** Called on click; may return an Observable / Promise. Receives the reason when `confirm.reason` is set. */
  readonly action = input<((reason?: string) => ActionResult) | null>(null);
  readonly lockMode = input<LockMode | `${LockMode}`>(LockMode.UntilDone, { alias: 'lock' });
  readonly confirm = input<ConfirmConfig | null>(null);
  readonly access = input<string | null>(null);
  readonly accessMode = input<AccessMode | `${AccessMode}`>(AccessMode.Hide);
  readonly variant = input<ButtonVariant | `${ButtonVariant}`>(ButtonVariant.Filled);
  readonly size = input<ButtonSize | `${ButtonSize}`>(ButtonSize.Medium);
  readonly icon = input<string | null>(null);
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  /** Full width (e.g. the sign-in button). */
  readonly block = input(false);
  /** Set when the parent handles errors itself (failed output). */
  readonly silentErrors = input(false);

  readonly done = output<unknown>();
  readonly failed = output<ApiError | unknown>();

  protected readonly lock = new ActionLock();
  protected readonly states = ActionState;
  protected readonly variants = ButtonVariant;
  protected readonly sizes = ButtonSize;
  private readonly accessService = inject(AccessService);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  /** Actions often navigate away; outputs must not fire after the button is gone. */
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
  }

  protected readonly allowed = this.accessService.canSignal(() => this.access());
  protected readonly visible = computed(
    () => this.allowed() || this.accessMode() === AccessMode.Disable,
  );
  /** Busy buttons stay enabled-looking (ui-busy blocks clicks); only finished `once` locks disable. */
  protected readonly isDisabled = computed(
    () => this.disabled() || !this.allowed() || (!this.lock.accepting() && !this.lock.busy()),
  );
  protected readonly appearance = computed(() => {
    const variant = this.variant();
    return variant === ButtonVariant.Danger ? ButtonVariant.Filled : variant;
  });

  protected async run(event: Event): Promise<void> {
    const action = this.action();
    if (!action) {
      return; // plain / submit button: the form handles it
    }
    event.preventDefault();

    try {
      const result = await this.lock.run(async () => {
        const confirm = this.confirm();
        let reason: string | undefined;
        if (confirm) {
          const answer = await this.dialogs.ask(confirm);
          if (!answer.confirmed) {
            return CANCELLED;
          }
          reason = answer.reason;
        }
        return minDuration(toPromise(action(reason)));
      }, this.lockMode());

      if (result !== undefined || this.lock.state() !== ActionState.Idle) {
        if (!this.destroyed) {
          this.done.emit(result);
        }
      }
    } catch (error) {
      if (!this.destroyed) {
        this.failed.emit(error);
      }
      if (!this.silentErrors()) {
        this.notify.error(error);
      }
    }
  }

  /** Re-enable a `once` button (e.g. after the record was reloaded). */
  reset(): void {
    this.lock.reset();
  }
}
