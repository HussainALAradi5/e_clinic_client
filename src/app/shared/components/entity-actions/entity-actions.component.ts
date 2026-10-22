import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ActionResult } from '@shared/interfaces/ui/action.interface';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';

/**
 * Standard header actions of a GenericEntity detail page: Edit · Archive / Unarchive · Delete, or Restore when
 * deleted, plus Archived / Deleted chips. Buttons follow `<resource>.write` / `<resource>.delete`.
 * `<ui-entity-actions actions resource="rooms" noun="room" [record]="room" [edit]="edit" … />`
 */
@Component({
  selector: 'ui-entity-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton],
  host: { class: 'flex flex-wrap items-center gap-2' },
  templateUrl: './entity-actions.component.html',
})
export class EntityActions {
  readonly record = input.required<GenericEntity>();
  /** Permission prefix, e.g. `rooms`. */
  readonly resource = input.required<string>();
  /** Word used in messages, e.g. `room`. */
  readonly noun = input.required<string>();
  readonly edit = input<(() => ActionResult) | null>(null);
  readonly archive = input<(() => ActionResult) | null>(null);
  readonly unarchive = input<(() => ActionResult) | null>(null);
  readonly remove = input<(() => ActionResult) | null>(null);
  readonly restore = input<(() => ActionResult) | null>(null);
  /** Why deleting is not possible (shown as a disabled button), e.g. "In use — archive instead". */
  readonly deleteBlocked = input(false);

  protected readonly variants = ButtonVariant;
  protected readonly deleteConfirm = computed<ConfirmConfig>(() => ({
    title: `Delete this ${this.noun()}?`,
    message: 'It can be restored later from the deleted records list.',
    confirmLabel: 'Delete',
    danger: true,
  }));
}
