import { inject, Injectable, Injector } from '@angular/core';
import type { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, from, map, Observable, share, switchMap } from 'rxjs';
import type { Toast } from '@components/common/toast/toast.component';
import { TOAST_STYLES } from '@constants/toast.constants';
import { ToastType } from '@enums/ui/toast-type.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { ToastData, ToastOptions } from '@interfaces/ui/toast.interface';
import { isApiError } from '@utilities/guards';
import { ToastKit } from '@interfaces/ui/notify.interface';

/**
 * Toasts in the top-right corner, one style per ToastType. Success / info / warning return an Observable that emits
 * when the action (e.g. Undo) is clicked; errors carry the request id for support.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly injector = inject(Injector);
  private kit: Promise<ToastKit | null> | null = null;
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
    // The request id stays in the server log; users only see what went wrong.
    this.show(ToastType.Error, message, options);
  }

  /** Closes the toast on screen (e.g. an old error once the user has moved on). */
  dismiss(): void {
    this.loaded?.snackBar.dismiss();
  }

  /** Any toast type; opens at once and emits when its action is clicked. */
  show(type: ToastType, message: string, options: ToastOptions = {}): Observable<void> {
    const style = TOAST_STYLES[type];
    const duration = options.duration ?? style.duration;
    const data: ToastData = {
      type,
      title: options.title ?? style.title,
      message,
      action: options.action,
      duration,
    };

    const action$ = from(this.load()).pipe(
      switchMap((kit) =>
        !kit
          ? EMPTY
          : kit.snackBar
              .openFromComponent(kit.component, {
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

  /** Null when the app was torn down while the toast code was downloading (nothing left to show it in). */
  private load(): Promise<ToastKit | null> {
    this.kit ??= Promise.all([
      import('@angular/material/snack-bar'),
      import('@components/common/toast/toast.component'),
    ]).then(([material, toast]) => {
      try {
        this.loaded = { snackBar: this.injector.get(material.MatSnackBar), component: toast.Toast };
      } catch {
        this.kit = null;
      }
      return this.loaded;
    });
    return this.kit;
  }
}
