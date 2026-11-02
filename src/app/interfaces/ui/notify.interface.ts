import { MatSnackBar } from '@angular/material/snack-bar';
import { Toast } from '@components/common/toast/toast.component';

export /** Snack bar + toast component, downloaded on the first toast so they stay out of the start-up bundle. */
interface ToastKit {
  snackBar: MatSnackBar;
  component: typeof Toast;
}
