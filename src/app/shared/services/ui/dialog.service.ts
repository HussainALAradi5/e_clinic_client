import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';
import { NotifyService } from './notify.service';

/**
 * Typed dialogs: confirm() → boolean, reason() → string | null, open() → the dialog's result,
 * openAction() → the result with a success message.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyService);

  async confirm(config: ConfirmConfig): Promise<boolean> {
    return (
      (await this.open<ConfirmDialog, ConfirmConfig, true>(ConfirmDialog, {
        ...config,
        reason: false,
      })) === true
    );
  }

  async reason(config: Omit<ConfirmConfig, 'reason'>): Promise<string | null> {
    const result = await this.open<ConfirmDialog, ConfirmConfig, string>(ConfirmDialog, {
      ...config,
      reason: true,
    });
    return typeof result === 'string' && result !== '' ? result : null;
  }

  /** Confirm or reason depending on the config; resolves to false/null when dismissed. */
  async ask(config: ConfirmConfig): Promise<{ confirmed: boolean; reason?: string }> {
    if (config.reason) {
      const reason = await this.reason(config);
      return { confirmed: reason !== null, reason: reason ?? undefined };
    }
    return { confirmed: await this.confirm(config) };
  }

  open<C, D, R>(
    component: ComponentType<C>,
    data: D,
    config: MatDialogConfig<D> = {},
  ): Promise<R | undefined> {
    const ref = this.dialog.open<C, D, R>(component, {
      width: '480px',
      maxWidth: '100vw',
      autoFocus: 'first-tabbable',
      ...config,
      data,
    });
    return firstValueFrom(ref.afterClosed());
  }

  /** A form dialog that saves something: opens it and, when it closes with a result, says what was done. */
  async openAction<C, D, R>(
    component: ComponentType<C>,
    data: D,
    success: (result: R) => string,
    width = '520px',
  ): Promise<R | undefined> {
    const result = await this.open<C, D, R>(component, data, { width });
    if (result) this.notify.success(success(result));
    return result;
  }
}
