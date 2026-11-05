import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TOAST_STYLES } from '@constants/toast.constants';
import { ToastData } from '@interfaces/ui/toast.interface';
import { TOAST_TEXT } from '@constants/common/toast.constants';

/** Toast body opened by NotifyService: coloured icon, title, message, optional action, countdown. */
@Component({
  selector: 'ui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  host: { '[class]': "'toast toast-' + data.type" },
  templateUrl: './toast.component.html',
})
export class Toast {
  protected readonly text = TOAST_TEXT;

  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  protected readonly ref = inject(MatSnackBarRef);
  protected readonly icon = TOAST_STYLES[this.data.type].icon;
}
