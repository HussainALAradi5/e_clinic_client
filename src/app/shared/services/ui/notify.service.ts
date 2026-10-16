import { inject, Injectable, Injector } from '@angular/core';
import type { MatSnackBar } from '@angular/material/snack-bar';
import { from, map, Observable, share, switchMap } from 'rxjs';
import type { Toast } from '@shared/components/toast/toast.component';
import { TOAST_STYLES } from '@shared/constants/toast.constants';
import { ToastType } from '@shared/enums/ui/toast-type.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { ToastData, ToastOptions } from '@shared/interfaces/ui/toast.interface';
import { isApiError } from '@shared/utils/guards';

const REFERENCE_LENGTH = 8;

/** Snack bar + toast component, downloaded on the first toast so they stay out of the start-up bundle. */
interface ToastKit {
  snackBar: MatSnackBar;
  component: typeof Toast;
}

/**
 * Toasts in the top-right corner, one style per ToastType. Success / info / warning return an Observable that emits
 * when the action (e.g. Undo) is clicked; errors carry the request id for support.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly injector = inject(Injector);
  private kit: Promise<ToastKit> | null = null;
  private loaded: ToastKit | null = null;

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

  /** Closes the toast on screen (e.g. an old error once the user has moved on). */
  dismiss(): void {
    this.loaded?.snackBar.dismiss();
  }

  /** Any toast type; opens at once and emits when its action is clicked. */
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

    const action$ = from(this.load()).pipe(
      switchMap(({ snackBar, component }) =>
        snackBar
          .openFromComponent(component, {
            data,
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: 'toast-panel',
            politeness: style.politeness,
          })
          .onAction(),
      ),
      map(() => undefined),
      share(),
    );
    // Open now, whether or not the caller listens for the action.
    action$.subscribe();
    return action$;
  }

  private load(): Promise<ToastKit> {
    this.kit ??= Promise.all([
      import('@angular/material/snack-bar'),
      import('@shared/components/toast/toast.component'),
    ]).then(([material, toast]) => {
      this.loaded = { snackBar: this.injector.get(material.MatSnackBar), component: toast.Toast };
      return this.loaded;
    });
    return this.kit;
  }
}
