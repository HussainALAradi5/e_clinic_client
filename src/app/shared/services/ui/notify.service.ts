import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable } from 'rxjs';
import { Toast } from '@shared/components/toast/toast.component';
import { TOAST_STYLES } from '@shared/constants/toast.constants';
import { ToastType } from '@shared/enums/ui/toast-type.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { ToastData, ToastOptions } from '@shared/interfaces/ui/toast.interface';
import { isApiError } from '@shared/utils/guards';

const REFERENCE_LENGTH = 8;

/**
 * Toasts in the top-right corner, one style per ToastType. Success / info / warning return an Observable that emits
 * when the action (e.g. Undo) is clicked; errors carry the request id for support.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action?: string, duration?: number): Observable<void> {
    return this.show(ToastType.Success, message, { action, duration });
  }

  info(message: string, action?: string, duration?: number): Observable<void> {
    return this.show(ToastType.Info, message, { action, duration });
  }

  warning(message: string, options?: ToastOptions): Observable<void> {
    return this.show(ToastType.Warning, message, options);
  }

  error(error: ApiError | string | unknown, options?: ToastOptions): void {
    const message =
      typeof error === 'string'
        ? error
        : isApiError(error)
          ? error.message
          : 'Something went wrong.';
    const reference = isApiError(error) ? error.requestId?.slice(0, REFERENCE_LENGTH) : undefined;
    this.show(ToastType.Error, message, options, reference);
  }

  /** Any toast type; emits when its action is clicked. */
  show(
    type: ToastType,
    message: string,
    options: ToastOptions = {},
    reference?: string,
  ): Observable<void> {
    const style = TOAST_STYLES[type];
    const duration = options.duration ?? style.duration;
    const data: ToastData = {
      type,
      title: options.title ?? style.title,
      message,
      action: options.action,
      reference,
      duration,
    };

    return this.snackBar
      .openFromComponent(Toast, {
        data,
        duration,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: 'toast-panel',
        politeness: style.politeness,
      })
      .onAction()
      .pipe(map(() => undefined));
  }
}
