import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';

/** Typed dialogs: confirm() → boolean, reason() → string | null, open() → the dialog's result. */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

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
}
