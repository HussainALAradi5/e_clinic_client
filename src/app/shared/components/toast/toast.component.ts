import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TOAST_STYLES } from '@shared/constants/toast.constants';
import { ToastData } from '@shared/interfaces/ui/toast.interface';

/** Toast body opened by NotifyService: coloured icon, title, message, optional action / reference, countdown. */
@Component({
  selector: 'ui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  host: { '[class]': "'toast toast-' + data.type" },
  templateUrl: './toast.component.html',
})
export class Toast {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  protected readonly ref = inject(MatSnackBarRef);
  protected readonly icon = TOAST_STYLES[this.data.type].icon;
}
